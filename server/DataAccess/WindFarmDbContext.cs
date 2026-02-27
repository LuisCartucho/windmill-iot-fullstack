using Microsoft.EntityFrameworkCore;
using efscaffold.Entities;

namespace Infrastructure.Postgres.Scaffolding;

public partial class WindFarmDbContext : DbContext
{
    public WindFarmDbContext(DbContextOptions<WindFarmDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Alert> Alerts { get; set; }

    public virtual DbSet<Command> Commands { get; set; }

    public virtual DbSet<Farm> Farms { get; set; }

    public virtual DbSet<Telemetry> Telemetries { get; set; }

    public virtual DbSet<Turbine> Turbines { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.ToTable("Alerts", "iot_windfarm");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Command>(entity =>
        {
            entity.ToTable("Commands", "iot_windfarm");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Farm>(entity =>
        {
            entity.ToTable("Farms", "iot_windfarm");
        });

        modelBuilder.Entity<Telemetry>(entity =>
        {
            entity.ToTable("Telemetry", "iot_windfarm");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Turbine>(entity =>
        {
            entity.ToTable("Turbines", "iot_windfarm");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users", "iot_windfarm");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
