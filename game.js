var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
        
    canvas = undefined,
    ctx = undefined,
    lastPress = null,
    gameover = true,
    pause = false,
    currentScene = 0,
    scenes = [],
    mainScene = null,
    gameScene = null,
    highscoresScene = null,
    body = [],
    //wall = [],
    highscores = [],
    posHighscore = 10,
    dir = 0,
    score = 0,
    food = undefined,
    iBody = new Image(),
    iFood1 = new Image(),
    iFood2 = new Image(),
    iFood3 = new Image(),
    aEat = new Audio(),
    aDie = new Audio();
            
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
}());

document.addEventListener('keydown', function (evt) {
    lastPress = evt.which;
}, false);

function Rectangle(x, y, width, height) {
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? this.width : height;

    Rectangle.prototype = {
        constructor: Rectangle,
        
        intersects: function (rect) {
            if (rect === undefined) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }   
        },
            
        fill: function (ctx) {
            if (ctx === undefined) {
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        },
            
        drawImage: function (ctx, img) {
            if (img === undefined) {
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                    ctx.drawImage(img, this.x, this.y);
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        },
    }
}

function Scene() {
    this.id = scenes.length;
    scenes.push(this);
}
    
Scene.prototype = {
    constructor: Scene,
    load: function () {},
    paint: function (ctx) {},
    act: function () {}
}
    
function loadScene(scene) {
    currentScene = scene.id;
    scenes[currentScene].load();
}

function addHighscore(score) {
    posHighscore = 0;
    while (highscores[posHighscore] > score && posHighscore < highscores.length) {
        posHighscore += 1;
    }
    highscores.splice(posHighscore, 0, score);
    if (highscores.length > 10) {
        highscores.length = 10;
    }
    localStorage.highscores = highscores.join(',');
}

function random(max) {
    return ~~(Math.random() * max);
}

function canPlayOgg() {
    var aud = new Audio();
    if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
        return true;
    } else {
        return false;
    }
}

function rezise() {
    var w = window.innerWidth / canvas.width;
    var h = window.innerHeight / canvas.height;
    var scale = Math.min(h, w);
    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';    
}

function repaint() {
    window.requestAnimationFrame(repaint);
    if (scenes.length) {
        scenes[currentScene].paint(ctx);
    }
}

function run() {
    setTimeout(run, 60);
    if (scenes.length) {
        scenes[currentScene].act();
    }
}

function init() {
    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Create initial food
    food = new Rectangle(80, 80, 20, 20);
    // Load assets
    iBody.src = 'assets/body.png';
    iFood1.src = 'assets/fruit.png';
    if (canPlayOgg()) {
        aEat.src = 'assets/eat.ogg';
        aDie.src = 'assets/fail.ogg';
    } else {
        aEat.src = 'assets/eat.m4a';
        aDie.src = 'assets/fail.m4a';
    }

    // Load saved highscores
    if (localStorage.highscores) {
        highscores = localStorage.highscores.split(',');
    }

    /*Create walls
    wall.push(new Rectangle(0, 0, 10, 10));
    wall.push(new Rectangle(0, 290, 10, 10));
    wall.push(new Rectangle(590, 0, 10, 10));
    wall.push(new Rectangle(590, 290, 10, 10));*/

    // Start game
    run();
    repaint(); 
    rezise();
}

// Main Scene
mainScene = new Scene();
    
mainScene.paint = function (ctx) {
    // Clean canvas
    ctx.fillStyle = '#ffdfcd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#85c84f';
    ctx.font = '15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SNAKE', canvas.width/2, canvas.height/2);
    ctx.fillText('Press Enter', canvas.width/2, canvas.height/1.7);
}

mainScene.act = function () {
    // Load next scene
    if (lastPress === KEY_ENTER) {
        loadScene(highscoresScene);
        lastPress = undefined;
    }
}
    
// Game Scene
gameScene = new Scene();
    
gameScene.load = function () {
    score = 0;
    dir = 1;
    body.length = 0;
    body.push(new Rectangle(40, 40, 20, 20));
    body.push(new Rectangle(0, 0, 20, 20));
    body.push(new Rectangle(0, 0, 20, 20));
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
}
    
gameScene.paint = function (ctx) {
    var i = 0,
        l = 0;
        
    // Clean canvas
    ctx.fillStyle = '#ffdfcd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    for (let i = 0; i < body.length; i+=1) {
        ctx.drawImage(iBody, body[i].x, body[i].y); 
    }    
        
    // Draw walls
    //ctx.fillStyle = '#999';
    //for (i = 0, l = wall.length; i < l; i += 1) {
    //    wall[i].fill(ctx);
    //}
    
    // Draw food
    ctx.strokeStyle = '#f00';
    ctx.drawImage(iFood1, food.x, food.y);
    
    // Draw score
    ctx.fillStyle = '#85c84f';
    ctx.font = '15px Arial';
    ctx.fillText('Score: ' + score, 1100, 50);
    
    // Draw pause
    if (pause) {
        if (gameover) {
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        } else {
            ctx.fillText('PAUSE', canvas.width/2, canvas.height/2);
        }
        ctx.textAlign = 'center';
    } 
}

gameScene.act = function () {
    var i = 0,
        l = 0;
    
    if (!pause) {   
        // GameOver Reset
        if (gameover) {
        loadScene (highscoresScene);
        }

        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }

        // Change Direction
        if (lastPress == KEY_UP && dir != 2) {
            dir = 0; 
        }
        if (lastPress == KEY_RIGHT && dir != 3) {
            dir = 1;
        }
        if (lastPress == KEY_DOWN && dir != 0) {
            dir = 2; 
        }
        if (lastPress == KEY_LEFT && dir != 1) {
            dir = 3;
        }
        
        // Move Rect
        if (dir == 0) {
            body[0].y -= 20;
        }
        if (dir == 1) {
            body[0].x += 20; 
        }
        if (dir == 2) {
            body[0].y += 20;
        }
        if (dir == 3) {
            body[0].x -= 20; 
        }

        // Out Screen
        if (body[0].x > canvas.width - body[0].width) {
            body[0].x = 0;
        }
        if (body[0].y > canvas.height - body[0].height) {
            body[0].y = 0; 
        }
        if (body[0].x < 0) {
            body[0].x = canvas.width - body[0].width;
        }
        if (body[0].y < 0) {
            body[0].y = canvas.height - body[0].height;
        }

        // Body Intersects
        for (i = 2, l = body.length; i < l; i += 1) {
            if (body[0].intersects(body[i])) {
                gameover = true;
                pause = true;
                aDie.play();
                addHighscore(score);
            }
        }

        // Food Intersects
        if (body[0].intersects(food)) {
            body.push(new Rectangle(food.x - body.length, food.y - body.length, 20, 20));
            score += 1;
            food.x = random(canvas.width / 10 - 1) * 10;
            food.y = random(canvas.height / 10 - 1) * 10;
            aEat.play();
        }

        /* Wall Intersects
        for (i = 0, l = wall.length; i < l; i += 1) {
            if (food.intersects(wall[i])) {
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
            }
            if (body[0].intersects(wall[i])) {
                gameover = true;
                pause = true;
            }
        }*/
    }

    // Pause/Unpause
    if (lastPress == KEY_ENTER) {
        pause = !pause;
        lastPress = undefined;
    }
}

// Highscore Scene
highscoresScene = new Scene();
    
highscoresScene.paint = function (ctx) {
        var i = 0,
            l = 0;
    
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#85c84f';
    ctx.font = '15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', canvas.width/2, canvas.height/2 - 100);
    
    // Draw high scores
    ctx.fillStyle = '#85c84f';
    ctx.font = '15px Arial';
    ctx.textAlign = 'right';
    for (i = 0, l = highscores.length; i < l; i += 1) {
        if (i === posHighscore) {
            ctx.fillText('*' + highscores[i], canvas.width/2, canvas.height/2 - 80 + i * 20);
        } else {
            ctx.fillText(highscores[i], canvas.width/2, canvas.height/2 - 80 + i * 20);
        } 
    }
}    
        
highscoresScene.act = function () {
    // Load next scene
    if (lastPress === KEY_ENTER) {
        loadScene(gameScene);
        lastPress = undefined;
    }
}

window.addEventListener('load', init, false);
window.addEventListener('resize', resize, false);