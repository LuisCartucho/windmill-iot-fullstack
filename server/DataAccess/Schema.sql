DROP SCHEMA IF EXISTS iot_windfarm CASCADE;

CREATE SCHEMA iot_windfarm;

CREATE TABLE iot_windfarm."Users" (
                                      "Id" text NOT NULL,
                                      "Nickname" text NOT NULL,
                                      "Salt" text NOT NULL,
                                      "Hash" text NOT NULL,
                                      CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

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
                                          "Status" text NOT NULL,
                                          CONSTRAINT "PK_Telemetry" PRIMARY KEY ("Id")
);

CREATE TABLE iot_windfarm."Alerts" (
                                       "Id" uuid NOT NULL,
                                       "FarmId" text NOT NULL,
                                       "TurbineId" text NOT NULL,
                                       "Timestamp" timestamptz NOT NULL,
                                       "Severity" text NOT NULL,
                                       "Message" text NOT NULL,
                                       CONSTRAINT "PK_Alerts" PRIMARY KEY ("Id")
);

CREATE TABLE iot_windfarm."Commands" (
                                         "Id" uuid NOT NULL,
                                         "FarmId" text NOT NULL,
                                         "TurbineId" text NOT NULL,
                                         "UserId" text NOT NULL,
                                         "Timestamp" timestamptz NOT NULL,
                                         "Action" text NOT NULL,
                                         "Payload" text NOT NULL,
                                         CONSTRAINT "PK_Commands" PRIMARY KEY ("Id"),
                                         CONSTRAINT "FK_Commands_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "iot_windfarm"."Users" ("Id") ON DELETE CASCADE
);