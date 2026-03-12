using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class TelemetryCleanupService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<TelemetryCleanupService> _logger;

    private static readonly TimeSpan RunEvery = TimeSpan.FromMinutes(15);
    private const int RetentionHours = 24;

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

                var deleted = await db.Database.ExecuteSqlRawAsync($"""
                                                                        DELETE FROM iot_windfarm."Telemetry"
                                                                        WHERE "Timestamp" < NOW() - INTERVAL '{RetentionHours} hours'
                                                                    """, stoppingToken);

                if (deleted > 0)
                    _logger.LogInformation("Deleted {Count} old telemetry rows", deleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Telemetry cleanup failed");
            }

            await Task.Delay(RunEvery, stoppingToken);
        }
    }
}