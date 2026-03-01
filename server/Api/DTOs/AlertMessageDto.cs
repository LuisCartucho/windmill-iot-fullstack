namespace Api.DTOs;

public class AlertMessageDto
{
    public string TurbineId { get; set; } = default!;
    public string FarmId { get; set; } = default!;
    public DateTime Timestamp { get; set; }
    public string Severity { get; set; } = default!;
    public string Message { get; set; } = default!;
}