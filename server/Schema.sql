DO $EF$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'iot_windfarm') THEN
CREATE SCHEMA iot_windfarm;
END IF;
END $EF$;

-- =========================
-- USERS (Inspectors / Login)
-- =========================
CREATE TABLE iot_windfarm."Users" (
                                      "Id" text NOT NULL,          -- e.g. email or username
                                      "Nickname" text NOT NULL,
                                      "Salt" text NOT NULL,
                                      "Hash" text NOT NULL,
                                      CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- =========================
-- FARMS (group turbines)
-- =========================
CREATE TABLE iot_windfarm."Farms" (
                                      "Id" text NOT NULL,          -- keep text to match MQTT topic farmId easily
                                      "Name" text NOT NULL,
                                      "CreatedBy" text NOT NULL,   -- user id (inspector)
                                      CONSTRAINT "PK_Farms" PRIMARY KEY ("Id")
);

-- =========================
-- TURBINES (devices)
-- =========================
CREATE TABLE iot_windfarm."Turbines" (
                                         "Id" text NOT NULL,          -- turbine-alpha, turbine-beta, ...
                                         "FarmId" text NOT NULL,      -- farm id as text
                                         "Name" text NOT NULL,        -- Alpha, Beta...
                                         "Location" text NOT NULL,    -- North Platform...
                                         CONSTRAINT "PK_Turbines" PRIMARY KEY ("Id")
);

-- =========================
-- TELEMETRY (time-series data)
-- =========================
CREATE TABLE iot_windfarm."Telemetry" (
                                          "Id" uuid NOT NULL,
                                          "FarmId" text NOT NULL,
                                          "TurbineId" text NOT NULL,
                                          "Timestamp" timestamptz NOT NULL,

                                          "WindSpeed" double precision NOT NULL,
                                          "WindDirection" double precision NOT NULL,
                                          "AmbientTemperature" double precision NOT NULL,
                                          "RotorSpeed" double precision NOT NULL,
                                          "PowerOutput" double precision NOT NULL,
                                          "NacelleDirection" double precision NOT NULL,
                                          "BladePitch" double precision NOT NULL,
                                          "GeneratorTemp" double precision NOT NULL,
                                          "GearboxTemp" double precision NOT NULL,
                                          "Vibration" double precision NOT NULL,
                                          "Status" text NOT NULL,      -- running/stopped

                                          CONSTRAINT "PK_Telemetry" PRIMARY KEY ("Id")
);

-- =========================
-- ALERTS (triggered events)
-- =========================
CREATE TABLE iot_windfarm."Alerts" (
                                       "Id" uuid NOT NULL,
                                       "FarmId" text NOT NULL,
                                       "TurbineId" text NOT NULL,
                                       "Timestamp" timestamptz NOT NULL,
                                       "Severity" text NOT NULL,    -- info/warning/critical
                                       "Message" text NOT NULL,
                                       CONSTRAINT "PK_Alerts" PRIMARY KEY ("Id")
);

-- =========================
-- COMMANDS (what you send to MQTT control topic)
-- =========================
CREATE TABLE iot_windfarm."Commands" (
                                         "Id" uuid NOT NULL,
                                         "FarmId" text NOT NULL,
                                         "TurbineId" text NOT NULL,
                                         "Timestamp" timestamptz NOT NULL,
                                         "Action" text NOT NULL,      -- start/stop/setPitch/setInterval
                                         "Payload" text NOT NULL,     -- store JSON as text (simple for exam)
                                         CONSTRAINT "PK_Commands" PRIMARY KEY ("Id")
);