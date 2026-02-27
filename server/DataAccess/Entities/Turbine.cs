using System;
using System.Collections.Generic;

namespace efscaffold.Entities;

public partial class Turbine
{
    public string Id { get; set; } = null!;

    public string FarmId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Location { get; set; } = null!;
}
