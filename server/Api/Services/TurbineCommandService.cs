using DataAccess;
using DataAccess.Entities;
using System.Text.Json;
using MQTTnet;

namespace Api.Services;

public class TurbineCommandService
{
    private readonly IConfiguration _config;
    private readonly WindFarmDbContext _db;

    private const string ProjectFarmId = "Wind-Iot-JIANLUI";

    public TurbineCommandService(IConfiguration config, WindFarmDbContext db)
    {
        _config = config;
        _db = db;
    }

    public async Task<(bool ok, string? error)> SendCommandAsync(
        string? farmId,
        string turbineId,
        string? command,
        string? username,
        int? value = null,
        double? angle = null,
        string? reason = null)
    {
        var host = _config["Mqtt:Host"] ?? _config["Mqtt__Host"];
        var portRaw = _config["Mqtt:Port"] ?? _config["Mqtt__Port"];
        var mqttUser = _config["Mqtt:Username"] ?? _config["Mqtt__Username"];
        var mqttPass = _config["Mqtt:Password"] ?? _config["Mqtt__Password"];

        if (string.IsNullOrWhiteSpace(host))
            return (false, "MQTT host is missing");

        if (string.IsNullOrWhiteSpace(turbineId))
            return (false, "Turbine ID is required");

        if (string.IsNullOrWhiteSpace(command))
            return (false, "Command is required");

        if (string.IsNullOrWhiteSpace(username))
            return (false, "Authenticated user is required");

        var port = 1883;
        if (!string.IsNullOrWhiteSpace(portRaw) && int.TryParse(portRaw, out var parsedPort))
            port = parsedPort;

        var effectiveFarmId = string.IsNullOrWhiteSpace(farmId)
            ? ProjectFarmId
            : farmId;

        object payload;
        string actionToStore;

        switch (command.Trim().ToLowerInvariant())
        {
            case "start":
                actionToStore = "start";
                payload = new
                {
                    action = "start"
                };
                break;

            case "stop":
                actionToStore = "stop";
                payload = new
                {
                    action = "stop",
                    reason = string.IsNullOrWhiteSpace(reason) ? "maintenance" : reason
                };
                break;

            case "setinterval":
                if (value is null || value < 1 || value > 60)
                    return (false, "Value must be between 1 and 60 for setInterval");

                actionToStore = "setInterval";
                payload = new
                {
                    action = "setInterval",
                    value = value.Value
                };
                break;

            case "setpitch":
                if (angle is null || angle < 0 || angle > 30)
                    return (false, "Angle must be between 0 and 30 for setPitch");

                actionToStore = "setPitch";
                payload = new
                {
                    action = "setPitch",
                    angle = angle.Value
                };
                break;

            default:
                return (false, "Invalid command");
        }

        var topic = $"farm/{effectiveFarmId}/windmill/{turbineId}/command";
        var payloadJson = JsonSerializer.Serialize(payload);

        var factory = new MqttClientFactory();
        using var client = factory.CreateMqttClient();

        var optionsBuilder = new MqttClientOptionsBuilder()
            .WithTcpServer(host, port);

        if (!string.IsNullOrWhiteSpace(mqttUser))
            optionsBuilder = optionsBuilder.WithCredentials(mqttUser, mqttPass);

        var options = optionsBuilder.Build();

        await client.ConnectAsync(options);

        var message = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payloadJson)
            .Build();

        await client.PublishAsync(message);
        await client.DisconnectAsync();

        var commandRow = new Command
        {
            Id = Guid.NewGuid(),
            FarmId = effectiveFarmId,
            TurbineId = turbineId,
            UserId = username,
            Timestamp = DateTime.UtcNow,
            Action = actionToStore,
            Payload = payloadJson
        };

        _db.Commands.Add(commandRow);
        await _db.SaveChangesAsync();

        return (true, null);
    }
}