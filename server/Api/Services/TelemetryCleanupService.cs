using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class TelemetryCleanupService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<TelemetryCleanupService> _logger;

    public TelemetryCleanupService(
        IServiceProvider services,
        ILogger<TelemetryCleanupService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<WindFarmDbContext>();

                var deleted = await db.Database.ExecuteSqlRawAsync("""
                                                                       DELETE FROM iot_windfarm."Telemetry"
                                                                       WHERE "Timestamp" < NOW() - INTERVAL '1 day'
                                                                   """);

                if (deleted > 0)
                    _logger.LogInformation("Deleted {Count} old telemetry rows", deleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Telemetry cleanup failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}