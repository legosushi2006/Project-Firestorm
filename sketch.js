var game;

//wW

function setup()
{
  createCanvas(windowWidth,windowHeight);

  game = new Game();
  game.setup();
}

function draw()
{
  game.main();
}

function Game()
{
  this.page = 'start';
  this.player = new Turret();
  this.shapes = [];
  this.particles = [];
  this.arenaSize = createVector(500,500);
  this.score = 0;
  this.volume = {
    sfx:100,
    music:100,
  };
  this.sounds = {};
  this.music = null;
  this.inArena = 1;
  this.buttons = [];
  this.fading = {func:null,alpha:0,inProgress:false,val:true};
  this.menuBack = new MenuBack();
  var high = getItem('high');
  this.high = (high != null)?high:0;

  this.main = function()
  {
    background(220);
    switch (this.page)
    {
      case 'start':
        this.start();
        break;
      case 'menu':
        this.menu();
        break;
      case 'preferences':
        this.preferences();
        break;
      case 'game':
        this.game();
        break;
      case 'over':
        this.over();
        break;
    }
    for (var button of this.buttons)
    {
      button.run();
    }
    this.handleFading();
    this.handleMusic();
  }

  this.start = function()
  {
    this.menuBack.render();
    push();
    fill(51);
    noStroke();
    textSize(40);
    textAlign(CENTER,CENTER);
    textFont('tahoma');
    text('Click to continue',width/2,height/2);
    pop();
  }

  this.menu = function()
  {
    this.menuBack.render();
    push();
    fill(51);
    stroke(51);
    strokeJoin(ROUND);
    strokeWeight(2);
    textSize(58);
    textAlign(CENTER,CENTER);
    textFont('Zen Kurenaido');
    text('SHOOTER',width/2,height/4+36);
    fill(204, 120, 47);
    noStroke();
    textSize(84);
    textFont('Righteous');
    textAlign(LEFT,CENTER);
    var txt = 'Shape';
    var size = textWidth(txt)
    var x = width/2-size/2;
    for (var i = 0; i < txt.length; i++)
    {
      fill(lerpColor(color(214, 187, 88),color(209, 61, 61),map(i,0,txt.length-1,0,1)));
      text(txt[i],x,height/4-36);
      x+=textWidth(txt[i]);
    }
    fill(51);
    textFont('tahoma');
    textSize(27);
    textAlign(CENTER,CENTER);
    text('Created by Destructiod',width/2,height*0.75-10);
    textSize(17.5);
    text('Sounds and Music by Zapsplat.com',width/2,height*0.75+12);
    pop();
  }

  this.preferences = function()
  {
    this.menuBack.render();
    push();
    fill(204, 120, 47);
    noStroke();
    textSize(84);
    textFont('Righteous');
    textAlign(LEFT,CENTER);
    var txt = 'Preferences';
    var size = textWidth(txt)
    var x = width/2-size/2;
    for (var i = 0; i < txt.length; i++)
    {
      fill(lerpColor(color(214, 187, 88),color(209, 61, 61),map(i,0,txt.length-1,0,1)));
      text(txt[i],x,height/4);
      x+=textWidth(txt[i]);
    }
    fill(51,150);
    rectMode(CENTER);
    rect(width/2,height/2-30,200,50);
    rect(width/2,height/2+30,200,50);
    fill(220);
    textSize(36);
    textFont('tahoma');
    textAlign(LEFT,CENTER);
    text(this.volume.sfx+'%',width/2-90,height/2-28);
    text(this.volume.music+'%',width/2-90,height/2+32);
    push();
    translate(width/2+75,height/2+30);
    noFill();
    stroke(220);
    strokeJoin(ROUND);
    strokeWeight(2);
    ellipse(8,10,6,6);
    ellipse(-8,7,6,6);
    line(-5,7,-5,-10);
    line(11,10,11,-7);
    line(-5,-10,11,-7);
    line(-5,-5,11,-2);
    pop();
    push();
    translate(width/2+75,height/2-30);
    noFill();
    stroke(220);
    strokeJoin(ROUND);
    strokeWeight(2);
    rect(0,-3,6,16,3);
    arc(0,3,12,12,0,PI);
    line(-6,3,-6,-3);
    line(6,3,6,-3);
    line(0,9,0,12);
    line(-3,12,3,12);
    pop();
    pop();
  }

  this.game = function()
  {
    if (game.player.alpha == 0 && !this.fading.inProgress)
    {
      game.fade(function(){game.page='over';});
    }
    this.renderArena();
    for (var i = this.shapes.length-1; i >= 0; i--)
    {
      this.shapes[i].update();
      this.shapes[i].render();
      if (this.shapes[i].alpha <= 0)
      {
        this.shapes.splice(i,1);
      }
    }
    this.player.update();
    this.player.render();
    for (var j = this.particles.length-1; j >= 0; j--)
    {
      this.particles[j].update();
      this.particles[j].render();
      if (this.particles[j].span <= 0)
      {
        this.particles.splice(j,1);
      }
    }
    if (this.shapes.length < round(this.inArena) && !game.player.fading)
    {
      this.addShape();
    }
    this.inArena+=constrain(0.001-this.score/1000,0.0005,1);
  }

  this.over = function()
  {
    this.menuBack.render();
    push();
    fill(51);
    stroke(51);
    strokeJoin(ROUND);
    strokeWeight(2);
    textSize(70);
    textAlign(CENTER,CENTER);
    textFont('Zen Kurenaido');
    text('OVER',width/2,height/4+32);
    if (this.score < this.high)
    {
      noStroke();
      textSize(56);
      textFont('tahoma');
      text(this.score,width/2,height/2-14);
      textSize(26);
      text('Hi: '+this.high,width/2,height/2+24);
    } else
    {
      noStroke();
      textSize(72);
      textFont('tahoma');
      text(this.score,width/2,height/2+4);
    }
    fill(204, 120, 47);
    noStroke();
    textSize(64);
    textFont('Righteous');
    textAlign(LEFT,CENTER);
    var txt = 'Game';
    var size = textWidth(txt)
    var x = width/2-size/2;
    for (var i = 0; i < txt.length; i++)
    {
      fill(lerpColor(color(214, 187, 88),color(209, 61, 61),map(i,0,txt.length-1,0,1)));
      text(txt[i],x,height/4-32);
      x+=textWidth(txt[i]);
    }
    pop();
  }

  this.playSound = function(id,multiplier=1)
  {
    var sound = this.sounds[id].cloneNode();
    sound.volume = (this.volume.sfx/100)*multiplier;
    sound.play();
  }

  this.handleMusic = function()
  {
    this.music.volume = this.volume.music/150;
  }

  this.playMusic = function()
  {
    this.music.play();
  }

  this.createSounds = function()
  {
    this.music = new Audio('sounds/music.mp3');
    this.music.loop = true;
    var sounds = ['grantGift','grantGun','bomb','grenade','machine','rail','shotgun','normal','hover','button','death','hit1','hit2','hit3','shatter1','shatter2','shatter3','loseLife','grantEdge'];
    for (var sound of sounds)
    {
      this.sounds[sound] = new Audio('sounds/'+sound+'.mp3');
    }
  }

  this.createButtons = function()
  {
    this.buttons.push(new Button(createVector(width/2,height/2-25),
    function(button){
      fill(51,150+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,300,40);
      fill(220);
      textSize(24);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('Play',0,2);
    },function(){
      return (game.page == 'menu');
    },function(){
      game.playSound('button');
      game.fade(function(){game.reset();game.page='game';});
    },function(button){
      return (abs(mouseX-button.pos.x) < 150 && abs(mouseY-button.pos.y) < 20);
    }));
    this.buttons.push(new Button(createVector(width/2,height/2+25),
    function(button){
      fill(51,150+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,300,40);
      fill(220);
      textSize(24);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('Preferences',0,2);
    },function(){
      return (game.page == 'menu');
    },function(){
      game.playSound('button');
      game.fade(function(){game.page='preferences';});
    },function(button){
      return (abs(mouseX-button.pos.x) < 150 && abs(mouseY-button.pos.y) < 20);
    }));
    this.buttons.push(new Button(createVector(width/2,height*0.75-25),
    function(button){
      fill(51,150+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,300,40);
      fill(220);
      textSize(24);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('Replay',0,2);
    },function(){
      return (game.page == 'over');
    },function(){
      game.playSound('button');
      game.fade(function(){if (game.score > game.high){game.high=game.score;storeItem('high',game.high);}game.reset();game.page='game';});
    },function(button){
      return (abs(mouseX-button.pos.x) < 150 && abs(mouseY-button.pos.y) < 20);
    }));
    this.buttons.push(new Button(createVector(width/2,height*0.75+25),
    function(button){
      fill(51,150+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,300,40);
      fill(220);
      textSize(24);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('Menu',0,2);
    },function(){
      return (game.page == 'over');
    },function(){
      game.playSound('button');
      game.fade(function(){game.page='menu';if (game.score > game.high){game.high=game.score;storeItem('high',game.high);}});
    },function(button){
      return (abs(mouseX-button.pos.x) < 150 && abs(mouseY-button.pos.y) < 20);
    }));
    this.buttons.push(new Button(createVector(width/2,height*0.75),
    function(button){
      fill(51,150+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,300,40);
      fill(220);
      textSize(24);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('Back',0,2);
    },function(){
      return (game.page == 'preferences');
    },function(){
      game.playSound('button');
      game.fade(function(){game.page='menu';});
    },function(button){
      return (abs(mouseX-button.pos.x) < 150 && abs(mouseY-button.pos.y) < 20);
    }));
    this.buttons.push(new Button(createVector(width/2-125,height/2-30),
    function(button){
      fill(51,170+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,50,50);
      fill(220);
      textSize(32);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('-',0,2);
    },function(){
      return (game.page == 'preferences');
    },function(){
      game.playSound('button');
      game.volume.sfx = constrain(game.volume.sfx-10,0,100);
    },function(button){
      return (abs(mouseX-button.pos.x) < 25 && abs(mouseY-button.pos.y) < 25);
    }));
    this.buttons.push(new Button(createVector(width/2+125,height/2-30),
    function(button){
      fill(51,170+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,50,50);
      fill(220);
      textSize(32);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('+',0,2);
    },function(){
      return (game.page == 'preferences');
    },function(){
      game.playSound('button');
      game.volume.sfx = constrain(game.volume.sfx+10,0,100);
    },function(button){
      return (abs(mouseX-button.pos.x) < 25 && abs(mouseY-button.pos.y) < 25);
    }));
    this.buttons.push(new Button(createVector(width/2-125,height/2+30),
    function(button){
      fill(51,170+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,50,50);
      fill(220);
      textSize(32);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('-',0,2);
    },function(){
      return (game.page == 'preferences');
    },function(){
      game.playSound('button');
      game.volume.music = constrain(game.volume.music-10,0,100);
    },function(button){
      return (abs(mouseX-button.pos.x) < 25 && abs(mouseY-button.pos.y) < 25);
    }));
    this.buttons.push(new Button(createVector(width/2+125,height/2+30),
    function(button){
      fill(51,170+button.val/2);
      noStroke();
      rectMode(CENTER);
      rect(0,0,50,50);
      fill(220);
      textSize(32);
      textFont('tahoma');
      textAlign(CENTER,CENTER);
      text('+',0,2);
    },function(){
      return (game.page == 'preferences');
    },function(){
      game.playSound('button');
      game.volume.music = constrain(game.volume.music+10,0,100);
    },function(button){
      return (abs(mouseX-button.pos.x) < 25 && abs(mouseY-button.pos.y) < 25);
    }));
  }

  this.checkButtons = function()
  {
    for (var button of this.buttons)
    {
      if (button.clicked())return true;
    }
  }

  this.renderArena = function()
  {
    push();
    rectMode(CENTER);
    noStroke();
    fill(210);
    rect(width/2,height/2,this.arenaSize.x,this.arenaSize.y,10);
    fill(200);
    rect(width/2,height/2,this.arenaSize.x/2,this.arenaSize.y/2,10);
    fill(220);
    textSize((this.score > 99)?120:180);
    textAlign(CENTER,CENTER);
    textFont('tahoma');
    text(this.score,width/2,height/2+8);
    pop();
    pop();
  }

  this.fade = function(func)
  {
    this.fading.func = func;
    this.fading.inProgress = true;
  }

  this.handleFading = function()
  {
    if (this.fading.inProgress)
    {
      if (this.fading.val)
      {
        this.fading.alpha+=10;
        if (this.fading.alpha >= 255)
        {
          this.fading.alpha = 255;
          this.fading.val = false;
          this.fading.func();
        }
      } else
      {
        this.fading.alpha-=10;
        if (this.fading.alpha <= 0)
        {
          this.fading.alpha = 0;
          this.fading.page = '';
          this.fading.val = true;
          this.fading.inProgress = false;
        }
      }
    }
    background(255,this.fading.alpha);
  }

  this.addShape = function()
  {
    var pos = null;
    while (true)
    {
      pos = createVector(random(width/2-this.arenaSize.x/2+24,width/2+this.arenaSize.x/2-24),random(height/2-this.arenaSize.y/2+24,height/2+this.arenaSize.y/2-24));
      var hitting = false;
      for (var shape of this.shapes)
      {
        if (p5.Vector.dist(shape.pos,pos) < 24+shape.radius)
        {
          hitting = true;
          break;
        }
      }
      if (p5.Vector.dist(pos,this.player.pos) < 200 || hitting)
      {
        continue;
      }
      break;
    }
    var maxEdge = constrain(map(this.score,0,50,3,10),3,10);
    var edges = round(map(random(1)*random(1),0,1,3,maxEdge));
    var shape = new Shape(pos,edges);
    this.shapes.push(shape);
  }

  this.reset = function()
  {
    this.player = new Turret();
    this.shapes = [];
    this.particles = [];
    this.score = 0;
    this.inArena = 1;
    this.addShape();
  }

  this.setup = function()
  {
    this.createButtons();
    this.createSounds();
    this.reset();
  }
}

function Turret()
{
  this.pos = createVector(width/2,height/2);
  this.vel = createVector();
  this.mouse = createVector();
  this.angle = 0;
  this.shapeAngle = random(PI*2);
  this.edges = 5;
  this.radius = 20;
  this.color = color(84, 116, 196);
  this.alpha = 255;
  this.fading = false;
  this.recharge = 0;
  this.rechargeDisp = 0;
  this.gun = 'normal';
  this.blink = false;
  this.blinks = 0;
  this.blinkTimer = 0;
  this.gift = '';
  this.giftTimer = 0;
  this.giftExecuted = false;
  this.giftAlpha = 0;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    noStroke();
    fill(120,this.alpha);
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2+this.shapeAngle;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y+5);
    }
    endShape(CLOSE);
    rotate(this.angle);
    fill(100,this.alpha);
    stroke(50,this.alpha);
    strokeWeight(2);
    strokeJoin(ROUND);
    rectMode(CENTER);
    if (this.gun == 'normal')
    {
      rect(15-this.rechargeDisp/4,0,30-this.rechargeDisp/2,10+this.rechargeDisp/5);
    } else if (this.gun == 'shotgun')
    {
      rect(15-this.rechargeDisp/8,3+this.rechargeDisp/30,30-this.rechargeDisp/4,3+this.rechargeDisp/16);
      rect(15-this.rechargeDisp/8,-3-this.rechargeDisp/30,30-this.rechargeDisp/4,3+this.rechargeDisp/16);
    } else if (this.gun == 'rail')
    {
      rect(15-this.rechargeDisp/4,0,30-this.rechargeDisp/2,6+this.rechargeDisp/5);
      rect(34-this.rechargeDisp,0,8-this.rechargeDisp/2,3+this.rechargeDisp/5);
    } else if (this.gun == 'machine')
    {
      rect(14-this.rechargeDisp/4,0,28-this.rechargeDisp/2,10+this.rechargeDisp/5);
      push();
      strokeWeight(1);
      rect(30-this.rechargeDisp/2,0,3,2);
      rect(30-this.rechargeDisp/2,-4,3,2);
      rect(30-this.rechargeDisp/2,4,3,2);
      pop();
    } else if (this.gun == 'grenade')
    {
      rect(15-this.rechargeDisp/32,0,30-this.rechargeDisp/4,16+this.rechargeDisp/16);
    }
    pop();
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.shapeAngle);
    fill(red(this.color),green(this.color),blue(this.color),this.alpha);
    stroke(red(this.color)-50,green(this.color)-50,blue(this.color)-50,this.alpha);
    if (this.blink)
    {
      fill(227, 111, 109,this.alpha);
      stroke(177, 61, 59,this.alpha);
    }
    strokeWeight(2);
    strokeJoin(ROUND);
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y);
    }
    endShape(CLOSE);
    pop();
    push();
    translate(this.pos.x,this.pos.y);
    if (this.gift == 'flash')
    {
      stroke(220,this.giftAlpha);
      strokeWeight(2);
      noFill();
      strokeJoin(ROUND);
      beginShape();
      var edges = [0.2,0.5,0.3,0.6,0.2,0.5,0.4,0.5,0.2,0.6,0.2,0.4,0.5,0.6];
      for (var i = 0; i < edges.length; i++)
      {
        var angle = map(i,0,edges.length,0,PI*2);
        var pos = createVector(this.radius*edges[i]*cos(angle),this.radius*edges[i]*sin(angle));
        vertex(pos.x,pos.y);
      }
      endShape(CLOSE);
    } else if (this.gift == 'slo-mo')
    {
      var amount = 5;
      for (var i = 0; i < amount; i++)
      {
        var x = map(i,0,amount-1,-this.radius/4,this.radius/4);
        fill(220,255*map(i,0,amount,0.1,1)*(this.giftAlpha/255));
        noStroke();
        push();
        translate(x,0);
        rotate(map(i,0,amount-1,0,PI/2));
        beginShape();
        for (var j = 0; j < 3; j++)
        {
          var angle = map(j,0,3,0,PI*2);
          var pos = createVector(this.radius*0.5*cos(angle),this.radius*0.5*sin(angle));
          vertex(pos.x,pos.y);
        }
        endShape(CLOSE);
        pop();
      }
    }
    pop();
  }

  this.shoot = function(bullets=1)
  {
    if (this.recharge > 0)return;
    game.playSound(this.gun,(this.gun == 'grenade')?1:0.5);
    var accuracy = (this.gun == 'normal')?0.025:(this.gun == 'rail')?0:(this.gun == 'machine')?0.2:(this.gun == 'shotgun')?0.4:(this.gun == 'grenade')?0.3:0;
    this.recharge = (1-accuracy)*24;
    if (this.gun == 'shotgun')
    {
      this.recharge = 45;
    } else if (this.gun == 'grenade')
    {
      this.recharge = 60;
    } else if (this.gun == 'machine')
    {
      this.recharge = 18;
    }
    for (var i = 0; i < 15; i++)
    {
      game.particles.push(new Particle(this.pos.copy().add(p5.Vector.fromAngle(this.angle).copy().setMag(this.radius+7)),p5.Vector.fromAngle(this.angle+random(-PI/5,PI/5)).setMag(random(6)),random(4,8),random(20,30),0.75,color(20),round(random(3,6))));
    }
    if (this.gun == 'grenade')
    {
      var dir = p5.Vector.fromAngle(this.angle+random(-accuracy/2,accuracy/2)).setMag(10);
      game.particles.push(new Grenade(this.pos.copy().add(dir.copy().setMag(this.radius+15)),dir));
      return;
    }
    var totalHits = [];
    for (var j = 0; j < bullets; j++)
    {
      var particleTimer = random(10);
      var hits = [];
      var dir = p5.Vector.fromAngle(this.angle+random(-accuracy/2,accuracy/2)).setMag(2);
      var pos = this.pos.copy().add(dir.copy().setMag(this.radius+15));
      var prev = pos.copy();
      var hittingEdge = false;
      while (true)
      {
        pos.add(dir);
        if (p5.Vector.dist(pos,prev) > 20)
        {
          particleTimer--;
          if (particleTimer <= 0)
          {
            if (this.gun == 'normal')
            {
              game.particles.push(new Particle(pos,p5.Vector.random2D().setMag(random(0,2)),random(2,8),random(10,30),0.9,color(214, 137, 49),4));
              particleTimer = 20;
            } else if (this.gun == 'shotgun')
            {
              game.particles.push(new Particle(pos,p5.Vector.random2D().setMag(random(0,1)),random(2,8),random(10,30),0.9,color(214, 137, 49),3));
              particleTimer = 30;
            } else if (this.gun == 'rail')
            {
              game.particles.push(new Particle(pos,p5.Vector.random2D().setMag(random(0,2)),random(2,6),random(10,30),0.9,color(49,137,214),3));
              particleTimer = 10;
            }if (this.gun == 'machine')
            {
              game.particles.push(new Particle(pos,p5.Vector.random2D().setMag(random(0,3)),random(2,6),random(10,30),0.9,color(214, 137, 49),4));
              particleTimer = 20;
            }
          }
        }
        for (var shape of game.shapes)
        {
          if (p5.Vector.dist(pos,shape.pos) < shape.radius && !shape.fading && !hits.includes(shape))
          {
            shape.hit(pos);
            hits.push(shape);
            break;
          }
        }
        var valid = true;
        if ((this.gun == 'normal' || this.gun == 'shotgun' || this.gun == 'machine') && hits.length > 0)
        {
          valid = false;
        }
        hittingEdge = (pos.x < width/2-game.arenaSize.x/2 || pos.x > width/2+game.arenaSize.x/2 || pos.y < height/2-game.arenaSize.y/2 || pos.y > height/2+game.arenaSize.y/2);
        if (hittingEdge || !valid)
        {
          break;
        }
      }
      for (var hit of hits)
      {
        totalHits.push(hit);
      }
      if (hittingEdge)
      {
        for (var i = 0; i < 20; i++)
        {
          game.particles.push(new Particle(pos,p5.Vector.random2D().setMag(random(5)),random(6,10),random(20,40),0.8,color(220),round(random(3,6))));
        }
      }
    }
    if (totalHits.length > 0)
    {
      game.score+=totalHits.length;
      game.playSound('shatter'+random([1,2,3]),0.5);
    }
  }

  this.fire = function()
  {
    if (this.recharge <= 0)
    {
      this.shoot();
    }
  }

  this.shotgunFire = function()
  {
    this.shoot(3);
  }

  this.update = function()
  {
    if (this.blinks > 0)
    {
      this.blinkTimer--;
      if (this.blinkTimer <= 0)
      {
        this.blinks--;
        this.blinkTimer = 10;
        this.blink = !this.blink;
      }
    } else
    {
      this.blink = false;
    }
    this.pos.add(this.vel);
    this.vel.mult(0.9);
    if (this.recharge > 0)
    {
      this.recharge--;
    }
    if (this.gift)
    {
      if (this.giftExecuted)
      {
        if (this.giftTimer > 0)
        {
          this.giftTimer--;
        } else
        {
          this.giftAlpha-=5;
          if (this.giftAlpha <= 0)
          {
            this.gift = '';
            this.giftExecuted = false;
            this.giftTimer = 0;
          }
        }
      } else if (this.giftAlpha < 255)
      {
        this.giftAlpha+=5;
      }
    }
    this.rechargeDisp = lerp(this.rechargeDisp,this.recharge,0.2);
    this.shapeAngle+=0.01;
    if (this.pos.x < width/2-game.arenaSize.x/4+this.radius)
    {
      this.pos.x = width/2-game.arenaSize.x/4+this.radius;
      this.vel.x*=-1;
    } else if (this.pos.x > width/2+game.arenaSize.x/4-this.radius)
    {
      this.pos.x = width/2+game.arenaSize.x/4-this.radius;
      this.vel.x*=-1;
    }
    if (this.pos.y < height/2-game.arenaSize.y/4+this.radius)
    {
      this.pos.y = height/2-game.arenaSize.y/4+this.radius;
      this.vel.y*=-1;
    } else if (this.pos.y > height/2+game.arenaSize.y/4-this.radius)
    {
      this.pos.y = height/2+game.arenaSize.y/4-this.radius;
      this.vel.y*=-1;
    }
    if (!this.fading)
    {
      this.updateAngle();
      if (this.gun == 'machine' && mouseIsPressed)
      {
        this.fire();
      }
    } else
    {
      this.alpha-=5;
    }
  }

  this.updateAngle = function()
  {
    var heading = p5.Vector.fromAngle(this.angle);
    var mouse = createVector(mouseX-this.pos.x,mouseY-this.pos.y).normalize();
    var relative = mouse.copy().sub(heading.normalize());
    var theta = (this.gun == 'normal')?0.15:(this.gun == 'shotgun')?0.2:(this.gun == 'machine')?0.075:(this.gun == 'grenade')?0.1:0.125;
    var angle = heading.copy().mult(cos(theta)).add(relative.mult(sin(theta)));
    this.angle = angle.heading();
  }

  this.fade = function()
  {
    if (!this.fading)
    {
      game.playSound('death');
      for (var i = 0; i < 12; i++)
      {
        game.particles.push(new Particle(this.pos,p5.Vector.random2D().setMag(random(0,8)),random(4,24),random(60,80),0.8,this.color,this.edges));
      }
    }
    this.fading = true;
  }

  this.executeGift = function()
  {
    if (this.giftTimer > 0)return;
    if (this.gift == 'slo-mo')
    {
      this.giftTimer = 600;
    } else if (this.gift == 'flash')
    {
      for (var shape of game.shapes)
      {
        if (shape.pos.x > width/2-game.arenaSize.x/4 && shape.pos.x < width/2+game.arenaSize.x/4 && shape.pos.y > height/2-game.arenaSize.y/4 && shape.pos.y < height/2+game.arenaSize.y/4)
        {
          shape.hit(shape.pos.copy(),true);
        }
      }
    }
    this.giftExecuted = true;
  }
}

function Grenade(pos,vel)
{
  this.pos = pos.copy();
  this.vel = vel.copy();
  this.radius = 8;
  this.angle = random(PI*2);
  this.angleSpeed = 0.15;
  this.span = 1;
  this.alpha = 255;
  this.fade = false;
  this.color = color(214, 137, 49);
  this.edges = 3;
  this.particleTimer = 0;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.angle);
    fill(red(this.color),green(this.color),blue(this.color),200*(this.alpha/255));
    noStroke();
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y);
    }
    endShape(CLOSE);
    pop();
    if (!this.fading)
    {
      this.particleTimer-=this.vel.mag();
      if (this.particleTimer <= 0)
      {
        game.particles.push(new Particle(this.pos.copy(),p5.Vector.random2D().setMag(random(0,1)),4,random(60,80),0.9,color(214, 137, 49),3));
        this.particleTimer = 50;
      }
    }
  }

  this.update = function()
  {
    this.angle+=this.angleSpeed;
    if (this.fade)
    {
      this.alpha-=10;
      if (this.alpha <= 0)
      {
        this.span = 0;
      }
    } else
    {
      this.pos.add(this.vel);
      this.vel.mult(0.97);
      for (var i = 0; i < game.shapes.length; i++)
      {
        var shape = game.shapes[i];
        if (p5.Vector.dist(this.pos,shape.pos) < shape.radius && !shape.fading)
        {
          shape.hit(this.pos,true);
          game.score++;
          this.explode();
          game.playSound('shatter'+random([1,2,3]),0.5);
          break;
        }
      }
      if (this.pos.x < width/2-game.arenaSize.x/2+this.radius || this.pos.x > width/2+game.arenaSize.x/2-this.radius || this.pos.y < height/2-game.arenaSize.y/2+this.radius || this.pos.y > height/2+game.arenaSize.y/2-this.radius)
      {
        this.explode();
        for (var i = 0; i < 20; i++)
        {
          game.particles.push(new Particle(this.pos.copy(),p5.Vector.random2D().setMag(random(5)),random(6,10),random(20,40),0.8,color(220),round(random(3,6))));
        }
      }
    }
  }

  this.explode = function()
  {
    if (this.fade)return;
    game.playSound('death');
    for (var i = 0; i < round(random(6,8)); i++)
    {
      game.particles.push(new Particle(this.pos.copy(),p5.Vector.random2D().setMag(random(3,7)),random(2,8),random(25,50),0.95,color(214, 137, 49),random(3,6),true));
    }
    this.fade = true;
  }
}

function Shape(pos,edges=3)
{
  this.pos = pos.copy();
  this.vel = createVector();
  this.edges = edges;
  this.angle = random(PI*2);
  this.angleSpeed = random([-0.01,0.01]);
  this.radius = random(15,24);
  this.alpha = 1;
  this.fading = false;
  this.ready = false;
  this.speed = random(0.005,0.015);
  this.bounceBack = random(2,3);
  this.mass = this.radius/2;
  this.gift = (random(1) < 0.025+this.edges/60 && game.score > 30)?((game.player.gun == 'normal' && random(1) < 0.7)?random(['machine','shotgun','rail','grenade']):random(['flash','slo-mo'])):null;
  this.extraEdge = (random(1) < 0.05+this.edges/60 && game.score > 15 && !this.gift);
  this.special = (this.gift || this.extraEdge);
  this.bomb = (random(1) < 0.1 && game.score > 75 && !this.special);
  this.colorA = (this.special)?color(149,109,198):(this.bomb)?color(147,14,14):color(214, 187, 88);
  this.colorB = (this.special)?color(149,109,198):(this.bomb)?color(147,14,14):color(209, 61, 61);
  this.color = lerpColor(this.colorA,this.colorB,map(this.edges,3,10,0,1));
  this.color_ = this.color;
  this.pulse = 0;
  this.pulseVal = 0;
  this.blink = false;
  this.blinks = 0;
  this.blinkTimer = 0;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    scale(map(this.pulse,-1,1,0.9,1.1));
    fill(120,this.alpha);
    noStroke();
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2+this.angle;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y+5);
    }
    endShape(CLOSE);
    rotate(this.angle);
    fill(red(this.color),green(this.color),blue(this.color),this.alpha);
    stroke(red(this.color)-50,green(this.color)-50,blue(this.color)-50,this.alpha);
    if (this.blink)
    {
      fill(227, 111, 109,this.alpha);
      stroke(177, 61, 59,this.alpha);
    }
    strokeWeight(2);
    strokeJoin(ROUND);
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y);
    }
    endShape(CLOSE);
    pop();
  }

  this.update = function()
  {
    this.color_ = lerpColor(this.colorA,this.colorB,map(this.edges,3,10,0,1));
    this.color = lerpColor(this.color,this.color_,0.15);
    if (this.blinks > 0)
    {
      this.blinkTimer--;
      if (this.blinkTimer <= 0)
      {
        this.blinks--;
        this.blinkTimer = 10;
        this.blink = !this.blink;
      }
    } else
    {
      this.blink = false;
    }
    if (this.ready)
    {
      var damping = (game.player.gift == 'slo-mo' && game.player.giftTimer > 0)?0.5:1;
      this.pos.add(this.vel.copy().mult(damping));
      this.vel.mult(0.99);
      this.angle+=this.angleSpeed*damping;
      if (this.fading)
      {
        this.alpha-=3;
      } else
      {
        this.attackPlayer();
      }
      for (var shape of game.shapes)
      {
        if (shape == this)continue;
        if (p5.Vector.dist(this.pos,shape.pos) < this.radius+shape.radius)
        {
          this.bounce(shape);
        }
      }
      for (var particle of game.particles)
      {
        if (p5.Vector.dist(particle.pos,this.pos) < this.radius && particle.bounce && !this.fading)
        {
          game.playSound('shatter'+random([1,2,3]),0.5);
          particle.span = 0;
          game.score++;
          this.hit(particle.pos.copy());
        }
      }
      if (this.pos.x < width/2-game.arenaSize.x/2+this.radius)
      {
        this.pos.x = width/2-game.arenaSize.x/2+this.radius;
        this.vel.x*=-1;
      } else if (this.pos.x > width/2+game.arenaSize.x/2-this.radius)
      {
        this.pos.x = width/2+game.arenaSize.x/2-this.radius;
        this.vel.x*=-1;
      }
      if (this.pos.y < height/2-game.arenaSize.y/2+this.radius)
      {
        this.pos.y = height/2-game.arenaSize.y/2+this.radius;
        this.vel.y*=-1;
      } else if (this.pos.y > height/2+game.arenaSize.y/2-this.radius)
      {
        this.pos.y = height/2+game.arenaSize.y/2-this.radius;
        this.vel.y*=-1;
      }
      if (this.special)
      {
        this.pulse = lerp(this.pulse,sin(this.pulseVal/10),0.1);
        this.pulseVal++;
      }
    } else
    {
      this.alpha+=5;
      if (this.alpha >= 255)
      {
        this.ready = true;
        this.alpha = 255;
      }
    }
  }

  this.hit = function(pos,immediate)
  {
    this.blinks = 6;
    var particlePos = pos.copy();
    if (this.edges == 3 || immediate)
    {
      this.fade();
      if (this.extraEdge && game.player.edges < 10)
      {
        game.player.edges++;
        game.playSound('grantEdge',0.5);
      }
      if (['flash','slo-mo'].includes(this.gift) && game.player.gift == '')
      {
        game.player.gift = this.gift;
        game.playSound('grantGift');
      } else if (this.gift)
      {
        game.player.gun = this.gift;
        game.playSound('grantGun');
      }
      if (this.bomb)
      {
        game.playSound('death');
        for (var i = 0; i < round(random(6,8)); i++)
        {
          game.particles.push(new Particle(this.pos.copy(),p5.Vector.random2D().setMag(random(3,7)),random(2,8),random(25,50),0.95,color(214, 137, 49),random(3,6),true));
        }
      }
      for (var i = 0; i < 8; i++)
      {
        game.particles.push(new Particle(this.pos,p5.Vector.random2D().setMag(random(0,3)),random(8,16),random(40,30),0.9,this.color,this.edges));
      }
    } else
    {
      this.edges--;
      for (var i = 0; i < 10; i++)
      {
        game.particles.push(new Particle(particlePos,p5.Vector.random2D().setMag(random(1,2)),random(2,6),random(20,30),0.9,this.color,this.edges+1));
      }
    }
    var force = this.pos.copy().sub(pos);
    force.setMag(1);
    this.vel.add(force);
  }

  this.bounce = function(shape)
  {
    var pos = this.pos.copy();
    this.pos = shape.pos.copy().add(this.pos.copy().sub(shape.pos).setMag(this.radius+shape.radius));
    shape.pos = pos.copy().add(shape.pos.copy().sub(pos).setMag(this.radius+shape.radius));
    var normal = this.pos.copy().sub(shape.pos).normalize();
    var relativeVel = this.vel.copy().sub(shape.vel);
    var separateVel = p5.Vector.dot(relativeVel,normal);
    var velocityVec = normal.mult(-separateVel);
    this.vel.add(velocityVec.copy().mult(shape.mass/this.mass));
    shape.vel.add(velocityVec.copy().mult(-(this.mass/shape.mass)));
    var particlePos = this.pos.copy().add(shape.pos.copy().sub(this.pos).div(2));
    for (var i = 0; i < 10; i++)
    {
      game.particles.push(new Particle(particlePos,p5.Vector.random2D().setMag(random(2)),random(2,6),random(10,30),0.9,lerpColor(this.color,shape.color,0.5),round((this.edges+shape.edges)/2)));
    }
  }

  this.attackPlayer = function()
  {
    if (game.player.fading)
    {
      this.fade();
      return;
    }
    this.vel.add(game.player.pos.copy().sub(this.pos).setMag(this.speed));
    if (p5.Vector.dist(this.pos,game.player.pos) < this.radius+game.player.radius)
    {
      game.playSound('loseLife');
      this.vel.add(game.player.pos.copy().sub(this.pos).setMag(-this.bounceBack));
      if (game.player.edges-1 < 3)
      {
        game.player.fade();
      } else
      {
        game.player.edges--;
        game.player.gun = 'normal';
      }
      this.vel.add(p5.Vector.fromAngle(this.angle).setMag(-2));
      game.player.vel.add(game.player.pos.copy().sub(this.pos).setMag(1));
      game.player.blinks = 6;
      if (this.edges == 3)
      {
        this.fade();
      } else
      {
        this.edges--;
      }
    }
  }

  this.fade = function()
  {
    this.fading = true;
  }
}

function MenuBack()
{
  this.shapes = [];
  for (var i = 0; i < (width*height/75000); i++)
  {
    this.shapes.push(new MenuShape());
  }

  this.render = function()
  {
    for (var shape of this.shapes)
    {
      shape.update();
      shape.render();
    }
  }
}

function MenuShape()
{
  this.pos = createVector(random(width),random(height));
  this.vel = p5.Vector.random2D().setMag(random(1));
  this.edges = round(map(random(1)*random(1),0,1,3,10));
  this.angle = random(PI*2);
  this.angleSpeed = random([-0.01,0.01]);
  this.radius = random(10,20);
  this.alpha = 255;
  this.color = lerpColor(color(214, 187, 88),color(209, 61, 61),map(this.edges,3,10,0,1));
  if (random(1) < 0.1)
  {
    this.special = true;
    this.color = color(149,109,198);
  }
  this.color_ = this.color;
  this.mass = this.radius/2;
  this.pulse = 0;
  this.pulseVal = 0;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    scale(map(this.pulse,-1,1,0.9,1.1));
    fill(120,this.alpha);
    noStroke();
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2+this.angle;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y+5);
    }
    endShape(CLOSE);
    rotate(this.angle);
    fill(red(this.color),green(this.color),blue(this.color),this.alpha);
    stroke(red(this.color)-50,green(this.color)-50,blue(this.color)-50,this.alpha);
    strokeWeight(2);
    strokeJoin(ROUND);
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2;
      var x = cos(angle)*this.radius;
      var y = sin(angle)*this.radius;
      vertex(x,y);
    }
    endShape(CLOSE);
    pop();
  }

  this.update = function()
  {
    this.vel.limit(1.5);
    this.pos.add(this.vel);
    this.angle+=this.angleSpeed;
    if (!this.special)
      this.color_ = lerpColor(color(214, 187, 88),color(209, 61, 61),map(this.edges,3,10,0,1));
    this.color = lerpColor(this.color,this.color_,0.15);
    for (var shape of game.menuBack.shapes)
    {
      if (shape == this)continue;
      if (p5.Vector.dist(this.pos,shape.pos) < this.radius+shape.radius)
      {
        this.bounce(shape);
      }
    }
    if (this.pos.x < this.radius)
    {
      this.pos.x = this.radius;
      this.vel.x*=-1;
    } else if (this.pos.x > width-this.radius)
    {
      this.pos.x = width-this.radius;
      this.vel.x*=-1;
    }
    if (this.pos.y < this.radius)
    {
      this.pos.y = this.radius;
      this.vel.y*=-1;
    } else if (this.pos.y > height-this.radius)
    {
      this.pos.y = height-this.radius;
      this.vel.y*=-1;
    }
    if (this.special)
    {
      this.pulse = lerp(this.pulse,sin(this.pulseVal/10),0.1);
      this.pulseVal++;
    }
  }

  this.bounce = function(shape)
  {
    var pos = this.pos.copy();
    this.pos = shape.pos.copy().add(this.pos.copy().sub(shape.pos).setMag(this.radius+shape.radius));
    shape.pos = pos.copy().add(shape.pos.copy().sub(pos).setMag(this.radius+shape.radius));
    var normal = this.pos.copy().sub(shape.pos).normalize();
    var relativeVel = this.vel.copy().sub(shape.vel);
    var separateVel = p5.Vector.dot(relativeVel,normal);
    var velocityVec = normal.mult(-separateVel);
    this.vel.add(velocityVec.copy().mult(shape.mass/this.mass));
    shape.vel.add(velocityVec.copy().mult(-(this.mass/shape.mass)));
    var particlePos = this.pos.copy().add(shape.pos.copy().sub(this.pos).div(2));
    for (var i = 0; i < 10; i++)
    {
      game.particles.push(new Particle(particlePos,p5.Vector.random2D().setMag(random(2)),random(2,6),random(10,30),0.9,lerpColor(this.color,shape.color,0.5),round((this.edges+shape.edges)/2)));
    }
  }
}

function mousePressed()
{
  if (game.checkButtons())return;
  if (game.page == 'start')
  {
    game.fade(function(){game.page='menu';game.playMusic();});
    game.playSound('button');
  } else if (game.page == 'game')
  {
    if (!game.player.fading && game.player.gun != 'machine')
    {
      if (game.player.gun == 'shotgun')
      {
        game.player.shotgunFire();
      } else
      {
        game.player.shoot();
      }
    }
  }
}

function keyPressed()
{
  if (game.page == 'game' && !game.player.fading && game.player.gift != '' && keyCode == 32)
  {
    game.player.executeGift();
  }
}

function Particle(pos,vel,size,span,damping,color,edges,bounce=false)
{
  this.pos = pos.copy();
  this.vel = vel.copy();
  this.size = size;
  this.radius = this.size/2;
  this.span = span;
  this.origSpan = this.span;
  this.damping = damping;
  this.color = color;
  this.edges = edges;
  this.angle = random(PI*2);
  this.angleSpeed = random([-0.01,0.01]);
  this.bounce = bounce;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.angle);
    var alpha = map(this.span,0,this.origSpan,0,255);
    fill(red(this.color),green(this.color),blue(this.color),alpha);
    noStroke();
    beginShape();
    for (var i = 0; i < this.edges; i++)
    {
      var angle = map(i,0,this.edges,0,PI*2)-PI/2;
      var x = cos(angle)*this.size;
      var y = sin(angle)*this.size;
      vertex(x,y);
    }
    endShape(CLOSE);
    pop();
  }

  this.update = function()
  {
    this.pos.add(this.vel);
    this.vel.mult(this.damping);
    this.angle+=this.angleSpeed;
    this.span--;
    if (this.bounce)
    {
      if (this.pos.x < width/2-game.arenaSize.x/2+this.radius)
      {
        this.pos.x = width/2-game.arenaSize.x/2+this.radius;
        this.vel.x*=-1;
      } else if (this.pos.x > width/2+game.arenaSize.x/2-this.radius)
      {
        this.pos.x = width/2+game.arenaSize.x/2-this.radius;
        this.vel.x*=-1;
      }
      if (this.pos.y < height/2-game.arenaSize.y/2+this.radius)
      {
        this.pos.y = height/2-game.arenaSize.y/2+this.radius;
        this.vel.y*=-1;
      } else if (this.pos.y > height/2+game.arenaSize.y/2-this.radius)
      {
        this.pos.y = height/2+game.arenaSize.y/2-this.radius;
        this.vel.y*=-1;
      }
    }
  }
}

function Button(pos,disp,needs,exec,hovering)
{
  this.pos = pos.copy();
  this.disp = disp;
  this.needs = needs;
  this.exec = exec;
  this.hovering = hovering;
  this.val = 0;
  this.hovered = false;

  this.run = function()
  {
    if (!this.needs())
    {
      return;
    }
    push();
    translate(this.pos.x,this.pos.y);
    this.disp(this);
    pop();
    this.val = lerp(this.val,this.hover()*100,0.15);
    if (this.hover())
    {
      if (!this.hovered)
      {
        game.playSound('hover',0.15);
        this.hovered =  true;
      }
    } else
    {
      this.hovered = false;
    }
  }

  this.hover = function()
  {
    return (this.hovering(this));
  }

  this.clicked = function()
  {
    if (this.hover() && this.needs())
    {
      this.exec();
      return true;
    }
  }
}
