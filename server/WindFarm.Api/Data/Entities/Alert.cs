namespace WindFarm.Api.Data.Entities;

public enum AlertSeverity { Info, Warning, Critical }
public enum AlertStatus { Open, Ack, Resolved }

public class Alert
{
    public long Id { get; set; }
    public string TurbineId { get; set; } = default!;
    public string FarmId { get; set; } = default!;
    public DateTimeOffset Ts { get; set; }
    public AlertSeverity Severity { get; set; }
    public string Type { get; set; } = default!;
    public string Message { get; set; } = default!;
    public AlertStatus Status { get; set; } = AlertStatus.Open;
}