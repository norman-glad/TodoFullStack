using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ToDoApi.Models;
using ToDoApi.DTOs;
using ToDoApi.Controllers;
using Microsoft.AspNetCore.HttpOverrides;

using System;

// ADD THESE TWO LINES AT THE VERY TOP (before builder)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURE FORWARDED HEADERS (THE FIX) ---
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = 
        ForwardedHeaders.XForwardedFor | 
        ForwardedHeaders.XForwardedProto;
    // CRITICAL: Clear known networks/proxies to trust everything coming from Azure's internal network
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// 2. PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres") ?? 
                      "Host=localhost;Database=todo;Username=postgres;Password=Pass123!"));

// 3. Identity - Use AddIdentityCore instead of AddIdentity to avoid cookie auth
builder.Services.AddIdentityCore<IdentityUser>(opts =>
{
    opts.Password.RequiredLength = 6;
    opts.Password.RequireNonAlphanumeric = false;
    opts.Password.RequireDigit = false;
    opts.Password.RequireUppercase = false;
    opts.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 4. JWT Authentication - Configure PROPERLY before AddControllers
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "ToDoApi",
        ValidAudience = "ToDoClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SuperSecretKey1234567890!@#$%^&*()"))
    };
    
    // Important for API-only auth
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine("OnChallenge: JWT token is missing or invalid");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 5. CORS - Configure PROPERLY
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // React dev server
                "https://localhost:3000", // React dev server with HTTPS
                "http://localhost:5000",  // Your dev server
                "https://todoapi-norm-d4ere5eda0hje8e6.canadacentral-01.azurewebsites.net" // Your production backend
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Important if you use cookies, but we're using JWT
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ToDo API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { 
            new OpenApiSecurityScheme { 
                Reference = new OpenApiReference { 
                    Type = ReferenceType.SecurityScheme, 
                    Id = "Bearer" 
                } 
            }, 
            new string[] { } 
        } 
    });
});

var app = builder.Build();

// --- MIDDLEWARE ORDER IS CRITICAL ---

// 1. Forwarded Headers FIRST
app.UseForwardedHeaders(); 

// 2. CORS BEFORE Authentication
app.UseCors();

// 3. Swagger (order doesn't matter much for this)
app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDo API v1");
    c.RoutePrefix = string.Empty; // Set Swagger UI at root
});

// 4. HTTPS Redirection (optional for APIs, but good practice)
app.UseHttpsRedirection();

// 5. Authentication BEFORE Authorization
app.UseAuthentication();

// 6. Authorization
app.UseAuthorization();

// 7. Controllers
app.MapControllers();

// Auto create DB + migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Console.WriteLine("Migrations applied successfully!");
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5058";
app.Run($"http://0.0.0.0:{port}");