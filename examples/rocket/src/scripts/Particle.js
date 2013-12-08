module.exports = function(x, y, angle) {
    this.x = x + Math.cos(angle) * 15;
    this.y = y + Math.sin(angle) * 15;
    this.size = 0;
    this.life = 1;
    this.angle = angle + (Math.random() - 0.5) * 2;
}
