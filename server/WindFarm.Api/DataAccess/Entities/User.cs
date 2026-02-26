namespace WindFarm.Api.DataAccess.Entities;

public partial class User
{
    public string Id { get; set; } = null!;

    public string Nickname { get; set; } = null!;

    public string Salt { get; set; } = null!;

    public string Hash { get; set; } = null!;
}
