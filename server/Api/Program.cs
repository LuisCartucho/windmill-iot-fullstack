using Api;
using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Mqtt.Controllers;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.GroupRealtime;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
var envFile = $".env.{env.ToLower()}";

if (File.Exists(envFile))
{
    Env.Load(envFile);
}

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers();

// OpenAPI (NSwag)
builder.Services.AddOpenApiDocument();

// SSE realtime
builder.Services.AddInMemorySseBackplane();
builder.Services.AddEfRealtime();
builder.Services.AddGroupRealtime();

// DB: AddEfRealtimeInterceptor
builder.Services.AddDbContext<WindFarmDbContext>((sp, options) =>
{
    var cs = builder.Configuration.GetConnectionString("db");
    if (string.IsNullOrWhiteSpace(cs))
        throw new InvalidOperationException("Missing connection string: ConnectionStrings:db");

    options.UseNpgsql(cs);

    // REQUIRED for EF realtime subscriptions
    options.AddEfRealtimeInterceptor(sp);
});

builder.Services.AddMqttControllers();

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
app.GenerateApiClientsFromOpenApi("../../client/src/generated-ts-client.ts", "./openapi.json")
    .GetAwaiter().GetResult();

app.Run();