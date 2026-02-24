namespace WindFarm.Api.Data.Entities;

public enum ActionResultStatus { Accepted, Rejected, Published, Failed }

public class OperatorAction
{
    public long Id { get; set; }
    public DateTimeOffset Ts { get; set; } = DateTimeOffset.UtcNow;

    public string OperatorId { get; set; } = default!;
    public string TurbineId { get; set; } = default!;
    public string FarmId { get; set; } = default!;

    public string CommandType { get; set; } = default!;
    public string PayloadJson { get; set; } = default!;
    public ActionResultStatus Result { get; set; }
    public string? Reason { get; set; }
}