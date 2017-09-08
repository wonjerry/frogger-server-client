//Player the user controls
var Player = function (options) {
    var self = this;
    // gameloop에 따라 player가 initialize 되기도 하는데 이건 initialize되면 안되는 부분이다.
    self.width = 50;
    self.height = 60;
    //player object will hold scores for the game
    self.score = 0;
    self.lives = 3;
    self.order = options.order;
    self.id = options.id || 'offline';
    
    self.initialize();
};

Player.prototype.initialize = function () {
    var self = this;
    //row and column variables for easier handling
    self.col = self.order;
    self.row = 5;
    self.x = self.col * 100;
    self.y = self.row * 83 - 30;
    self.invincible = false;
};
// update시 game 객체 넘겨줄까?
// 아니면 필요한 데이터만 넘겨줄까?
Player.prototype.getPosition = function () {
    var self = this;
    return {
        x: self.col,
        y: self.row
    };
};

Player.prototype.getBoardPosition = function () {
    var self = this;
    return {
        x: self.col * 100,
        y: self.row * 83 - 30
    };
};

Player.prototype.applyInput = function (dx,dy) {
    var self = this;
    self.col += dx;
    self.row += dy;
};

module.exports = Player;
