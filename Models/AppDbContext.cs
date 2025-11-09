using Microsoft.AspNetCore.Identity;  // <-- THIS LINE FIXES IdentityUser
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ToDoApi.Models;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        
        b.Entity<TaskItem>().HasIndex(t => t.UserId);
        b.Entity<TaskItem>().HasIndex(t => t.IsCompleted);
        b.Entity<TaskItem>().HasIndex(t => t.DueDate);

        b.Entity<TaskItem>().Property(t => t.CreatedAt).HasDefaultValueSql("NOW()");
    }
}