using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public partial class WindFarmDbContext : DbContext
{
    public WindFarmDbContext(DbContextOptions<WindFarmDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Alert> Alerts { get; set; }

    public virtual DbSet<Command> Commands { get; set; }
    
    public virtual DbSet<Telemetry> Telemetries { get; set; }
    
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

            // Add the foreign key relationship here
            entity.HasOne(c => c.User)  // Command has one User
                .WithMany()  // Assuming that User doesn't have a reverse navigation property to Command
                .HasForeignKey(c => c.UserId)  // Foreign key in Command table
                .OnDelete(DeleteBehavior.Cascade); // Optional: Cascade delete when User is deleted
        });

        modelBuilder.Entity<Telemetry>(entity =>
        {
            entity.ToTable("Telemetry", "iot_windfarm");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users", "iot_windfarm");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
