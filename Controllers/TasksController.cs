using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApi.DTOs;
using ToDoApi.Models;

namespace ToDoApi.Controllers;

[Route("api/tasks")]
[ApiController]
[Authorize] // All endpoints require JWT
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<IdentityUser> _userManager;

    public TasksController(AppDbContext db, UserManager<IdentityUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    private string GetUserId() => _userManager.GetUserId(User)!;

    // GET: api/tasks?page=1&pageSize=10&completed=true&search=milk
    [HttpGet]
    public async Task<ActionResult<PagedResponseDto<TaskResponseDto>>> GetTasks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? completed = null,
        [FromQuery] string? search = null)
    {
        var userId = GetUserId();
        var query = _db.Tasks.Where(t => t.UserId == userId);

        if (completed.HasValue)
            query = query.Where(t => t.IsCompleted == completed.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));

        var total = await query.CountAsync();

        var tasks = await query
            .OrderByDescending(t => t.DueDate ?? DateTime.MaxValue)
            .ThenByDescending(t => t.Priority)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResponseDto<TaskResponseDto>
        {
            Items = tasks,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    // GET: api/tasks/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponseDto>> GetTask(Guid id)
    {
        var task = await _db.Tasks
            .Where(t => t.UserId == GetUserId() && t.Id == id)
            .FirstOrDefaultAsync();

        if (task == null) return NotFound();

        return Ok(new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt
        });
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var userId = GetUserId();
        
        // Check if user exists
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return BadRequest($"User with ID {userId} does not exist in the database. Please logout and register again.");
        }
        
        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
            Priority = dto.Priority,
            UserId = userId,
            CreatedAt = DateTime.UtcNow 
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt
        });
    }

    // PUT: api/tasks/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUserId());

        if (task == null) return NotFound();

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.DueDate != null) task.DueDate = dto.DueDate;
        if (dto.IsCompleted.HasValue) task.IsCompleted = dto.IsCompleted.Value;
        if (dto.Priority.HasValue) task.Priority = dto.Priority.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/tasks/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUserId());

        if (task == null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}