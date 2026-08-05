namespace CrmEmailService.DTOs;

public class EmailResponse
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;
}