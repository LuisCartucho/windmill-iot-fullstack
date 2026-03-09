using Api;
using Api.Services;
using DataAccess;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
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
        policy.WithOrigins(
                "http://localhost:5173",
                "https://client-windmill.fly.dev"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<AuthService>();
builder.Services.AddHostedService<TelemetryCleanupService>();

var app = builder.Build();

// --- middleware order matters ---
app.UseRouting();

app.UseCors("dev");

// If/when you add auth, keep these here:
// app.UseAuthentication();
// app.UseAuthorization();

// Swagger is fine here
app.UseOpenApi();
app.UseSwaggerUi();

app.MapControllers();

// Connect MQTT (TCP) - best effort so API can still start
var mqttHost = builder.Configuration["Mqtt__Host"] ?? "broker.hivemq.com";
var mqttPort = int.TryParse(builder.Configuration["Mqtt__Port"], out var p) ? p : 1883;

try
{
    var mqtt = app.Services.GetRequiredService<IMqttClientService>();
    await mqtt.ConnectAsync(mqttHost, mqttPort);
    app.Logger.LogInformation("MQTT connected to {Host}:{Port}", mqttHost, mqttPort);
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "MQTT connect failed; disabling MQTT subscriptions.");
}

app.Run();