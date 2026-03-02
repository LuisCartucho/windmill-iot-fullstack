using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Mqtt.Controllers;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
var envFile = $".env.{env.ToLower()}";

if (File.Exists(envFile))
{
    Env.Load(envFile);
}

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddMqttControllers();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();
builder.Services.AddDbContext<WindFarmDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("db"))
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<AuthService>();

var app = builder.Build();

app.UseCors("dev");
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();

// Connect MQTT (TCP)
var mqtt = app.Services.GetRequiredService<IMqttClientService>();
await mqtt.ConnectAsync("broker.hivemq.com", 1883);

app.Run();