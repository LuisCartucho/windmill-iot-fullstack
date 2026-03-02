namespace Api.Services;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DataAccess;
using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;



public class AuthService(WindFarmDbContext db, IConfiguration config)
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    public async Task<(bool ok, string? token, string? nickname, string? error)> LoginAsync(string username, string password)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == username);
        if (user is null) return (false, null, null, "Invalid credentials");

        if (!VerifyPassword(password, user.Salt, user.Hash))
            return (false, null, null, "Invalid credentials");

        var jwtKey = config["Jwt__Key"] ?? config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
            return (false, null, null, "JWT key missing (Jwt__Key)");

        var token = CreateJwt(user, jwtKey);
        return (true, token, user.Nickname, null);
    }

    // dev only
    public async Task<string> SeedAdminAsync()
    {
        var id = "admin";
        if (await db.Users.AnyAsync(u => u.Id == id))
            return "admin already exists";

        var (saltB64, hashB64) = HashPassword("Password123!");

        db.Users.Add(new User
        {
            Id = id,
            Nickname = "Administrator",
            Salt = saltB64,
            Hash = hashB64
        });

        await db.SaveChangesAsync();
        return "Created admin / Password123!";
    }

    private static (string saltB64, string hashB64) HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: Iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: KeySize
        );

        return (Convert.ToBase64String(salt), Convert.ToBase64String(hash));
    }

    private static bool VerifyPassword(string password, string saltB64, string hashB64)
    {
        byte[] salt, expectedHash;
        try
        {
            salt = Convert.FromBase64String(saltB64);
            expectedHash = Convert.FromBase64String(hashB64);
        }
        catch
        {
            return false;
        }

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: Iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: expectedHash.Length
        );

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private static string CreateJwt(User user, string secret)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Id),
            new Claim("nickname", user.Nickname)
        };

        var jwt = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}