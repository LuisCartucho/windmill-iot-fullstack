using System.Text.Json;
using Api.DTOs;
using DataAccess;
using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;

namespace Api.Controllers;

public class IotMqttController(
    ILogger<IotMqttController> logger,
    WindFarmDbContext db
) : MqttController
{
    private static readonly TimeSpan AlertCooldown = TimeSpan.FromMinutes(10);

    [MqttRoute("farm/{farmId}/windmill/{turbineId}/telemetry")]
    public async Task ListenTelemetry(TelemetryMessageDto msg, string farmId, string turbineId)
    {
        logger.LogInformation("MQTT telemetry: {Json}", JsonSerializer.Serialize(msg));

        var timestamp = msg.Timestamp == default ? DateTime.UtcNow : msg.Timestamp;

        var entity = new Telemetry
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            TurbineId = turbineId,
            Timestamp = timestamp,

            WindSpeed = msg.WindSpeed,
            WindDirection = msg.WindDirection,
            AmbientTemperature = msg.AmbientTemperature,
            RotorSpeed = msg.RotorSpeed,
            PowerOutput = msg.PowerOutput,
            NacelleDirection = msg.NacelleDirection,
            BladePitch = msg.BladePitch,
            GeneratorTemp = msg.GeneratorTemp,
            GearboxTemp = msg.GearboxTemp,
            Vibration = msg.Vibration,
            Status = msg.Status
        };

        db.Telemetries.Add(entity);

        await TryCreateAlertAsync(farmId, turbineId, timestamp, "warning",
            msg.GeneratorTemp > 65,
            "Generator temperature elevated");

        await TryCreateAlertAsync(farmId, turbineId, timestamp, "warning",
            string.Equals(msg.Status, "stopped", StringComparison.OrdinalIgnoreCase),
            "Turbine stopped unexpectedly");

        await db.SaveChangesAsync();
    }

    [MqttRoute("farm/{farmId}/windmill/{turbineId}/alert")]
    public async Task ListenAlert(AlertMessageDto msg, string farmId, string turbineId)
    {
        logger.LogWarning("ALERT RECEIVED for {TurbineId}: {Message}", turbineId, msg.Message);
        logger.LogInformation("MQTT alert: {Json}", JsonSerializer.Serialize(msg));

        var timestamp = msg.Timestamp == default ? DateTime.UtcNow : msg.Timestamp;

        var existsRecently = await db.Alerts.AsNoTracking().AnyAsync(a =>
            a.FarmId == farmId &&
            a.TurbineId == turbineId &&
            a.Message == msg.Message &&
            a.Timestamp >= timestamp - AlertCooldown);

        if (existsRecently)
            return;

        var entity = new Alert
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            TurbineId = turbineId,
            Timestamp = timestamp,
            Severity = string.IsNullOrWhiteSpace(msg.Severity) ? "warning" : msg.Severity,
            Message = msg.Message
        };

        db.Alerts.Add(entity);
        await db.SaveChangesAsync();
    }

    private async Task TryCreateAlertAsync(
        string farmId,
        string turbineId,
        DateTime timestamp,
        string severity,
        bool condition,
        string message)
    {
        if (!condition)
            return;

        var existsRecently = await db.Alerts.AsNoTracking().AnyAsync(a =>
            a.FarmId == farmId &&
            a.TurbineId == turbineId &&
            a.Message == message &&
            a.Timestamp >= timestamp - AlertCooldown);

        if (existsRecently)
            return;

        db.Alerts.Add(new Alert
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            TurbineId = turbineId,
            Timestamp = timestamp,
            Severity = severity,
            Message = message
        });
    }
}