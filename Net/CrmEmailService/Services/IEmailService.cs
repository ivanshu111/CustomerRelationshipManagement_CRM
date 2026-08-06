using CrmEmailService.DTOs;

namespace CrmEmailService.Services;

public interface IEmailService
{
    Task<EmailResponse> SendEmailAsync(EmailRequest request);
}