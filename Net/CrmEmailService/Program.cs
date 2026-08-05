
namespace CrmEmailService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            

            var app = builder.Build();

            // Configure HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }




            app.MapControllers();

            app.Run();
        }
    }
}
