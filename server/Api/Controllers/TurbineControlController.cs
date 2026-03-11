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

    [HttpPost("{turbineId}/command")]
    [Authorize(Policy = "OperatorOnly")]
    public async Task<IActionResult> SendCommand(
        string farmId,
        string turbineId,
        [FromBody] TurbineCommandDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Command))
            return BadRequest(new { error = "Command is required" });

        var username =
            User.FindFirst(ClaimTypes.Name)?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("unique_name")?.Value ??
            User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(username))
            return Unauthorized();

        var (ok, error) = await _commandService.SendCommandAsync(
            farmId,
            turbineId,
            dto.Command,
            username,
            dto.Value,
            dto.Angle,
            dto.Reason);

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