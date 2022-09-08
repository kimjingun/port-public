//imageProgress
function imagesProgress(){
    var $container = $("#progress"),
        $progressBar = $container.find(".bubble2"),
        $progressText = $container.find(".progress-text"),
        imgLoad = imagesLoaded("body"), 
        imgTotal = imgLoad.images.length,   
        imgLoaded = 0,                                      
        current = 0,                            
        progressTimer = setInterval(updateProgress, 1000 / 60);

    imgLoad.on("progress", function(){
        imgLoaded++;
    });

    function updateProgress(){
        var target = ( imgLoaded / imgTotal) * 100;

        current += ( target - current) * 0.1;
        $progressText.text( Math.floor(current) + '%' );

        if(current >= 100){
            clearInterval(progressTimer);
            //$container.addClass("progress-complete");
            $progressBar.add($progressText)
                .delay(500)
                .animate({opacity: 0},250,function(){
                    $container.animate({width: '0%'},2000,'easeInOutQuint').addClass('active');
                });
            $("body").addClass("active");
        }
        if(current > 99.98){
            current = 100;
        }
    }   
}


/*--------------------
Get Mouse
--------------------*/

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, dir: '' };
let clicked = false;
const getMouse = (e) => {
  mouse = {
    x: e.clientX || e.pageX || e.touches[0].pageX || 0 || window.innerWidth / 2,
    y: e.clientY || e.pageY || e.touches[0].pageY || 0 || window.innerHeight / 2,
    dir: (getMouse.x > e.clientX) ? 'left' : 'right'
  }
};
['mousemove', 'touchstart', 'touchmove'].forEach(e => {
  window.addEventListener(e, getMouse);
});
window.addEventListener('mousedown', (e) => {
  e.preventDefault();
  clicked = true;
});
window.addEventListener('mouseup', () => {
  clicked = false;
});


/*--------------------
Ghost Follow
--------------------*/
class GhostFollow {
  constructor (options) {
    Object.assign(this, options);
    
    this.el = document.querySelector('#ghost');
    this.mouth = document.querySelector('.ghost__mouth');
    this.eyes = document.querySelector('.ghost__eyes');
    this.pos = {
      x: 0,
      y: 0
    }
  }
  
  follow() {
    this.distX = mouse.x - this.pos.x;
    this.distY = mouse.y - this.pos.y;
    
    this.velX = this.distX / 8;
    this.velY = this.distY / 8;
    
    this.pos.x += this.distX / 10;
    this.pos.y += this.distY / 10;
    
    this.skewX = map(this.velX, 0, 100, 0, -50);
    this.scaleY = map(this.velY, 0, 100, 1, 2.0);
    this.scaleEyeX = map(Math.abs(this.velX), 0, 100, 1, 1.2);
    this.scaleEyeY = map(Math.abs(this.velX * 2), 0, 100, 1, 0.1);
    this.scaleMouth = Math.min(Math.max(map(Math.abs(this.velX * 1.5), 0, 100, 0, 10), map(Math.abs(this.velY * 1.2), 0, 100, 0, 5)), 2);
    
    if (clicked) {
      this.scaleEyeY = .4;
      this.scaleMouth = -this.scaleMouth;
    }
    
    this.el.style.transform = 'translate(' + this.pos.x + 'px, ' + this.pos.y + 'px) scale(.7) skew(' + this.skewX + 'deg) rotate(' + -this.skewX + 'deg) scaleY(' + this.scaleY + ')';
    this.eyes.style.transform = 'translateX(-50%) scale(' + this.scaleEyeX + ',' + this.scaleEyeY + ')';
    this.mouth.style.transform = 'translate(' + (-this.skewX*.5-10) + 'px) scale(' + this.scaleMouth + ')';
  }
}


/*--------------------
Map
--------------------*/
function map (num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


/*--------------------
Init
--------------------*/
const cursor = new GhostFollow();


/*--------------------
Render
--------------------*/
const render = () => {
  requestAnimationFrame(render);
  cursor.follow();
}
render();


/*--------------------------------------------------------------------------------------------------------------------------------------*/

var canvas = document.getElementById("main-canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var starCanvas = document.getElementById("star-canvas");
var ctx2 = starCanvas.getContext("2d");
starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;
var rocket = document.querySelector(".rocket");
var showers = [];
var stars = [];
var moving = !1;
var hasMoved = !1;
var timeout;
var colors = [
"#EAEAFE",
"#16FAE7",
"#CF267E ",
"#FED705",
"#A33EEC",
"#F578DF"];

var gravity = 0.05;
var particlesDensity = 7;

let cursorPos = { x: width / 2, y: height - 200 };

window.addEventListener("mousemove", mousemove);
window.addEventListener("touchmove", touchmove);

function mousemove(e) {
  hasMoved = !0;
  if (hasMoved) rocket.classList.remove("shadow");
  mouseHasStopped();
  cursorPos = {
    x: e.offsetX,
    y: e.offsetY };

}

function touchmove(e) {
  hasMoved = !0;
  if (hasMoved) rocket.classList.remove("shadow");
  mouseHasStopped();
  cursorPos = {
    x: e.targetTouches[0].offsetX,
    y: e.targetTouches[0].offsetY };

}

window.addEventListener("resize", resize);
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  makeStars.createStars();
}

function mouseHasStopped() {
  clearTimeout(timeout);
  moving = !0;
  timeout = setTimeout(function () {
    moving = !1;
  }, 100);
}

function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

var makeParticles = function () {
  function Particle(x, y, vx, vy, size, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = life;
    this.opacity = 1;
    this.update = () => {
      this.opacity -= this.opacity / (life / 0.1);
      this.size -= this.size / (life / 0.1);
      if (this.size < 0) this.size = 0;
      this.life -= 0.1;
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.draw();
    };
    this.draw = () => {
      ctx.beginPath();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    };
    this.remove = () => {
      return this.life <= 0;
    };
  }

  function Shower(x, y) {
    this.particles = [];

    this.initParticles = function () {
      for (var i = 1; i <= particlesDensity; i++) {
        var vx = -2 + random(0, 4);
        var vy = random(0, 2);
        var size = random(1, 5);
        var life = random(7, 9);
        var color = colors[Math.floor(Math.random() * colors.length)];
        var p = new Particle(x, y, vx, vy, size, color, life);
        this.particles.push(p);
      }
    };

    if (moving) this.initParticles();

    this.explode = function () {
      for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].update();

        if (this.particles[i].remove() == true) {
          this.particles.splice(i, 1);
        }
      }
    };
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    var n = new Shower(cursorPos.x, cursorPos.y);
    showers.push(n);

    for (var i = 0; i < showers.length; i++) {
      showers[i].explode();
    }

    window.requestAnimationFrame(animate);
  }

  return {
    init: () => {
      animate();
    } };

}();

var rotateCursor = function () {
  let lastCursorPos = { x: 0, y: 0 };
  let angle = 0;
  let cursor = document.getElementById("cursor");

  function updateCursor() {
    const delta = {
      x: lastCursorPos.x - cursorPos.x,
      y: lastCursorPos.y - cursorPos.y };

    if (Math.abs(delta.x) < 10 && Math.abs(delta.y) < 10) return;
    angle = Math.atan2(delta.y, delta.x) * 180 / Math.PI;

    // set cursor css
    if (moving) {
      cursor.style.transform = `translate(${cursorPos.x}px, ${
      cursorPos.y
      }px) rotate(${angle - 90}deg) `;
    } else {
      cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
    }

    lastCursorPos = cursorPos;
  }

  function render() {
    updateCursor();
    requestAnimationFrame(render);
  }

  return {
    init: function () {
      render();
    } };

}();

var makeStars = function () {
  function Star(x, y, size, opacity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.opacity = opacity;
    this.addOpacity = 0.005;
    this.update = () => {
      if (this.opacity < 0.1) {
        this.addOpacity = -this.addOpacity;
      }
      if (this.opacity > 0.8) {
        this.addOpacity = -this.addOpacity;
      }
      this.opacity -= this.addOpacity;
      this.draw();
    };
    this.draw = () => {
      ctx2.beginPath();
      ctx2.globalAlpha = this.opacity;
      ctx2.fillStyle = "#ffffff";
      ctx2.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx2.fill();
      ctx2.closePath();
    };
  }

  var createStars = function () {
    stars = [];
    for (var i = 1; i <= 150; i++) {
      var x = random(0, width);
      var y = random(0, height);
      var size = random(0.1, 1.5);
      var opacity = random(0.1, 0.8);
      var s = new Star(x, y, size, opacity);
      stars.push(s);
    }
  };

  function animate() {
    ctx2.clearRect(0, 0, width, height);
    for (var i = 0; i < stars.length; i++) {
      stars[i].update();
    }
    window.requestAnimationFrame(animate);
  }

  return {
    init: () => {
      createStars();
      animate();
    },
    createStars: () => {
      createStars();
    } };

}();

document.addEventListener("DOMContentLoaded", () => {
  rotateCursor.init();
  makeParticles.init();
  makeStars.init();
});

$(".btn1").click(function(){
	$("#modal1").removeClass().addClass("one");
    $("iframe").css('display','block');
});
$(".btn2").click(function(){
	$("#modal2").removeClass().addClass("one");
    $("iframe").css('display','block');
});
$(".btn3").click(function(){
	$("#modal3").removeClass().addClass("one");
    $("iframe").css('display','block');
});
$(".btn4").click(function(){
	$("#modal4").removeClass().addClass("one");
    $("iframe").css('display','block');
});

$(".close").click(function(){
	$("#modal1").addClass("out");
    $("iframe").css('display','none');
});

$(".close2").click(function(){
    $("#modal2").addClass("out");
    $("iframe").css('display','none');
});

$(".close3").click(function(){
    $("#modal3").addClass("out");
    $("iframe").css('display','none');
});

$(".close4").click(function(){
    $("#modal4").addClass("out");
    $("iframe").css('display','none');
});
