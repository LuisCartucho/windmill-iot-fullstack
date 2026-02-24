namespace WindFarm.Api.Data.Entities;

public class Turbine
{
    public string Id { get; set; } = default!;      // e.g. "turbine-alpha"
    public string FarmId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Location { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}