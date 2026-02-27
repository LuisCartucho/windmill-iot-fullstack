using efscaffold.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WindFarm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebClientController(WindFarmDbContext db) : ControllerBase
{
    // GET /api/webclient/telemetry?farmId=...&turbineId=...&take=200
    [HttpGet("telemetry")]
    public async Task<List<Telemetry>> Telemetry([FromQuery] string? farmId, [FromQuery] string? turbineId, [FromQuery] int take = 200)
    {
        take = Math.Clamp(take, 1, 500);

        var q = db.Telemetries.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(farmId))
            q = q.Where(t => t.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            q = q.Where(t => t.TurbineId == turbineId);

        return await q
            .OrderByDescending(t => t.Timestamp)
            .Take(take)
            .ToListAsync();
    }

    // GET /api/webclient/alerts?farmId=...&turbineId=...&take=200
    [HttpGet("alerts")]
    public async Task<List<Alert>> Alerts([FromQuery] string? farmId, [FromQuery] string? turbineId, [FromQuery] int take = 200)
    {
        take = Math.Clamp(take, 1, 500);

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
}