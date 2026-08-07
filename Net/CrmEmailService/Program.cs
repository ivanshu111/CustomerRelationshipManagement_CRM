using CrmEmailService.Configuration;
using CrmEmailService.Services;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);


// Load .env
Env.Load();


// Add environment variables
builder.Configuration.AddEnvironmentVariables();


// Add services
builder.Services.AddControllers();


// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Email configuration
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));


// Dependency Injection
builder.Services.AddScoped<IEmailService, EmailService>();


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection();

app.MapControllers();

app.Run();