namespace Api.DTOs;

public class TurbineCommandDto
{
    public string? Command { get; set; }
    public int? Value { get; set; }   // for setInterval
    public double? Angle { get; set; } // for setPitch
    public string? Reason { get; set; } // optional for stop
}