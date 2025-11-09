using Microsoft.AspNetCore.Identity;

namespace ToDoApi.Models;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public bool IsCompleted { get; set; } = false;

    public int Priority { get; set; } = 3;

    public string UserId { get; set; } = null!;

    public IdentityUser User { get; set; } = null!;

    // REAL CreatedAt – auto-set by DB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}