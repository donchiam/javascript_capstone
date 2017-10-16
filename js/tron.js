canvas = document.getElementById("tron");
ctx = canvas.getContext("2d");

player = {
  type: "Player",
  width: 16,
  height: 16,
  color: "blue",
  history: [],
  current_direction: null
};

cpu = {
  type: "Computer",
  width: 16,
  height: 16,
  color: "red",
  history: [],
  current_direction: null
};

w = canvas.width;
h = canvas.height;
pw = player.width;
ph = player.height;
cw = cpu.width;
ch = cpu.height;
statusBox = document.getElementById("center");
playerScore = document.getElementById("pScore");
cpuScore = document.getElementById("cScore");
pCount = 0;
cCount = 0;

keys = {
  up: [38],
  down: [40],
  left: [37],
  right: [39],
  start_game: [32]
};

lastKey = null;

game = { 
  start: function() {
    canvas.style.backgroundSize = "32px 32px";
    cycle.resetPlayers();
    game.over = false;
    player.current_direction = "right";
    game.resetCanvas();
    statusBox.innerHTML = "<br />" + "<br />" + "Go!";
  },
  
  stop: function(cycle) {    
    game.over = true;
    ctx.fillStyle = '#FFF';
    ctx.font = (canvas.height / 15) + 'px sans-serif';
    ctx.textAlign = 'center';
    winner = cycle.type == "Computer" ? "Player" : "Computer";
    statusBox.innerHTML = winner + " wins!" + "<br />" + "<br />" + "Press Spacebar to play again";
    if (winner == "Player") {
      pCount++;
      playerScore.innerHTML = pCount;
    } else if (winner == "Computer") {
      cCount++;
      cpuScore.innerHTML = cCount;
    }
  },

  resetCanvas: function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
};

cycle = {
  resetPlayers: function() {
    player.x = (w / (pw / 2));
    player.y = (h / 2) + (ph / 2);
    player.color = 'blue';
    player.history = [];    
    player.current_direction = "right";
    cpu.x = w - (w / (cw / 2));
    cpu.y = (h / 2) + (ch / 2);
    cpu.color = 'red';
    cpu.history = [];
    cpu.current_direction = "left";
  },
 
  draw: function(cycle) {
    ctx.fillStyle = cycle.color;
    ctx.beginPath();
    ctx.moveTo(cycle.x + (cycle.width / 2), cycle.y + (cycle.height / 2));
    ctx.lineTo(cycle.x - (cycle.width / 2), cycle.y + (cycle.height / 2));
    ctx.lineTo(cycle.x - (cycle.width / 2), cycle.y - (cycle.height / 2));
    ctx.lineTo(cycle.x + (cycle.width / 2), cycle.y - (cycle.height / 2));
    ctx.closePath();
    ctx.fill();

  },


  move: function(cycle, opponent) {
    switch(cycle.current_direction) {
      case 'up':
        cycle.y -= cycle.height;
        break;
      case 'down':
        cycle.y += cycle.height;
        break;
      case 'right':
        cycle.x += cycle.width;
        break;
      case 'left':
        cycle.x -= cycle.width;
        break;
    }
    if ((cycle.x < (cycle.width / 2)) || 
        (cycle.x > w - (cycle.width / 2)) || 
        (cycle.y < (cycle.height / 2)) || 
        (cycle.y > h - (cycle.height / 2)) || 
        (cycle.history.indexOf(this.generateCoords(cycle)) >= 0) || 
        (opponent.history.indexOf(this.generateCoords(cycle)) >= 0)) {
      game.stop(cycle);
      
    }
    coords = this.generateCoords(cycle);
    cycle.history.push(coords);
  },
  

  
  crash: function(x,y) {
    coords = x + ',' + y;
    if (x < (cw / 2) || 
        x > w - (cw/ 2) || 
        y < (ch / 2) || 
        y > h - (ch / 2) || 
        cpu.history.indexOf(coords) >= 0 || 
        player.history.indexOf(coords) >= 0) {
      return true;
    }    
  },
  
  generateCoords: function(cycle) {
    return cycle.x + "," + cycle.y;
  },

  cpuMove: function() {
    cpuDirection = this.cpuChangeDirections();
    if (cpuDirection[cpu.current_direction] < cw || Math.ceil(Math.random() * ch) == 5) {
      cpu.current_direction = cpuDirection.best;    
    }
    this.move(cpu, player);
  },
  
  cpuChangeDirections: function() {
    turns = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };

    // Up
    for (i = cpu.y - ch; i>= 0; i -= ch) {
      turns.up = cpu.y - i - cw;
      if (this.crash(cpu.x, i)) break;
    }
    // Down
    for (i = cpu.y + ch; i<= h; i += ch) {
      turns.down = i - cpu.y - cw;
      if (this.crash(cpu.x, i)) break;
    }
    // Left
    for (i = cpu.x - cw; i>= 0; i -= cw) {
      turns.left = cpu.x - i - cw;
      if (this.crash(i, cpu.y)) break;
    }
    // Right
    for (i = cpu.x + cw; i<= w; i += cw) {
      turns.right = i - cpu.x - cw;
      if (this.crash(i, cpu.y)) break;
    }
    var largest = {
      key: null,
      value: 0
    };
    for(var j in turns){
        if( turns[j] > largest.value ){
            largest.key = j;
            largest.value = turns[j];
        }
    }
    turns.best = largest.key;
    return turns;
  }
  
};

inverseDirection = function() {
  switch(player.current_direction) {
    case 'up':
      return 'down';
      break;
    case 'down':
      return 'up';
      break;
    case 'right':
      return 'left';
      break;
    case 'left':
      return 'right';
      break;
  }
};

Object.prototype.getKey = function(value){
  for(var key in this){
    if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
};

addEventListener("keydown", function (event) {
    lastKey = keys.getKey(event.keyCode);
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0  && lastKey != inverseDirection()) {
      player.current_direction = lastKey;
    } else if (['start_game'].indexOf(lastKey) >= 0  && game.over) {
      game.start();
    }
}, false);

loop = function() {
  if (game.over === false) {
    cycle.move(player, cpu);
    cycle.draw(player);
    cycle.cpuMove();
    cycle.draw(cpu);
  }
};

main = function() {
  //game.start();
  document.body.onkeydown = function(event){
    if(event.keyCode == 32){
      game.start();
    }
}
  setInterval(loop, 75);

}();