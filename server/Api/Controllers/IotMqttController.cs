using System.Text.Json;
using Api.DTOs;
using DataAccess;
using DataAccess.Entities;
using Mqtt.Controllers;

namespace Api.Controllers;

public class IotMqttController(
    ILogger<IotMqttController> logger,
    WindFarmDbContext db
) : MqttController
{
    // farm/<farmId>/windmill/<turbineId>/telemetry
    [MqttRoute("farm/{farmId}/windmill/{turbineId}/telemetry")]
    public async Task ListenTelemetry(TelemetryMessageDto msg, string farmId, string turbineId)
    {
        logger.LogInformation("MQTT telemetry: {Json}", JsonSerializer.Serialize(msg));

        var entity = new Telemetry
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            TurbineId = turbineId,
            Timestamp = msg.Timestamp,

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
        await db.SaveChangesAsync();
    }

    // farm/<farmId>/windmill/<turbineId>/alert
    [MqttRoute("farm/{farmId}/windmill/{turbineId}/alert")]
    public async Task ListenAlert(AlertMessageDto msg, string farmId, string turbineId)
    {
        logger.LogInformation("MQTT alert: {Json}", JsonSerializer.Serialize(msg));

        var entity = new Alert
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            TurbineId = turbineId,
            Timestamp = msg.Timestamp,
            Severity = msg.Severity,
            Message = msg.Message
        };

        db.Alerts.Add(entity);
        await db.SaveChangesAsync();
    }
}