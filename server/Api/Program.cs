using System.Text;
using Api;
using Api.Services;
using DataAccess;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mqtt.Controllers;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.GroupRealtime;
using System.Security.Claims;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
var envFile = $".env.{env.ToLower()}";

if (File.Exists(envFile))
{
    Env.Load(envFile);
}

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers();
// =======================
// Authentication + JWT
// =======================
var jwtKey = builder.Configuration["Jwt__Key"] ?? builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("JWT key missing (Jwt__Key)");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });
// =======================
// Authorization Policies
// =======================
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAssertion(context =>
        {
            var userId =
                context.User.FindFirst(ClaimTypes.Name)?.Value ??
                context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                context.User.FindFirst("sub")?.Value ??
                context.User.FindFirst("unique_name")?.Value ??
                context.User.Identity?.Name;

            return userId == "admin";
        }));

    options.AddPolicy("OperatorOnly", policy =>
        policy.RequireAssertion(context =>
        {
            var userId =
                context.User.FindFirst(ClaimTypes.Name)?.Value ??
                context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                context.User.FindFirst("sub")?.Value ??
                context.User.FindFirst("unique_name")?.Value ??
                context.User.Identity?.Name;

            return userId == "operator";
        }));

    options.AddPolicy("OperatorOrAdmin", policy =>
        policy.RequireAssertion(context =>
        {
            var userId =
                context.User.FindFirst(ClaimTypes.Name)?.Value ??
                context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                context.User.FindFirst("sub")?.Value ??
                context.User.FindFirst("unique_name")?.Value ??
                context.User.Identity?.Name;

            return userId == "admin" || userId == "operator";
        }));
});

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
// =======================
// CORS
// =======================
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
// =======================
// Services
// =======================
builder.Services.AddScoped<AuthService>();
builder.Services.AddHostedService<TelemetryCleanupService>();
builder.Services.AddScoped<TurbineCommandService>();

var app = builder.Build();

app.UseRouting();

app.UseCors("dev");

app.UseAuthentication();
app.UseAuthorization();

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

app.GenerateApiClientsFromOpenApi(
    "./../../client/src/generated-ts-client.ts",
    "./openapi.json"
).GetAwaiter().GetResult();

app.Run();