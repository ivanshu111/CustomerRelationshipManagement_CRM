using CrmEmailService.Configuration;
using CrmEmailService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuration
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Dependency Injection
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();



//app.UseHttpsRedirection();

app.MapControllers();

app.Run();