//start and end screen
var Popup = function() {
  this.options = ["PRESS [SPACE] TO START", "", "GAME OVER"];
  this.content = "";
  //this.state = 0;
};

Popup.prototype.update = function() {
  //choose appropriate text for start or end screen
  //this.state = gameState;
  this.content = this.options[this.state];
};

//draw the popup on screen if gamestate is not-started or game over
Popup.prototype.render = function(state) {
  //if(gameState === 1) return;
  /*
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 252, 400, 90);
  ctx.fillRect(52, 252, 400, 90);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "24px serif";
  ctx.fillText(this.options[state], 252, 302);
  */
};

module.exports = Popup;
