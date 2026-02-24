using Microsoft.EntityFrameworkCore;
using WindFarm.Api.Data.Entities;

namespace WindFarm.Api.Data;

public class WindFarmDbContext : DbContext
{
    public WindFarmDbContext(DbContextOptions<WindFarmDbContext> options) : base(options) { }

    public DbSet<Turbine> Turbines => Set<Turbine>();
    public DbSet<TelemetryRecord> Telemetry => Set<TelemetryRecord>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<OperatorAction> OperatorActions => Set<OperatorAction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Turbine>().HasKey(t => t.Id);

        modelBuilder.Entity<TelemetryRecord>()
            .HasIndex(t => new { t.TurbineId, t.Ts });

        modelBuilder.Entity<Alert>()
            .HasIndex(a => new { a.TurbineId, a.Ts });

        modelBuilder.Entity<Alert>()
            .HasIndex(a => new { a.Status, a.Severity, a.Ts });

        modelBuilder.Entity<OperatorAction>()
            .HasIndex(a => new { a.TurbineId, a.Ts });
    }
}