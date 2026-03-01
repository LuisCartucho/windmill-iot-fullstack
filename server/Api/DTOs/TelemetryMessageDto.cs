namespace Api.DTOs;

public class TelemetryMessageDto
{
    public string TurbineId { get; set; } = default!;
    public string TurbineName { get; set; } = default!;
    public string FarmId { get; set; } = default!;
    public DateTime Timestamp { get; set; }

    public double WindSpeed { get; set; }
    public double WindDirection { get; set; }
    public double AmbientTemperature { get; set; }
    public double RotorSpeed { get; set; }
    public double PowerOutput { get; set; }
    public double NacelleDirection { get; set; }
    public double BladePitch { get; set; }
    public double GeneratorTemp { get; set; }
    public double GearboxTemp { get; set; }
    public double Vibration { get; set; }
    public string Status { get; set; } = default!;
}