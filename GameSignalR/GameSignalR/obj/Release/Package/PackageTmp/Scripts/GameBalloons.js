/**
 *
 * @author Fabio De Gioia - Sandro Vecchiarelli
 *   ------------------------------------------------------------------
 *    blog http://www.fabiodegioia.com/
 * linkdin https://www.linkedin.com/pub/fabio-de-gioia/25/489/14b                           
 *   email fabio.degioia@gmail.com / fabio@fabiodegioia.com
 *   ------------------------------------------------------------------
 *     blog http://www.sandrovecchiarelli.com/
 * linkedin https://www.linkedin.com/pub/sandro-vecchiarelli/7/b9b/a39
 *    email sandrov@live.it
 *   ------------------------------------------------------------------
 *
 * gameObj - CopyRight 2014
 *
 **/

var gameObj = (function () {
    var canvas = null;
    var context = null;
    var currRectX = 425;
    var currRectY = 3;
    var mazeWidth = 1280;
    var mazeHeight = 1024;
    var intervalVar;
    var velocity = 5;
    var balloonOut = [];
    var balloonsInitArray = {
        'red': { "x": 3, "y": 5, "color": "#f70000" },
        'green': { "x": 582, "y": 5, "color": "#1fdb00" },
        'yellow': { "x": 1163, "y": 5, "color": "#ffde00" },
        'violet': { "x": 1163, "y": 224, "color": "#8c3bfb" },
        'blue': { "x": 1163, "y": 680, "color": "#001efb" },
        'orange': { "x": 1163, "y": 904, "color": "#fb7000" },
        'fuxia': { "x": 582, "y": 904, "color": "#fb00f8" },
        'azure': { "x": 3, "y": 904, "color": "#00e6fb" },
        'blueviolet': { "x": 3, "y": 680, "color": "#0088fb" },
        'marron': { "x": 3, "y": 224, "color": "#965c00" }
    };
    var balloonsArray = {
        'red': { "x": 3, "y": 5, "color": "#f70000" },
        'green': { "x": 582, "y": 5, "color": "#1fdb00" },
        'yellow': { "x": 1163, "y": 5, "color": "#ffde00" },
        'violet': { "x": 1163, "y": 224, "color": "#8c3bfb" },
        'blue': { "x": 1163, "y": 680, "color": "#001efb" },
        'orange': { "x": 1163, "y": 904, "color": "#fb7000" },
        'fuxia': { "x": 582, "y": 904, "color": "#fb00f8" },
        'azure': { "x": 3, "y": 904, "color": "#00e6fb" },
        'blueviolet': { "x": 3, "y": 680, "color": "#0088fb" },
        'marron': { "x": 3, "y": 224, "color": "#965c00" }
    };
    var labyrinth = {
        show: function () {
            $(".winner").remove();
            gameObj.labyrinth.makeWhite(0, 0, canvas.width, canvas.height);
            var mazeImg = new Image();
            mazeImg.onload = function () {
                context.drawImage(mazeImg, 0, 0);
            };
            mazeImg.src = "Images/teroldegorace.png";
        },
        drawRectangle: function (x, y, balloon) {
            var obj = balloonsArray[balloon];
            currRectX = x;
            currRectY = y;
            context.beginPath();
            context.rect(x, y, 25, 25);
            context.closePath();
            context.fillStyle = obj["color"];
            context.fill();
        },
        moveBalloon: function (balloon, direction) {
            if (balloonOut.length != 0 && balloonOut.indexOf(balloon) != -1) {
                return;
            }
            var obj = balloonsArray[balloon];
            var newX;
            var newY;
            var movingAllowed;
            switch (direction) {
                case "up": 
                    newX = obj["x"];
                    newY = obj["y"] - velocity;
                    break;
                case "left": 
                    newX = obj["x"] - velocity;
                    newY = obj["y"];
                    break;
                case "down":
                    newX = obj["x"];
                    newY = obj["y"] + velocity;
                    break;
                case "right": 
                    newX = obj["x"] + velocity;
                    newY = obj["y"];
                    break;
            }
            movingAllowed = gameObj.labyrinth.canMoveTo(newX, newY, balloon, direction);
            if (movingAllowed === 1) {       // 1 vuol dire che si può muovere
                gameObj.labyrinth.makeWhite(obj["x"], obj["y"], 25, 25);
                gameObj.labyrinth.drawRectangle(newX, newY, balloon);
                obj["x"] = newX;
                obj["y"] = newY;
            }
            else if (movingAllowed === 2) {  // 2 raggiunto il teroldego
                gameObj.labyrinth.makeWhite(0, 0, canvas.width, canvas.height);
                gameObj.labyrinth.showWinner(balloon);
            }
        },
        canMoveTo: function (destX, destY, balloon, direction) {
            var offx = 0; var offy = 0;
            var width = 0; var height = 0;
            switch (direction) {
                case "up" :
                    offx = destX;
                    offy = destY;
                    width = 25;
                    height = velocity;
                    break;
                case "down":
                    offx = destX;
                    offy = destY + 22;
                    width = 25;
                    height = velocity;
                    break;
                case "left":
                    offx = destX;
                    offy = destY;
                    width = velocity;
                    height = 25;
                    break;
                case "right":
                    offx = destX + 22;
                    offy = destY;
                    width = velocity;
                    height = 25;
                    break;
                default:
            }
            var imgData = context.getImageData(offx, offy, width, height);
            var data = imgData.data;
            var canMove = 1; // default = 1 vuol di che si può muovere
            if (destX >= 0 && destX <= mazeWidth - 25 && destY >= 0 && destY <= mazeHeight - 25) {
                for (var i = 0; i < 4 * width * height; i += 4) {
                    for (item in balloonsArray)
                    {
                        var obj = balloonsArray[item];
                        if (item != balloon) {
                            if (data[i] == parseInt(gameObj.labyrinth.hexToRgb(obj["color"]).r) &&
                                parseInt(data[i + 1]) == parseInt(gameObj.labyrinth.hexToRgb(obj["color"]).g) &&
                                parseInt(data[i + 2]) == parseInt(gameObj.labyrinth.hexToRgb(obj["color"]).b))
                            { // HIT TEST <<  Qui viene testato il colore pedine
                                balloonOut.push(balloon);
                                balloonOut.push(item);
                                $(document).trigger("boom", [balloon, item]);
                                gameObj.balloons.remove(balloon);
                                gameObj.balloons.remove(item);
                                canMove = 3;
                                return;
                            }
                        }
                    }
                    // HIT TEST <<  Qui viene testato il colore nero
                    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) { 
                        canMove = 0; // vuol dire che ha incontrato un muro 
                        break;
                    }
                    // HIT TEST <<  Qui viene testato il colore che circonda il Teroldego
                    else if ((data[i] === 192 && data[i + 1] === 255 && data[i + 2] === 0) ||
                        (data[i] === 193 && data[i + 1] === 253 && data[i + 2] === 51)) {
                        canMove = 2; // arrivo sul teroldego... 
                        break;
                    }
                }
            }
            else {
                canMove = 0;
            }
            return canMove;
        },
        makeWhite: function makeWhite(x, y, w, h) {
            context.beginPath();
            context.rect(x, y, w, h);
            context.closePath();
            context.fillStyle = "white";
            context.fill();
        },
        hexToRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        showWinner: function (balloon) {
            $(document).trigger("gameover", [balloon]);
            gameObj.labyrinth.makeWhite(0, 0, canvas.width, canvas.height);
            var mazeImg = new Image();
            mazeImg.onload = function () {
                context.drawImage(mazeImg, 0, 0);
            };
            mazeImg.src = "Images/teroldegowinner.jpg";
            var html = '<div class="row">';
            $('<div class="winner"></div>').appendTo(document.body);
            $(".winner").addClass(balloon).show();
        }
        
    };
    var balloons = {
        add: function (balloon) {
            balloonOut.splice(balloonOut.indexOf(balloon), 1);
            var objIni = balloonsInitArray[balloon];
            var obj = balloonsArray[balloon];
            gameObj.labyrinth.drawRectangle(objIni["x"], objIni["y"], balloon);
            obj["x"] = objIni["x"];
            obj["y"] = objIni["y"];
        },
        remove: function (balloon) {
            var obj = balloonsArray[balloon];
            gameObj.labyrinth.makeWhite(obj["x"], obj["y"], 25, 25);
        }
    };

    function init() {
        var html = '<div class="row">';
        html += '<canvas width="1280" height="1024" id="labyrinthCanvas">Non &egrave possibile giocare perch&egrave il tuo browser non supporta HTML5.</canvas>';
        html += '<noscript>JavaScript non &egrave abilitato. Per giocare devi abilitarlo.</noscript></div>';
        $(html).appendTo(document.body);
        canvas = document.getElementById('labyrinthCanvas');
        context = canvas.getContext("2d");
    }
    init();
    return {
        init: init,
        labyrinth: labyrinth,
        balloons: balloons
    };
})();
