using Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService auth) : ControllerBase
{
    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (ok, token, nickname, error) = await auth.LoginAsync(req.Username, req.Password);
        if (!ok) return Unauthorized(error);

        return Ok(new { token, nickname });
    }

    [HttpPost("seed-admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> SeedAdmin()
    {
        var msg = await auth.SeedAdminAsync();
        return Ok(msg);
    }
    
    [HttpPost("seed-operator")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> SeedOperator()
    {
        var msg = await auth.SeedOperatorAsync();
        return Ok(msg);
    }
}