using System.Security.Claims;
using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/farms/{farmId}/turbines")]
public class TurbineControlController : ControllerBase
{
    private readonly TurbineCommandService _commandService;

    public TurbineControlController(TurbineCommandService commandService)
    {
        _commandService = commandService;
    }

    [Authorize]
    [HttpPost("{turbineId}/command")]
    public async Task<IActionResult> SendCommand(
        string farmId,
        string turbineId,
        [FromBody] TurbineCommandDto dto)
    {
        var username =
            User.FindFirst(ClaimTypes.Name)?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("unique_name")?.Value ??
            User.FindFirst("nickname")?.Value ??
            User.Identity?.Name;

        var (ok, error) = await _commandService.SendCommandAsync(
            farmId,
            turbineId,
            dto.Command,
            username);

        if (!ok)
            return BadRequest(new { error });

        return Ok(new
        {
            ok = true,
            farmId,
            turbineId,
            command = dto.Command,
            by = username,
            timestamp = DateTime.UtcNow
        });
    }
}