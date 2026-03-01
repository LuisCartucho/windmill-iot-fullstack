namespace DataAccess.Entities;

public partial class Command
{
    public Guid Id { get; set; }

    public string FarmId { get; set; } = null!;

    public string TurbineId { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public string Action { get; set; } = null!;

    public string Payload { get; set; } = null!;
}
