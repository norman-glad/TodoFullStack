using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ToDoApi.Models;
using ToDoApi.DTOs; // Optional, for IntelliSense
using ToDoApi.Controllers; // Optional
using Microsoft.AspNetCore.HttpOverrides; // <--- NEW: For Azure App Service HTTPS fix

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
// 3. Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>(opts =>
{
    opts.Password.RequiredLength = 6;
    opts.Password.RequireNonAlphanumeric = false;
    opts.Password.RequireDigit = false;
    opts.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddScoped<UserManager<IdentityUser>>();
builder.Services.AddScoped<SignInManager<IdentityUser>>();

// 4. JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ToDo API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }}, [] }
    });
});

builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod());

// --- 5. SWAGGER ENABLED IN PRODUCTION (OPTIONAL BUT RECOMMENDED FOR TESTING) ---
// Note: We are removing the if (app.Environment.IsDevelopment()) check
app.UseSwagger();
app.UseSwaggerUI();


// Auto create DB + migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();  // <--- THIS CREATES DB + TABLES AUTOMATICALLY
}

// --- 6. ADDED FORWARDED HEADERS MIDDLEWARE ---
// MUST be called before UseHttpsRedirection()
app.UseForwardedHeaders(); 

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();  // <-- AUTO APPLIES ALL MIGRATIONS ON STARTUP!
    Console.WriteLine("Migrations applied successfully!");
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5058";
app.Run($"http://0.0.0.0:{port}");