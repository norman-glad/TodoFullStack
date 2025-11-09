namespace ToDoApi.DTOs;

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    private DateTime? _dueDate;
    public DateTime? DueDate
    {
        get => _dueDate;
        set => _dueDate = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : value;
    }
    public bool? IsCompleted { get; set; }
    public int? Priority { get; set; }
}