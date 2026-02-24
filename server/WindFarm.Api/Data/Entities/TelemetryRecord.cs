namespace WindFarm.Api.Data.Entities;

public class TelemetryRecord
{
    public long Id { get; set; }
    public string TurbineId { get; set; } = default!;
    public string FarmId { get; set; } = default!;
    public DateTimeOffset Ts { get; set; }

    public double WindSpeed { get; set; }
    public double WindDirection { get; set; }
    public double AmbientTemperature { get; set; }
    public double RotorSpeed { get; set; }
    public double PowerOutput { get; set; }
    public double NacelleDirection { get; set; }
    public double BladePitch { get; set; }

    public string? RawJson { get; set; } // optional debug/future-proof
}
