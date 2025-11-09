namespace ToDoApi.DTOs;

public class CreateTaskDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    private DateTime? _dueDate;
    public DateTime? DueDate
    {
        get => _dueDate;
        set => _dueDate = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : value;
    }
    public int Priority { get; set; } = 3; // 1-5
}