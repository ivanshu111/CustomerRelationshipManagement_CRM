using CrmEmailService.DTOs;
using CrmEmailService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrmEmailService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService emailService;
    private readonly IConfiguration configuration;

    public EmailController(
        IEmailService emailService,
        IConfiguration configuration)
    {
        this.emailService = emailService;
        this.configuration = configuration;
    }


    [HttpPost("send")]
    public async Task<ActionResult<EmailResponse>> SendEmail(
        [FromHeader(Name = "X-API-Key")] string apiKey,
        [FromBody] EmailRequest request)
    {
        var configuredApiKey = configuration["ApiSecurity:ApiKey"];

        if (string.IsNullOrEmpty(apiKey) || apiKey != configuredApiKey)
        {
            return Unauthorized("Invalid API Key.");
        }


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