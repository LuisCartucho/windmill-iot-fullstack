using Microsoft.EntityFrameworkCore;
using WindFarm.Api.Data;
using DotNetEnv;

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
var envFile = $".env.{env.ToLower()}";
if (File.Exists(envFile))
{
    Env.Load(envFile);
}

var builder = WebApplication.CreateBuilder(args);

// Allow environment variables to override appsettings (great for deployment)
builder.Configuration.AddEnvironmentVariables();

//
// -------------------------
// Services
// -------------------------
//

builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core (PostgreSQL)
builder.Services.AddDbContext<WindFarmDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("db")));

// CORS for React (Vite runs on 5173)
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

// Auth will be added later; keep these commented until then
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(...);

var app = builder.Build();

//
// -------------------------
// Middleware
// -------------------------
//

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("dev");

// Only enable these when you add authentication services
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();