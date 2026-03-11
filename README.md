# Windmill Inspection Centre

A full-stack offshore wind turbine monitoring and control system built for FS+IoT Corporate™.

## Project Overview

This project monitors and controls offshore wind turbines in real time.  
It receives telemetry and alerts from the public MQTT broker, stores them in a relational database, and provides a React web UI for monitoring, alerts, command control, and command history.

## Features

- Real-time turbine telemetry in a graphical web UI
- Historical metric charts
- Live alerts and alert history
- Relational database storage for telemetry and alerts
- Dedicated turbine control UI
- Authenticated command handling
- Server-side command validation
- Complete command history with operator identity and timestamp

## Tech Stack

### Backend
- .NET 10
- C#
- ASP.NET Core
- Entity Framework Core
- StateleSSE.AspNetCore
- Mqtt.Controllers
- PostgreSQL / Neon

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS / DaisyUI

## Architecture

### Incoming telemetry and alerts
Simulator / public MQTT broker -> `IotMqttController` -> Neon PostgreSQL -> `WebClientController` -> React UI

### Outgoing control commands
React UI -> `TurbineControlController` -> `TurbineCommandService` -> MQTT broker  
React UI -> `CommandsController` -> Neon PostgreSQL

## Authentication

The system uses JWT authentication.

### Users (Demo usernames and passwords will be provided in Wiseflow.)
- `admin` – monitoring access
- `operator` – monitoring + turbine control access

### Authorization
- Monitor / Alerts / Command History: authenticated access
- Control: operator only

## Supported Commands

The system supports these turbine commands:

- `start`
- `stop`
- `setInterval`
- `setPitch`
