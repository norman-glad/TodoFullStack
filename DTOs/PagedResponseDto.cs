namespace ToDoApi.DTOs;

public class PagedResponseDto<T>
{
    public List<T> Items { get; set; } = null!;
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}