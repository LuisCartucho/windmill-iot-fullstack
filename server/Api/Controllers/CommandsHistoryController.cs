using DataAccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "OperatorOrAdmin")]
public class CommandsController(WindFarmDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHistory(
        [FromQuery] string? farmId,
        [FromQuery] string? turbineId,
        [FromQuery] int take = 50)
    {
        if (take <= 0) take = 50;
        if (take > 200) take = 200;

        var query = db.Commands
            .AsNoTracking()
            .Include(c => c.User) // <-- join Users table
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(farmId))
            query = query.Where(c => c.FarmId == farmId);

        if (!string.IsNullOrWhiteSpace(turbineId))
            query = query.Where(c => c.TurbineId == turbineId);

        var items = await query
            .OrderByDescending(c => c.Timestamp)
            .Take(take)
            .Select(c => new
            {
                c.Id,
                c.FarmId,
                c.TurbineId,
                c.UserId,
                UserNickname = c.User.Nickname, // <-- return nickname
                c.Timestamp,
                c.Action,
                c.Payload
            })
            .ToListAsync();

        return Ok(items);
    }
}