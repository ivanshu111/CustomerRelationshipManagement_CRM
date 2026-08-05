using CrmEmailService.DTOs;
using CrmEmailService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrmEmailService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService emailService;

    public EmailController(IEmailService emailService)
    {
        this.emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<ActionResult<EmailResponse>> SendEmail(
        [FromBody] EmailRequest request)
    {
        Console.WriteLine("========== REQUEST RECEIVED ==========");
        Console.WriteLine($"To      : {request.To}");
        Console.WriteLine($"Subject : {request.Subject}");
        Console.WriteLine($"Body    : {request.Body}");
        Console.WriteLine($"IsHtml  : {request.IsHtml}");

        var response = await emailService.SendEmailAsync(request);

        Console.WriteLine($"Success : {response.Success}");
        Console.WriteLine($"Message : {response.Message}");

        if (!response.Success)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                response
            );
        }

        return Ok(response);
    }
}