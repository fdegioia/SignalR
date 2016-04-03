/**
 *
 * @author Fabio De Gioia
 *   ------------------------------------------------------------------
 *    blog http://www.fabiodegioia.com/
 * linkdin https://www.linkedin.com/pub/fabio-de-gioia/25/489/14b                           
 *   email fabio.degioia@gmail.com / fabio@fabiodegioia.com
 *
 **/

using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using GameSignalR.Models;

namespace GameSignalR.Hubs
{
    public class GameHub : Hub
    {

        // Not best pratices use static class here!!! ...never!!! :) ...  used only for educational purposes ( WPC 2014 )
        private static List<balloon> balloons = new List<balloon>();
        private static List<string> console = new List<string>();
        private static bool starting = false;


        private List<string> TypeBalloons = new List<string>() { "red", "yellow", "green", "violet", "blue", "orange", "fuxia", "azure", "blueviolet", "marron" };
        public override Task OnConnected()
        {
            if (Context.QueryString["game"] == "console") {
                console.Add(Context.ConnectionId);
            }
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (balloons.Count(z => z.ConnectionId == Context.ConnectionId) == 1)
            {
                balloon itemLeaves = balloons.First(z => z.ConnectionId == Context.ConnectionId);

                string freeBalloon = itemLeaves.Name;
                balloons.Remove(itemLeaves);
                Clients.All.showBalloon(freeBalloon);
                if (console.Count > 0)
                {
                    foreach (string item in console)
                    {
                        Clients.Client(item).removePedina(freeBalloon);
                    }
                }
            }
            else if (console.Contains(Context.ConnectionId))
            {
                // remove connectionid from console
                console.Remove(Context.ConnectionId);
                if (console.Count == 0)
                {
                   resetGame();
                }
            }

            return base.OnDisconnected(stopCalled);
        }


        public async Task boomPedina(string name) {
            balloon itemLeaves = balloons.First(z => z.Name == name);
            string freeBalloon = name;
            balloons.Remove(itemLeaves);
            await Clients.Client(itemLeaves.ConnectionId).boomPedina();
            await Clients.All.showBalloon(freeBalloon);
            if (console.Count > 0)
            {
                foreach (string item in console)
                {
                    await Clients.Client(item).removePedina(freeBalloon);
                }
            }
        }

        public async Task gameover(string winner)
        {
            starting = false;
            await Clients.All.showWinner(winner);
        }
        public void resetGame()
        {
            starting = false;
            Clients.Others.resetgame();
            if (console.Count > 0)
            {
                foreach (string item in console)
                {
                    foreach (balloon bal in balloons)
                    {
                         Clients.Client(item).removePedina(bal.Name);
                    }
                }
            }
            balloons = new List<balloon>();
            foreach (string item in TypeBalloons)
            {
                 Clients.Others.showBalloon(item);
            }
        }
        public async Task start()
        {
            starting = true;
            foreach (balloon item in balloons)
            {
                await Clients.Client(item.ConnectionId).startgame();
            }
        }


        public async Task Send(string name, string message)
        {
            await Clients.All.addNewMessageToPage(name, message);
        }
        public async Task assignBalloon(string name)
        {
            if (balloons.Count < 10) 
            {
                if (balloons.Count(z => z.Name == name) == 0)
                {
                    balloons.Add(new balloon { Name = name, PositionX = 0, PositionY = 0, ConnectionId = Context.ConnectionId });
                    await Clients.Others.assignedNewBaloons(name, balloons.Count);
                    await Clients.Caller.assignedBallon(name);
                    if (starting) Clients.Caller.startgame();
                    if (console.Count > 0)
                    {
                        foreach (string item in console)
                        {
                            await Clients.Client(item).newPedina(name);
                        }
                    }
                }
            }
        }
        public async Task moveBalloon(string direction, string balloon)
        {
            var b = balloons.Find(x => x.Name == balloon);
            if (console.Count > 0)
            {
                foreach (string item in console)
                {
                    await Clients.Client(item).movePedina(balloon, direction);
                }
            }
        }
        public async Task getFreeBalloons()
        {
            if (balloons.Count > 9)
            {
                await Clients.Caller.showNoBalloons();
            }
            else
            {
                foreach (string item in TypeBalloons)
                {
                    var b = balloons.Find(x => x.Name == item);
                    if (b == null)
                    {
                        await Clients.Caller.showBalloon(item);
                    }
                }
            }
        }
    }
}