using DataAccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Api.Controllers;

[ApiController]
[Route("sse")]
public class SseController(WindFarmDbContext db) : ControllerBase
{
    [HttpGet("telemetry")]
    public async Task Telemetry([FromQuery] string? farmId, [FromQuery] string? turbineId)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            var q = db.Telemetries.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(farmId))
                q = q.Where(t => t.FarmId == farmId);

            if (!string.IsNullOrWhiteSpace(turbineId))
                q = q.Where(t => t.TurbineId == turbineId);

            var latest = await q
                .OrderByDescending(t => t.Timestamp)
                .Take(20)
                .ToListAsync();

            var json = JsonSerializer.Serialize(latest);

            await Response.WriteAsync($"data: {json}\n\n");
            await Response.Body.FlushAsync();

            await Task.Delay(1000, HttpContext.RequestAborted);
        }
    }
}