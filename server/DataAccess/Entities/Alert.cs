namespace DataAccess.Entities;

public partial class Alert
{
    public Guid Id { get; set; }

    public string FarmId { get; set; } = null!;

    public string TurbineId { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public string Severity { get; set; } = null!;

    public string Message { get; set; } = null!;
}
