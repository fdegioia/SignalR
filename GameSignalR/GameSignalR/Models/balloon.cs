using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GameSignalR.Models
{
    public class balloon
    {
        public string Name { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public string ConnectionId { get; set; }
    }
}