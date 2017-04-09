function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Vector2D(x, y) {
  this.x = x;
  this.y = y;
}

Vector2D.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;

  return this;
};

Vector2D.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;

  return this;
};

Vector2D.prototype.scale = function(scale) {
  this.x *= scale;
  this.y *= scale;

  return this;
};

function Polygon(points, color) {
  this.points = points;
  this.color = color || 'rgb(0, 0, 0)';
}

Polygon.prototype.setColor = function(color) {
  this.color = color;
};

Polygon.prototype.drawStroked = function(ctx, scale, color) {

  ctx.strokeStyle = this.color;

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);

  for(var i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }

  ctx.lineTo(this.points[0].x, this.points[0].y);

  ctx.stroke();
};

Polygon.prototype.drawFilled = function(ctx, color) {

  ctx.fillStyle = this.color;

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);

  for(var i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }

  ctx.lineTo(this.points[0].x, this.points[0].y);

  ctx.fill();
};

Polygon.prototype.drawLines = function(ctx, color) {
  ctx.strokeStyle = this.color;

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);

  for(var i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }

  ctx.stroke();
}

Polygon.prototype.drawPoints = function(ctx, color) {
  ctx.fillStyle = this.color;

  for(var i = 1; i < this.points.length; i++) {
    ctx.beginPath();
    ctx.arc(this.points[i].x, this.points[i].y, 0.5, 0, 2 * Math.PI);
    ctx.fill();
  }
}
