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
    // GET /api/webclient/telemetry?farmId=...&turbineId=...&take=200
    [HttpGet(nameof(GetTelemetry))]
    public async Task<RealtimeListenResponse<List<Telemetry>>> GetTelemetry(
        string connectionId,
        string? farmId,
        string? turbineId,
        int take = 200)
    {
        take = Math.Clamp(take, 1, 500);

        // Group name includes filters so different pages don't overwrite each other
        var group = $"telemetry:{farmId ?? "all"}:{turbineId ?? "all"}";
        await backplane.Groups.AddToGroupAsync(connectionId, group);

        // Subscribe: whenever Telemetry changes, push a new snapshot to the client
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

                // Return latest N (descending), then reorder ascending for charts
                var latest = await q
                    .OrderByDescending(t => t.Timestamp)
                    .Take(take)
                    .ToListAsync();

                return latest
                    .OrderBy(t => t.Timestamp)
                    .ToList();
            });

        // Initial snapshot immediately returned to UI (same ordering as chart needs)
        var initialQ = db.Telemetries.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            initialQ = initialQ.Where(t => t.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            initialQ = initialQ.Where(t => t.TurbineId == turbineId);

        var initialLatest = await initialQ
            .OrderByDescending(t => t.Timestamp)
            .Take(take)
            .ToListAsync();

        var initial = initialLatest
            .OrderBy(t => t.Timestamp)
            .ToList();

        return new RealtimeListenResponse<List<Telemetry>>(group, initial);
    }

    // GET /api/webclient/alerts?farmId=...&turbineId=...&take=200
    [HttpGet(nameof(GetAlerts))]
    public async Task<RealtimeListenResponse<List<Alert>>> GetAlerts(
        string connectionId,
        string? farmId,
        string? turbineId,
        int take = 200)
    {
        take = Math.Clamp(take, 1, 500);

        var group = $"alerts:{farmId ?? "all"}:{turbineId ?? "all"}";
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
                    .Take(take)
                    .ToListAsync();
            });

        // Initial snapshot immediately returned to UI
        var initialQ = db.Alerts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            initialQ = initialQ.Where(a => a.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            initialQ = initialQ.Where(a => a.TurbineId == turbineId);

        var initial = await initialQ
            .OrderByDescending(a => a.Timestamp)
            .Take(take)
            .ToListAsync();

        return new RealtimeListenResponse<List<Alert>>(group, initial);
    }
}