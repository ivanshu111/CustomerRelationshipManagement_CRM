using CrmEmailService.Configuration;
using CrmEmailService.DTOs;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace CrmEmailService.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings emailSettings;

    public EmailService(IOptions<EmailSettings> emailSettings)
    {
        this.emailSettings = emailSettings.Value;
    }

    public async Task<EmailResponse> SendEmailAsync(
        EmailRequest request)
    {
        try
        {
            var email = new MimeMessage();

            email.From.Add(
                new MailboxAddress(
                    emailSettings.SenderName,
                    emailSettings.SenderEmail
                )
            );

            email.To.Add(
                MailboxAddress.Parse(request.To)
            );

            email.Subject = request.Subject;

            var bodyBuilder = new BodyBuilder();

            if (request.IsHtml)
            {
                bodyBuilder.HtmlBody = request.Body;
            }
            else
            {
                bodyBuilder.TextBody = request.Body;
            }

            email.Body = bodyBuilder.ToMessageBody();

            using var smtpClient = new SmtpClient();

            await smtpClient.ConnectAsync(
                emailSettings.SmtpHost,
                emailSettings.SmtpPort,
                SecureSocketOptions.StartTls
            );

            await smtpClient.AuthenticateAsync(
                emailSettings.Username,
                emailSettings.Password
            );

            await smtpClient.SendAsync(email);

            await smtpClient.DisconnectAsync(true);

            return new EmailResponse
            {
                Success = true,
                Message = "Email sent successfully."
            };
        }
        catch (Exception ex)
        {
            return new EmailResponse
            {
                Success = false,
                Message = $"Failed to send email: {ex.Message}"
            };
        }
    }
}