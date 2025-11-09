namespace ToDoApi.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string Email { get; set; } = null!;
}