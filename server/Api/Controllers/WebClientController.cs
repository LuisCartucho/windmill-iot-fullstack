using DataAccess;
using DataAccess.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.EfRealtime;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebClientController(
    ISseBackplane backplane,
    IRealtimeManager realtimeManager,
    WindFarmDbContext db
) : RealtimeControllerBase(backplane)
{
    // Initial chart/list snapshot only (small payload)
    // GET /api/WebClient/GetTelemetry?farmId=...&turbineId=...&take=50
    [HttpGet(nameof(GetTelemetry))]
    public async Task<List<Telemetry>> GetTelemetry(
        string? farmId,
        string? turbineId,
        int take = 50)
    {
        take = Math.Clamp(take, 1, 200);

        var q = db.Telemetries.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            q = q.Where(t => t.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            q = q.Where(t => t.TurbineId == turbineId);

        var latest = await q
            .OrderByDescending(t => t.Timestamp)
            .Take(take)
            .ToListAsync();

        return latest
            .OrderBy(t => t.Timestamp)
            .ToList();
    }

    // Live latest telemetry only for transfer
    // GET /api/WebClient/GetTelemetryLatest?connectionId=...&farmId=...&turbineId=...
    [HttpGet(nameof(GetTelemetryLatest))]
    public async Task<RealtimeListenResponse<Telemetry?>> GetTelemetryLatest(
        string connectionId,
        string? farmId,
        string? turbineId)
    {
        var group = $"telemetry:latest:{farmId ?? "all"}:{turbineId ?? "all"}";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<WindFarmDbContext>(
            connectionId,
            group,
            criteria: snap => snap.HasChanges<Telemetry>(),
            query: async ctx =>
            {
                var q = ctx.Telemetries.AsNoTracking();

                if (!string.IsNullOrWhiteSpace(farmId))
                    q = q.Where(t => t.FarmId == farmId);

                if (!string.IsNullOrWhiteSpace(turbineId))
                    q = q.Where(t => t.TurbineId == turbineId);

                return await q
                    .OrderByDescending(t => t.Timestamp)
                    .FirstOrDefaultAsync();
            });

        var initialQ = db.Telemetries.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            initialQ = initialQ.Where(t => t.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            initialQ = initialQ.Where(t => t.TurbineId == turbineId);

        var initial = await initialQ
            .OrderByDescending(t => t.Timestamp)
            .FirstOrDefaultAsync();

        return new RealtimeListenResponse<Telemetry?>(group, initial);
    }

    // Initial alerts snapshot only 
    // GET /api/WebClient/GetAlerts?farmId=...&turbineId=...&take=50
    [HttpGet(nameof(GetAlerts))]
    public async Task<List<Alert>> GetAlerts(
        string? farmId,
        string? turbineId,
        int take = 50)
    {
        take = Math.Clamp(take, 1, 200);

        var q = db.Alerts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            q = q.Where(a => a.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            q = q.Where(a => a.TurbineId == turbineId);

        return await q
            .OrderByDescending(a => a.Timestamp)
            .Take(take)
            .ToListAsync();
    }

    // Live latest alert only, for transfer
    // GET /api/WebClient/GetAlertLatest?connectionId=...&farmId=...&turbineId=...
    [HttpGet(nameof(GetAlertLatest))]
    public async Task<RealtimeListenResponse<Alert?>> GetAlertLatest(
        string connectionId,
        string? farmId,
        string? turbineId)
    {
        var group = $"alerts:latest:{farmId ?? "all"}:{turbineId ?? "all"}";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<WindFarmDbContext>(
            connectionId,
            group,
            criteria: snap => snap.HasChanges<Alert>(),
            query: async ctx =>
            {
                var q = ctx.Alerts.AsNoTracking();

                if (!string.IsNullOrWhiteSpace(farmId))
                    q = q.Where(a => a.FarmId == farmId);

                if (!string.IsNullOrWhiteSpace(turbineId))
                    q = q.Where(a => a.TurbineId == turbineId);

                return await q
                    .OrderByDescending(a => a.Timestamp)
                    .FirstOrDefaultAsync();
            });

        var initialQ = db.Alerts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            initialQ = initialQ.Where(a => a.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            initialQ = initialQ.Where(a => a.TurbineId == turbineId);

        var initial = await initialQ
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        return new RealtimeListenResponse<Alert?>(group, initial);
    }
}