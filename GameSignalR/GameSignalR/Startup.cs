using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(GameSignalR.Startup))]
namespace GameSignalR
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
