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
  this.page = 'loading';
  this.buttons = [];
  this.sounds = {};
  this.player = new Player();
  this.blocks = [];
  this.enemies = [];
  this.tiles = [];
  this.projectiles = [];
  this.gravity = createVector(0,0.15);
  this.keybinds = {
    right:'D'.charCodeAt(0),
    left:'A'.charCodeAt(0),
    jump:' '.charCodeAt(0),
    reload:'R'.charCodeAt(0),
    changeAction:'V'.charCodeAt(0),
  };
  this.tips = ['You shoot down, you go up','The prison uses drones instead of guards in some circumstances, it\'s cheaper!','If your feeling lucky, use a DEagle and then you\'ll lose your luck','Firing a gun rapidly, no matter what action it\'s in, will make each shot increasingly inaccurate','HARDCORE PARKOUR','AK\'s or AR\'s?','IDK what to put here...'];
  this.tip = random(this.tips);
  this.tipTimer = 0;
  this.maxTipTime = 5;
  this.loadingTime = random(4,7)*60;
  this.fading = {func:null,alpha:0,inProgress:false,val:true};
  this.volume = {sfx:100,music:0};

	this.main = function()
	{
    this[this.page]();
    this.handleButtons();
    this.handleFading();
	}

  this.game = function()
  {
    background(11, 33, 33);
    push();
    for (var l = this.backgrounds.length-1; l >= 0; l--)
    {
      if (this.backgrounds[l].valid())
      {
        this.backgrounds[l].run();
      }
    }
    translate(this.player.focus.pos.x,this.player.focus.pos.y);
    for (var k = this.tiles.length-1; k >= 0; k--)
    {
      this.tiles[k].run();
    }
    for (var j = this.projectiles.length-1; j >= 0; j--)
    {
      this.projectiles[j].run();
      if (this.projectiles[j].splice)
      {
        this.projectiles.splice(j,1);
      }
    }
    for (var i = this.blocks.length-1; i >= 0; i--)
    {
      this.blocks[i].run();
    }
    for (var m = this.enemies.length-1; m >= 0; m--)
    {
      this.enemies[m].update();
      this.enemies[m].render();
      if (this.enemies[m].splice)
      {
        this.enemies.splice(m,1);
      }
    }
    this.player.update();
    this.player.render();
    pop();
    this.player.HUD();
  }

  this.menu = function()
  {
    background(220);
    push();
    fill(51);
    rectMode(CENTER);
    noStroke();
    rect(width/2,height/3,width,180);
    fill(220);
    textFont('Roboto Slab');
    textSize(96);
    textAlign(CENTER,CENTER);
    text('PROJECT',width/2+2,height/3-32);
    fill(0);
    textSize(80);
    textFont('Righteous');
    textAlign(LEFT,CENTER);
    var title = 'FIRESTORM';
    var x = width/2-textWidth(title)/2;
    for (var i = 0; i < title.length; i++)
    {
      fill(lerpColor(color(224, 43, 43),color(227, 120, 32),i/(title.length-1)));
      text(title[i],x,height/3+50);
      x+=textWidth(title[i]);
    }
    pop();
  }

  this.loading = function()
  {
    background(220);
    push();
    fill(51);
    noStroke();
    rectMode(CENTER);
    rect(width/2,height/2,width,180);
    fill(255);
    textAlign(CENTER,CENTER);
    textSize(20);
    textFont('Josefin Sans');
    text((this.loadingTime > 0)?this.tip:'Done, click anywhere to continue',width/2,height/2+70);
    textSize(30);
    fill(220);
    textFont('Roboto Slab');
    var slideVal = (sin(frameCount/10)+1)/0.5;
    text('Loading',width/2,height/2-65);
    translate(width/2-slideVal*5,height/2-16);
    fill(184, 173, 73);
    arc(20+slideVal*24,-17,16,8,-PI/2,PI/2);
    rotate(-slideVal*PI/128);
    fill(180);
    push();
    translate(18,-14);
    rotate(-slideVal*PI/256);
    rect(0,0,60,10);
    rect(-8,7,20,20);
    pop();
    fill(255);
    rect(0,20,40,4);
    rect(18,12,4,16);
    push();
    translate(-15,0);
    rotate(PI/12);
    rect(0,27.5,30,55);
    pop();
    push();
    translate(4.5,-12);
    rotate(slideVal*PI/64);
    noFill();
    stroke(180);
    strokeCap(ROUND);
    strokeWeight(3);
    arc(7.5,15,15,30,PI*0.6,PI);
    pop();
    fill(255);
    rectMode(CENTER);
    rect(0,0,90,10);
    fill(200);
    rect(-slideVal*8,-14,90,20);
    fill(180);
    rect(-slideVal*8,-19,20,10);
    pop();
    this.loadingTime--;
    if (this.loadingTime <= 0)
    {

    }
    this.tipTimer+=1/60;
    if (this.tipTimer >= this.maxTipTime)
    {
      this.tipTimer = 0;
      var tip = random(this.tips);
      while (tip == this.tip)
      {
        tip = random(this.tips);
      }
      this.tip = tip;
    }
  }

  this.settings = function()
  {

  }

  this.mousePressed = function()
  {
    for (var i = 0; i < this.buttons.length; i++)
    {
      if (this.buttons[i].clicked())
      {
        return;
      }
    }
    if (this.page == 'loading' && this.loadingTime <= 0)
    {
      this.fade(function(){game.page='menu';});
      game.playSound('loading-complete');
    } else if (this.page == 'game')
    {
      this.player.mousePressed();
    }
  }

  this.keyPressed = function()
  {
    if (this.page == 'game')
    {
      this.player.keyPressed();
    }
  }

  this.createMap = function()
  {
    var data = getMap();
    this.backgrounds = [...data.backgrounds];
    this.blocks = [...data.blocks];
    this.tiles = [...data.tiles];
    this.enemies = [...data.enemies];
    this.player = new Player();
    this.player.pos = data.playerPos.copy();
    this.player.setup();
  }

  this.playSound = function(id,multiplier=1)
  {
    var sound = this.sounds[id].cloneNode();
    sound.volume = (this.volume.sfx/100)*multiplier;
    sound.play();
  }

  this.createSounds = function()
  {
    this.sounds = {};
    var sounds = ['button-click','button-hover','equip-gun','loading-complete','error'];
    for (var sound of sounds)
    {
      this.sounds[sound] = new Audio('sounds/'+sound+'.mp3');
    }
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
        this.fading.alpha+=12;
        if (this.fading.alpha >= 255)
        {
          this.fading.alpha = 255;
          this.fading.val = false;
          this.fading.func();
        }
      } else
      {
        this.fading.alpha-=12;
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

  this.handleButtons = function()
  {
    for (var i = 0; i < this.buttons.length; i++)
    {
      this.buttons[i].run();
    }
  }

  this.createButtons = function()
  {
    this.buttons.push(new Button(createVector(width/2,height-height/3-60),function(button){
      fill(51+button.value/3);
      noStroke();
      rectMode(CENTER);
      rect(0,0,width,50+button.value/10);
      fill(lerp(220,255,button.value/100));
      textAlign(CENTER,CENTER);
      textSize(30+button.value/20);
      textFont('Roboto Slab');
      text('Play',0,2);
    },function(){
      return (game.page == 'menu');
    },function(button){
      game.fade(function(){game.page='game'});
      game.playSound('button-click');
    },function(button){
      return (abs(mouseY-button.pos.y) < 25);
    }));
    this.buttons.push(new Button(createVector(width/2,height-height/3),function(button){
      fill(51+button.value/3);
      noStroke();
      rectMode(CENTER);
      rect(0,0,width,50+button.value/10);
      fill(lerp(220,255,button.value/100));
      textAlign(CENTER,CENTER);
      textSize(30+button.value/20);
      textFont('Roboto Slab');
      text('Preferences',0,2);
    },function(){
      return (game.page == 'menu');
    },function(button){
      game.playSound('button-click');
    },function(button){
      return (abs(mouseY-button.pos.y) < 25);
    }));
    this.buttons.push(new Button(createVector(width/2,height-height/3+60),function(button){
      fill(51+button.value/3);
      noStroke();
      rectMode(CENTER);
      rect(0,0,width,50+button.value/10);
      fill(lerp(220,255,button.value/100));
      textAlign(CENTER,CENTER);
      textSize(30+button.value/20);
      textFont('Roboto Slab');
      text('Credits',0,2);
    },function(){
      return (game.page == 'menu');
    },function(button){
      game.playSound('button-click');
    },function(button){
      return (abs(mouseY-button.pos.y) < 25);
    }));
  }

  this.prepareGame = function()
  {
    this.createMap();
  }

	this.setup = function()
	{
    this.createSounds();
    this.createButtons();
    this.prepareGame();
	}

  this.createFlash = function(pos,vel,intensity)
  {
    for (var i = 0; i < intensity; i++)
    {
      var v = vel.copy().add(p5.Vector.random2D()).mult(random(2));
      var span = random(5,10);
      game.projectiles.push(new Particle(pos.copy(),v,function(p){
        var alpha = (p.data.span/p.data.maxSpan)*255;
        translate(p.pos.x,p.pos.y);
        fill(227, 134, 41,alpha);
        noStroke();
        ellipse(0,0,p.data.size,p.data.size);
        p.vel.mult(0.9);
        p.data.span--;
        if (p.data.span <= 0)
        {
          p.splice = true;
        }
      },{span:span,maxSpan:span,size:random(2,5)}));
    }
  }
}

function Block(x,y,w,h)
{
  this.pos = createVector(x,y);
  this.size = createVector(w,h);
  this.hitbox = this.size.copy();
  this.density = 64;
  this.color = color(165, 184, 179);

  this.run = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0,0,this.size.x,this.size.y);
    pop();
  }
}

function Terrain(x,y)
{
  this.pos = createVector(x,y);
  this.terrain = true;
  this.vertices = getTerrain(this.pos);

  this.run = function()
  {
    push();
    fill(47, 84, 32);
    noStroke();
    beginShape();
    for (var i = 0; i < this.vertices.length; i++)
    {
      vertex(this.vertices[i].x,this.vertices[i].y);
    }
    endShape(CLOSE);
    fill(0,50);
    noStroke();
    rectMode(CENTER);
    rect(-500,0,1000,height*2);
    pop();
  }
}

function Tile(x,y,w,h,c=color(220))
{
  this.pos = createVector(x,y);
  this.size = createVector(w,h);
  this.density = 64;
  this.color = c;

  this.run = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0,0,this.size.x,this.size.y);
    pop();
  }
}

function ForestBackground()
{
  var resolution = 20;
  this.vertices = [];
  this.vertices.push(createVector(-resolution,height));
  for (var i = -resolution; i <= 15000+resolution; i+=resolution)
  {
    this.vertices.push(createVector(i,height/2+map(noise(i/300),0,1,-100,100)));
  }
  this.vertices.push(createVector(this.vertices[this.vertices.length-1].x,height*2));
  this.trees = [];
  var index = -resolution;
  var i = 1;
  while (index < 15000+resolution)
  {
    this.trees.push(new Tree(index,this.vertices[i].y+10,random(200,250)));
    var val = round(random(3,12));
    i+=val;
    index+=resolution*val;
  }

  this.run = function()
  {
    push();
    translate(-game.player.pos.x/5,-game.player.pos.y/10);
    fill(18, 28, 9);
    noStroke();
    for (var j = 0; j < this.trees.length; j++)
    {
      if (this.trees[j].pos.x < game.player.pos.x/5-100 || this.trees[j].pos.x > game.player.pos.x/5+width+100)continue;
      this.trees[j].run();
    }
    beginShape();
    for (var i = 0; i < this.vertices.length; i++)
    {
      vertex(this.vertices[i].x,this.vertices[i].y);
    }
    endShape(CLOSE);
    pop();
  }

  this.valid = function()
  {
    return true;
  }
}

function Tree(x,y,h)
{
  this.pos = createVector(x,y);
  this.h = h;
  this.size = this.h/10;
  this.shade = (noise(this.pos.x,1000)-0.5)*10;
  this.swayVal = random(100000);

  this.run = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    rotate((noise(this.swayVal)-0.5)*2*PI/64);
    translate(-this.pos.x,-this.pos.y);
    fill(38+this.shade, 28+this.shade, 13+this.shade);
    noStroke();
    quad(this.pos.x-this.size/2,this.pos.y,this.pos.x-this.size/4,this.pos.y-this.h,this.pos.x+this.size/4,this.pos.y-this.h,this.pos.x+this.size/2,this.pos.y);
    fill(10+this.shade, 18+this.shade, 10+this.shade);
    triangle(this.pos.x-this.size/1.5,this.pos.y-this.h,this.pos.x,this.pos.y-this.h-this.size,this.pos.x+this.size/1.5,this.pos.y-this.h);
    var size = this.size;
    for (var i = this.pos.y-this.h+this.size/2+5; i < this.pos.y-this.h/5; i+=size*0.6)
    {
      fill(lerpColor(color(10+this.shade, 18+this.shade, 10+this.shade),color(18+this.shade, 38+this.shade, 16+this.shade),map(i,this.pos.y-this.h+this.size/2+5,this.pos.y-100,0,1)));
      quad(this.pos.x-size/2,i-size/2,this.pos.x+size/2,i-size/2,this.pos.x+size,i,this.pos.x-size,i);
      size*=1.2;
    }
    pop();
    this.swayVal+=0.001;
  }
}

function Player()
{
  this.pos = createVector();
  this.vel = createVector();
  this.hitbox = createVector(12,40);
  this.focus = null;
  this.speed = createVector(0.5,-4);
  this.onBlock = false;
  this.touching = false;
  this.jumpCooldown = 0;
  this.offset = createVector(0,-this.hitbox.y/8);
  this.gun = new Gun(this,'Glock 19');
  this.aiming = createVector();
  this.legVal = 0;
  this.legSpeed = 0.025;
  this.moved = 0;
  this.armVal = 0;

  this.render = function()
  {
    this.armVal = lerp(this.armVal,constrain(this.vel.y,0,4),0.15);
    push();
    translate(this.pos.x,this.pos.y);
    noFill();
    stroke(0);
    strokeWeight(1);
    rectMode(CENTER);
    //rect(0,0,this.hitbox.x,this.hitbox.y);
    if (!this.gun)
    {
      if (this.aiming.x < 0)
      {
        push();
        scale(0.8);
        this.hand(9+this.legVal*3+constrain(this.armVal,-3,3)*2,4-constrain(this.armVal,-4,4));
        pop();
      } else
      {
        push();
        scale(0.8);
        this.hand(-9-this.legVal*3-constrain(this.armVal,-3,3)*2,4-constrain(this.armVal,-4,4));
        pop();
      }
    }
    fill(230, 165, 25);
    rect(0,1,12,16,3);
    this.renderLegs();
    fill(171, 140, 101);
    ellipse(0,-14,10,13);
    fill(0);
    noStroke();
    var eyePos = this.aiming.copy().setMag(-1);
    ellipse(-2+eyePos.x,-14+eyePos.y,3,3);
    ellipse(2+eyePos.x,-14+eyePos.y,3,3);
    fill(230, 165, 25);
    rect(0,1,11,16,3);
    if (this.gun)
    {
      translate(this.offset.x,this.offset.y);
      scale(0.8);
      rotate(this.aiming.heading());
      this.gun.render();
    } else
    {
      if (this.aiming.x < 0)
      {
        push();
        scale(0.8);
        this.hand(-9-this.legVal*3-constrain(this.armVal,-3,3)*2,4-constrain(this.armVal,-4,4));
        pop();
      } else
      {
        push();
        scale(0.8);
        this.hand(9+this.legVal*3+constrain(this.armVal,-3,3)*2,4-constrain(this.armVal,-4,4));
        pop();
      }
    }
    pop();
  }

  this.leftLeg = function()
  {
    push();
    translate(-3,6);
    rotate(-this.legVal*PI/15);
    rect(0,7,6,14,3.5);
    pop();
  }

  this.rightLeg = function()
  {
    push();
    translate(3,6);
    rotate(this.legVal*PI/15);
    rect(0,7,6,14,3.5);
    pop();
  }

  this.hand = function(x,y)
  {
    push();
    fill(51);
    stroke(0);
    strokeWeight(1);
    ellipse(x,y,7,7);
    pop();
  }

  this.renderLegs = function()
  {
    if (this.aiming.x < 0)
    {
      this.rightLeg();
      this.leftLeg();
    } else
    {
      this.leftLeg();
      this.rightLeg();
    }
  }

  this.update = function()
  {
    this.applyForces();
    this.checkBlocks();
    this.movementPhysics();
    this.focus.update();
    this.updateGun();
  }

  this.updateGun = function()
  {
    if (this.gun)
    {
      this.aiming = this.gun.getAim();
      this.gun.update();
      if (mouseIsPressed && mouseButton == LEFT && this.gun.action == 'auto')
      {
        this.gun.shoot();
      }
    } else
    {
      this.aiming = createVector(mouseX-width/2,mouseY-height/2).mult(-1);
    }
  }

  this.movementPhysics = function()
  {
    if (this.onBlock)
    {
      this.vel.y = 0;
      this.vel.x*=0.9;
    } else
    {
      this.vel.x*=0.99;
    }
    this.controls();
  }

  this.applyForces = function()
  {
    this.vel.add(game.gravity.copy());
    this.pos.add(this.vel.copy());
  }

  this.checkBlocks = function()
  {
    if (this.pos.x < this.hitbox.x/2)
    {
      this.pos.x = this.hitbox.x/2;
      this.vel.x = 0;
    }
    this.touching = null;
    this.onBlock = false;
    for (var i = 0; i < game.blocks.length; i++)
    {
      if (game.blocks[i].terrain)
      {
        var results = this.checkTerrain(game.blocks[i]);
        if (results)
        {
          this.onBlock = true;
        }
      } else
      {
        if (this.hittingBlock(game.blocks[i]))
        {
          var results = this.reactToBlock(game.blocks[i]);
          this.onBlock = (results)?true:this.onBlock;
        }
      }
    }
  }

  this.checkTerrain = function(terrain)
  {
    if (this.pos.x+this.hitbox.x/2 < terrain.vertices[0].x || this.pos.x-this.hitbox.x/2 > terrain.vertices[terrain.vertices.length-3].x)
    {
      return false;
    }
    var prevVertex = terrain.vertices[0];
    for (var i = 1; i < terrain.vertices.length-2; i++)
    {
      var y = map(this.pos.x,prevVertex.x,terrain.vertices[i].x,prevVertex.y,terrain.vertices[i].y)-this.hitbox.y/2;
      if (this.pos.x > prevVertex.x && this.pos.x <= terrain.vertices[i].x)
      {
        if (this.pos.y > y)
        {
          this.pos.y = y;
          return true;
        }
        return false;
      }
      prevVertex = terrain.vertices[i];
    }
  }

  this.HUD = function()
  {
    if (this.gun)
    {
      this.gun.HUD();
    }
  }

  this.controls = function()
  {
    var prevMoved = this.moved;
    this.moved = 0;
    var multiplier = (this.onBlock)?1:0.15;
    var jumping = false;

    if (keyIsDown(game.keybinds.left))
    {
      this.vel.add(createVector(-this.speed.x*multiplier,0));
      this.moved = -1;
    }
    if (keyIsDown(game.keybinds.right))
    {
      this.vel.add(createVector(this.speed.x*multiplier,0));
      this.moved = 1;
    }
    if (keyIsDown(game.keybinds.jump) && this.jumpCooldown <= 0)
    {
      if (this.onBlock)
      {
        this.vel.add(createVector(0,this.speed.y));
        this.jumpCooldown = 20;
      } else if (this.touching != null && abs(this.vel.x) > 1)
      {
        this.vel.add(createVector(this.touching*this.speed.x*0.4,this.speed.y*0.96));
        this.jumpCooldown = 20;
      }
    }
    this.jumpCooldown--;
    this.moveLegs(prevMoved);
  }

  this.moveLegs = function(prevMoved)
  {
    if (this.moved != 0 && prevMoved == 0)
    {
      this.legSpeed = abs(this.legSpeed)*this.moved;
    }
    if (this.onBlock)
    {
      if (this.moved != 0 && !this.touching)
      {
        this.legVal+=this.legSpeed*abs(this.vel.x);
        if (abs(this.legVal) > 1)
        {
          this.legSpeed*=-1;
          this.legVal = constrain(this.legVal,-1,1);
        }
      } else
      {
        this.legVal = lerp(this.legVal,0,0.15);
      }
    } else
    {
      this.legVal = lerp(this.legVal,-1,0.15);
    }
  }

  this.hittingBlock = function(block)
  {
    return (abs(this.pos.x-block.pos.x) < this.hitbox.x/2+block.size.x/2 && abs(this.pos.y-block.pos.y) < this.hitbox.y/2+block.size.y/2);
  }

  this.reactToBlock = function(block)
  {
    var subbedX = abs(this.pos.x-block.pos.x);
    var subbedY = abs(this.pos.y-block.pos.y);
    var axis = (subbedX-block.size.x/2 > subbedY-block.size.y/2)?'x':'y';
    this.pos[axis] = block.pos[axis]+Math.sign(this.pos[axis]-block.pos[axis])*(this.hitbox[axis]/2+block.size[axis]/2);

    if (axis == 'x' && this.pos.y+this.hitbox.y/2 < block.pos.y+block.size.y/2)
    {
      this.touching = Math.sign(this.pos.x-block.pos.x);
    }
    if (axis == 'y' && this.pos.y-block.pos.y < 0)
    {
      return true;
    } else if (!(axis == 'y' && this.vel.y > 0))
    {
      this.vel[axis]*=-0.5;
    }
  }

  this.mousePressed = function()
  {
    if (mouseButton == LEFT && this.gun)
    {
      this.gun.shoot();
    }
  }

  this.keyPressed = function()
  {
    if (keyCode == game.keybinds.changeAction && this.gun)
    {
      this.gun.changeAction();
    } else if (keyCode == game.keybinds.reload && this.gun)
    {
      this.gun.reload();
    }
  }

  this.setup = function()
  {
    this.focus = new Focus(this);
  }
}

function Turret(pos,up)
{
  this.pos = pos.copy();
  this.up = up.copy();
  this.h = 30;
  this.shootPos = this.pos.copy().add(this.up.copy().setMag(this.h));
  this.aiming = createVector(-1,0);
  this.spinVal = 0;
  this.spinSpeed = 0;
  this.range = 400;
  this.spinners = 3;

  this.render = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.up.heading()+PI/2);
    fill(75);
    noStroke();
    quad(-12,-10,-10,-15,10,-15,12,-10);
    fill(100);
    rectMode(CENTER);
    rect(0,-5,30,10);
    fill(50);
    rect(0,-15-(this.h-15)/2,10,this.h-15);
    pop();
    push();
    translate(this.shootPos.x,this.shootPos.y);
    rotate(this.aiming.heading());
    fill(100);
    noStroke();
    rectMode(CENTER);
    rect(0,0,20,16,3);
    fill(50);
    rect(16,0,12,8);
    fill(75);
    for (var i = 0; i < this.spinners; i++)
    {
      var spinVal = ((map(this.spinVal,0,100,0,12)+i*5+12)%12)-6;
      var y = constrain(spinVal,-6,6);
      rect(17,y,14,(abs(y) > 4.5)?(6-abs(y)):3);
    }
    pop();
  }

  this.update = function()
  {
    var d = p5.Vector.dist(this.shootPos,game.player.pos);
    if (d < this.range)
    {
      if (this.seePlayer())
      {
        this.aiming = game.player.pos.copy().sub(this.shootPos).normalize();
        var offset = constrain(map(d,0,50,0,PI/32),0,PI/16);
        var angle = (this.aiming.x < 0)?offset:(this.aiming.x > 0)?-offset:0;
        this.aiming.rotate(angle);
        this.attack();
      }
    } else
    {
      this.spinSpeed = constrain(this.spinSpeed-0.1,0,8);
    }
    this.spinVal+=this.spinSpeed;
  }

  this.attack = function()
  {
    this.spinSpeed = constrain(this.spinSpeed+0.1,0,8);
    if (this.spinVal >= 100)
    {
      this.spinVal = 0;
      if (this.spinSpeed == 8)
      {
        this.shoot();
      }
    }
  }

  this.shoot = function()
  {
    var gunObj = {
      power:100,
      ammo:{length:3},
      bulletSpeed:8,
    };
    var offset = random(-0.08,0.08);
    var bulletPos = this.shootPos.copy().add(this.aiming.copy().setMag(14));
    game.projectiles.push(new Bullet(gunObj,bulletPos.copy(),this.aiming.copy(),offset));
    game.createFlash(bulletPos.copy(),this.aiming.copy().normalize(),12);
  }

  this.seePlayer = function()
  {
    var playerTest = {pos:game.player.pos.copy(),radius:10};
    var dir = game.player.pos.copy().sub(this.shootPos).normalize();
    var objects = [...game.blocks];
    objects.push(playerTest);
    var raycast = RayCast(this.shootPos.copy(),dir,objects);
    return (raycast.object == playerTest);
  }
}

function Focus(parent)
{
  this.parent = parent;
  this.raw = this.parent.pos.copy();
  this.pos = createVector(width/2,height/2).sub(this.raw.copy());
  this.screenShiftVal = 0.1;

  this.update = function()
  {
    this.raw = this.parent.pos.copy();
    this.pos.x = lerp(this.pos.x,width/2-this.raw.x,this.screenShiftVal);
    this.pos.y = lerp(this.pos.y,height/2-this.raw.y,this.screenShiftVal);
  }
}

function Gun(parent,gunID)
{
  this.parent = parent;
  this.gunID = gunID;
  this.gunObj = {
    'Glock 19':{
      ammo:{
        id:'9mm',
        length:2,
      },
      accuracyConstraints:{
        min:0.3,
        max:0.4,
      },
      recoilConstraints:{
        min:8,
        max:14,
      },
      reloadData:{
        reloadTimer:2,
      },
      heatData:{
        heatTimer:10,
        maxHeat:5,
      },
      aimSpeed:0.225,
      flashIntensity:6,
      actions:['semi'],
      recoilReset:1,
      recoilForce:0.2,
      recoilAngle:PI/8,
      shootTimer:6,
      bulletSpeed:8,
      power:100,
      gunLength:13,
      capacity:15,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,15):0;
        var magazine = !(formatTime < 0.25 && gun.reloading.inProgress);
        push();
        if (gun.reloading.inProgress)
        {
          if (magazine)
          {
            gun.parent.hand(-7,(3+magY)*invert);
          }
        } else
        {
          gun.parent.hand(-7,3*invert);
        }
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-7+(gun.gunObj.shootTimer-gun.shootTimer),-1.75*invert,14,2.5);
        rect(-7,0,14,2);
        rect(-5,3*invert,5,8);
        rect(-9,3*invert,3,1.5);
        rect(-10.5,2*invert,1,2.5);
        if (magazine)
        {
          rect(-5,(3+magY)*invert,3,8);
        }
        gun.parent.hand(-4,4*invert);
        pop();
      },
    },
    'M1911':{
      ammo:{
        id:'.45 ACP',
        length:2.5,
      },
      accuracyConstraints:{
        min:0.3,
        max:0.45,
      },
      recoilConstraints:{
        min:5,
        max:13,
      },
      reloadData:{
        reloadTimer:2.5,
      },
      heatData:{
        heatTimer:10,
        maxHeat:5,
      },
      aimSpeed:0.225,
      flashIntensity:7,
      actions:['semi'],
      recoilReset:1,
      recoilForce:0.25,
      recoilAngle:PI/6,
      shootTimer:4,
      bulletSpeed:9,
      power:110,
      gunLength:17,
      capacity:8,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,15):0;
        var magazine = !(formatTime < 0.25 && gun.reloading.inProgress);
        push();
        if (gun.reloading.inProgress)
        {
          if (magazine)
          {
            gun.parent.hand(-7,(3+magY)*invert);
          }
        } else
        {
          gun.parent.hand(-7,3*invert);
        }
        fill(150);
        if (magazine)
        {
          rect(-5,(3+magY)*invert,3,8);
        }
        fill(100);
        noStroke();
        rectMode(CENTER);
        rect(-8.5+(gun.gunObj.shootTimer-gun.shootTimer)*2,-1.5*invert,17,2);
        rect(-8.5,0,17,2);
        rect(-5,3*invert,5,8);
        rect(-9,3*invert,3,1.5);
        rect(-10.5,2*invert,1,2.5);
        fill(112, 75, 38);
        rect(-5,3*invert,3.5,7);
        gun.parent.hand(-4,4*invert);
        pop();
      },
    },
    'DEagle':{
      ammo:{
        id:'.50 AE',
        length:3,
      },
      accuracyConstraints:{
        min:0.35,
        max:0.45,
      },
      recoilConstraints:{
        min:3,
        max:14,
      },
      reloadData:{
        reloadTimer:2.5,
      },
      heatData:{
        heatTimer:12,
        maxHeat:4,
      },
      aimSpeed:0.175,
      flashIntensity:12,
      actions:['semi'],
      recoilReset:1,
      recoilForce:0.3,
      recoilAngle:PI/4,
      shootTimer:6,
      bulletSpeed:13,
      power:150,
      gunLength:20.5,
      capacity:7,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,15):0;
        var magazine = !(formatTime < 0.25 && gun.reloading.inProgress);
        push();
        if (gun.reloading.inProgress)
        {
          if (magazine)
          {
            gun.parent.hand(-7,(3+magY)*invert);
          }
        } else
        {
          gun.parent.hand(-7,3*invert);
        }
        fill(100);
        if (!(formatTime < 0.25 && gun.reloading.inProgress))
        {
          rect(-5,(3+magY)*invert,3,8);
        }
        fill(187, 166, 32);
        noStroke();
        rectMode(CENTER);
        rect(-13.5,-2*invert,14,3);
        rect(-3.5+(gun.gunObj.shootTimer-gun.shootTimer)*1.25,-2*invert,6,3);
        rect(-10.5+(gun.gunObj.shootTimer-gun.shootTimer)*1.25,-0.5*invert,8,1)
        rect(-10.5,0,20,2);
        fill(147, 126, 0);
        rect(-5,4*invert,5.5,7);
        rect(-9,3*invert,3,1.5);
        rect(-10.5,2*invert,1,2.5);
        gun.parent.hand(-4,5*invert);
        pop();
      },
    },
    'S&W Model 69':{
      ammo:{
        id:'.44 Magnum',
        length:3,
      },
      accuracyConstraints:{
        min:0.2,
        max:0.3,
      },
      recoilConstraints:{
        min:9,
        max:15,
      },
      reloadData:{
        reloadTimer:3,
      },
      heatData:{
        heatTimer:30,
        maxHeat:3,
      },
      aimSpeed:0.225,
      flashIntensity:6,
      actions:['semi'],
      recoilReset:1,
      recoilForce:0.2,
      recoilAngle:PI/6,
      shootTimer:25,
      bulletSpeed:11,
      power:120,
      gunLength:16.5,
      capacity:5,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        noFill();
        if (gun.reloading.inProgress)
        {
          gun.parent.hand(-5-formatTime*4,1*invert);
        }
        gun.parent.hand(-3,6*invert);
        stroke(100);
        strokeWeight(1);
        line(-4,4*invert,-10,4*invert);
        line(-10,4*invert,-10,0);
        noStroke();
        fill(150);
        quad(-5,-1*invert,-13,-1*invert,-13,3*invert,-2,3*invert);
        rect(-14.5,0,4,2);
        fill(100);
        rect(-8,1*invert,4,3);
        fill(0);
        quad(-2,2.5*invert,-7,2.5*invert,-4,7*invert,0,6*invert);
        gun.parent.hand(-4,7*invert);
        pop();
      },
    },
    'Uzi':{
      ammo:{
        id:'9mm',
        length:2,
      },
      accuracyConstraints:{
        min:0.25,
        max:0.75,
      },
      recoilConstraints:{
        min:11,
        max:18,
      },
      reloadData:{
        reloadTimer:2,
      },
      heatData:{
        heatTimer:6,
        maxHeat:12,
      },
      aimSpeed:0.2,
      flashIntensity:9,
      actions:['auto'],
      recoilReset:1,
      recoilForce:0.15,
      recoilAngle:PI/6,
      shootTimer:5,
      bulletSpeed:7,
      power:100,
      gunLength:21.5,
      capacity:20,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,15):0;
        var magazine = !(formatTime < 0.25 && gun.reloading.inProgress);
        push();
        if (gun.reloading.inProgress)
        {
          if (magazine)
          {
            gun.parent.hand(-7,(10+magY)*invert);
          }
        } else
        {
          gun.parent.hand(-7,3*invert);
        }
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-8,-1*invert,19,5);
        rect(-19,0,5,2);
        rect(-5,4*invert,5,8);
        rect(-9,4*invert,3,1.5);
        rect(-10.5,3*invert,1,2.5);
        quad(-1,-3.5*invert,-1,1.5*invert,2,4*invert,2,-3.5*invert);
        rect(2,-0.5*invert,2,7.5);
        if (!(formatTime < 0.25 && gun.reloading.inProgress))
        {
          rect(-5,(6.5+magY)*invert,3,13);
          rect(-5.5,(12.5+magY)*invert,4,1);
        }
        gun.parent.hand(-5,6*invert);
        pop();
      },
    },
    'AR-15':{
      ammo:{
        id:'5.56x45mm',
        length:3,
      },
      accuracyConstraints:{
        min:0.2,
        max:0.4,
      },
      recoilConstraints:{
        min:1,
        max:8,
      },
      reloadData:{
        reloadTimer:3,
      },
      heatData:{
        heatTimer:11,
        maxHeat:8,
      },
      aimSpeed:0.15,
      flashIntensity:12,
      actions:['semi','auto'],
      recoilReset:1,
      recoilForce:0.25,
      recoilAngle:PI/16,
      shootTimer:5,
      bulletSpeed:12,
      power:120,
      gunLength:35.5,
      capacity:20,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,30):0;
        var magazine = !(formatTime < 0.65 && gun.reloading.inProgress);
        push();
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-22,2*invert);
        }
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-14,0,14,6);
        rect(-4,-0.5*invert,8,3);
        quad(0,0,-5,1*invert,-3,5.5*invert,0,5.5*invert);
        quad(-9,1*invert,-13,2*invert,-10,9*invert,-6,9*invert);
        rect(-13,5*invert,4,1);
        rect(-15,4*invert,1,3);
        rect(-22,0,3,3);
        rect(-27.5,0,9,4);
        rect(-33.5,0,4,2);
        rect(-17,4.5*invert,4,4);
        rect(-11,-3*invert,2,4);
        rect(-18,-3*invert,2,4);
        rect(-14.5,-4.5*invert,7,1.5);
        stroke(0);
        strokeWeight(1);
        line(-30,-2*invert,-30,-4*invert);
        line(-27,-2*invert,-30,-4*invert);
        gun.parent.hand(-9.5,6*invert);
        noStroke();
        translate(-17,6*invert);
        rotate((PI/16)*invert);
        if (magazine)
        {
          if (gun.reloading.inProgress)
          {
            gun.parent.hand(2,(3+magY)*invert);
          }
          rect(0,magY*invert,3,8);
        }
        pop();
      },
    },
    'AK-47':{
      ammo:{
        id:'7.62x39mm',
        length:4,
      },
      accuracyConstraints:{
        min:0.2,
        max:0.35,
      },
      recoilConstraints:{
        min:0,
        max:7,
      },
      reloadData:{
        reloadTimer:3.5,
      },
      heatData:{
        heatTimer:13,
        maxHeat:12,
      },
      aimSpeed:0.1,
      flashIntensity:16,
      actions:['semi','auto'],
      recoilReset:1,
      recoilForce:0.35,
      recoilAngle:PI/12,
      shootTimer:7,
      bulletSpeed:10,
      power:160,
      gunLength:35.5,
      capacity:30,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,8):0;
        var magazine = !(formatTime < 0.65 && gun.reloading.inProgress);
        push();
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-27,3*invert);
        }
        noStroke();
        rectMode(CENTER);
        fill(146, 110, 37);
        quad(-10,1*invert,-14,1*invert,-11,8*invert,-7,8*invert);
        quad(-9,-1*invert,-9,2*invert,0,5*invert,0,-1*invert);
        fill(0);
        rect(-16,0,14,4);
        rect(-14,5*invert,4,1);
        rect(-16,3.5*invert,1,4);
        rect(-26,0,8,4);
        rect(-32.5,0,5,2);
        rect(-34.5,2*invert,9,2);
        fill(176, 140, 67);
        rect(-27,2*invert,8,3);
        rect(-28,-1.5*invert,6,2.5);
        gun.parent.hand(-10,7*invert);
        noFill();
        stroke(0);
        strokeWeight(3.5);
        strokeCap(SQUARE);
        if (magazine)
        {
          translate(-25,(1.5+magY)*invert);
          if (gun.reloading.inProgress)
          {
            rotate(map(constrain(abs(formatTime),0,1),0,1,1,0)*PI/8*invert);
            gun.parent.hand(5,5*invert);
          }
          if (invert == -1)
          {
            arc(0,0,12,14,PI+PI*0.6,PI*2);
          } else
          {
            arc(0,0,12,14,-PI*2,-PI*0.6-PI);
          }
        }
        pop();
      },
    },
    'MP5':{
      ammo:{
        id:'9mm',
        length:2,
      },
      accuracyConstraints:{
        min:0.25,
        max:0.35,
      },
      recoilConstraints:{
        min:3,
        max:10,
      },
      reloadData:{
        reloadTimer:2,
      },
      heatData:{
        heatTimer:9,
        maxHeat:6,
      },
      aimSpeed:0.175,
      flashIntensity:9,
      actions:['semi','auto'],
      recoilReset:1,
      recoilForce:0.225,
      recoilAngle:PI/12,
      shootTimer:4,
      bulletSpeed:9,
      power:100,
      gunLength:33.5,
      capacity:25,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,30):0;
        var magazine = !(formatTime < 0.65 && gun.reloading.inProgress);
        push();
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-24,3*invert);
        }
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-14,0,14,6);
        rect(-4,-0.5*invert,8,3);
        quad(0,0,-5,1*invert,-3,5.5*invert,0,5.5*invert);
        quad(-9,1*invert,-13,2*invert,-10,9*invert,-6,9*invert);
        rect(-13,5*invert,4,1);
        rect(-15,4*invert,1,3);
        rect(-22,0,3,3);
        rect(-26.5,0,7,4);
        quad(-17,1.5*invert,-30,1.5*invert,-30,2*invert,-17,3*invert);
        rect(-31.5,0,4,2);
        rect(-17,4.5*invert,4,4);
        stroke(0);
        strokeWeight(1);
        line(-28,-2*invert,-28,-3*invert);
        line(-11,-2*invert,-11,-3.5*invert);
        noStroke();
        gun.parent.hand(-9.5,6*invert);
        translate(-17,7*invert);
        rotate((PI/16)*invert);
        if (magazine)
        {
          if (gun.reloading.inProgress)
          {
            gun.parent.hand(-2,(2+magY)*invert);
          }
          rect(0,magY*invert,2.5,10);
        }
        pop();
      },
    },
    'AN-94':{
      ammo:{
        id:'7.62x39mm',
        length:4,
      },
      accuracyConstraints:{
        min:0.2,
        max:0.3,
      },
      recoilConstraints:{
        min:2,
        max:9,
      },
      reloadData:{
        reloadTimer:3.5,
      },
      heatData:{
        heatTimer:18,
        maxHeat:12,
      },
      burstData:{
        burstTimer:3,
        bursts:2,
      },
      aimSpeed:0.075,
      flashIntensity:16,
      actions:['semi','burst'],
      recoilReset:1,
      recoilForce:0.25,
      recoilAngle:PI/10,
      shootTimer:10,
      bulletSpeed:12,
      power:160,
      gunLength:35.5,
      capacity:30,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var magY = (gun.reloading.inProgress)?map(formatTime,1,0,0,8):0;
        var magazine = !(formatTime < 0.65 && gun.reloading.inProgress);
        push();
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-27,3*invert);
        }
        noStroke();
        rectMode(CENTER);
        fill(51);
        quad(-9,-0.75*invert,-9,2*invert,0,5*invert,0,-0.75*invert);
        fill(0);
        quad(-10,1*invert,-14,1*invert,-11,8*invert,-7,8*invert);
        rect(-16,0,14,4);
        rect(-14,5*invert,4,1);
        rect(-16,3.5*invert,1,4);
        rect(-26,0,8,4);
        rect(-32.5,2*invert,5,2);
        rect(-34.5,0,9,2);
        fill(51);
        rect(-27,2*invert,8,4);
        gun.parent.hand(-10,7*invert);
        noFill();
        stroke(35);
        strokeWeight(3.5);
        strokeCap(SQUARE);
        if (magazine)
        {
          translate(-25,(1.5+magY)*invert);
          if (gun.reloading.inProgress)
          {
            rotate(map(constrain(abs(formatTime),0,1),0,1,1,0)*PI/8*invert);
          }
          if (invert == -1)
          {
            arc(0,0,12,24,PI+PI*0.6,PI*2);
          } else
          {
            arc(0,0,12,24,-PI*2,-PI*0.6-PI);
          }
          if (gun.reloading.inProgress)
          {
            gun.parent.hand(5,7*invert);
          }
        }
        pop();
      },
    },
    'Remington 870':{
      shotgun:true,
      ammo:{
        id:'12 Gauge',
        length:2,
      },
      accuracyConstraints:{
        min:0.3,
        max:0.4,
      },
      recoilConstraints:{
        min:4,
        max:16,
      },
      reloadData:{
        reloadTimer:0.5,
      },
      heatData:{
        heatTimer:32,
        maxHeat:2,
      },
      burstData:{
        burstTimer:0,
        bursts:6,
      },
      aimSpeed:0.125,
      flashIntensity:3,
      actions:['pump'],
      recoilReset:1,
      recoilForce:0.3,
      recoilAngle:PI/4,
      shootTimer:18,
      bulletSpeed:8,
      power:70,
      gunLength:35,
      capacity:5,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var bulletYTimer = map(abs(timer/gun.gunObj.reloadData.reloadTimer),0,1,0,gun.gunObj.capacity);
        var bulletY = (gun.reloading.inProgress)?map(timer/gun.gunObj.reloadData.reloadTimer,0,1,0,10):0;
        var shootTimer = gun.shootTimer/gun.gunObj.shootTimer;
        var pumpX = (gun.reloading.inProgress)?0:(shootTimer > 0.5)?map(abs(shootTimer-0.75)*4,0,1,10,0):0;
        push();
        if (gun.reloading.inProgress)
        {
          gun.parent.hand(-8,(5+bulletY)*invert);
        }
        fill(148, 30, 30);
        rect(-8,(1.25+bulletY)*invert,5,2);
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-6,1.25*invert,10,4.5);
        rect(-23,0,24,2);
        rect(-20.5,2.5*invert,19,2);
        rect(-28,1.25*invert,2,2);
        rect(-22+pumpX,2.25*invert,10,3);
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-20+pumpX,4*invert);
        }
        quad(-2,-1*invert,-2,3.5*invert,4,5*invert,4,1*invert);
        quad(3.5,1*invert,3.5,5*invert,13,8*invert,13,1.5*invert);
        gun.parent.hand(-2,4*invert);
        pop();
      },
    },
    'Mossberg 500':{
      shotgun:true,
      ammo:{
        id:'12 Gauge',
        length:2,
      },
      accuracyConstraints:{
        min:0.35,
        max:0.45,
      },
      recoilConstraints:{
        min:4,
        max:16,
      },
      reloadData:{
        reloadTimer:0.5,
      },
      heatData:{
        heatTimer:32,
        maxHeat:2,
      },
      burstData:{
        burstTimer:0,
        bursts:5,
      },
      aimSpeed:0.175,
      flashIntensity:2,
      actions:['pump'],
      recoilReset:1,
      recoilForce:0.4,
      recoilAngle:PI/6,
      shootTimer:12,
      bulletSpeed:6,
      power:70,
      gunLength:29,
      capacity:5,
      render:function(gun)
      {
        var invert = (gun.parent.aiming.x > 0)?1:-1;
        var timer = gun.reloading.timer;
        var formatTime = abs((timer/gun.gunObj.reloadData.reloadTimer)-0.5)*2;
        var bulletYTimer = map(abs(timer/gun.gunObj.reloadData.reloadTimer),0,1,0,gun.gunObj.capacity);
        var bulletY = (gun.reloading.inProgress)?map(timer/gun.gunObj.reloadData.reloadTimer,0,1,0,10):0;
        var shootTimer = gun.shootTimer/gun.gunObj.shootTimer;
        var pumpX = (gun.reloading.inProgress)?0:(shootTimer > 0.5)?map(abs(shootTimer-0.5)*2,0,1,6,0):0;
        push();
        if (gun.reloading.inProgress)
        {
          gun.parent.hand(-8,(5+bulletY)*invert);
        }
        fill(148, 30, 30);
        rect(-8,(1.25+bulletY)*invert,5,2);
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(-6,1.25*invert,10,4.5);
        rect(-20,0,18,2);
        rect(-17.5,2.5*invert,13,2);
        rect(-17,1.25*invert,2,2);
        rect(-18+pumpX,2.25*invert,10,3);
        if (!gun.reloading.inProgress)
        {
          gun.parent.hand(-20+pumpX,4*invert);
        }
        quad(-2,-1*invert,-2,3.5*invert,4,5*invert,4,1*invert);
        quad(3.5,1*invert,3.5,5*invert,13,8*invert,13,1.5*invert);
        gun.parent.hand(-2,4*invert);
        pop();
      },
    },
  }[this.gunID];
  this.recoilValue = this.gunObj.recoilConstraints.max;
  this.shootTimer = this.gunObj.shootTimer;
  this.actions = [];
  for (var i = 0; i < this.gunObj.actions.length; i++)
  {
    this.actions.push({size:15,type:this.gunObj.actions[i]});
  }
  this.action = this.gunObj.actions[0];
  this.bursts = 0;
  this.burstTimer = 0;
  this.reloading = {
    inProgress:false,
    timer:0,
  };
  this.heat = 0;
  this.heatTimer = 0;
  this.exactAiming = createVector();
  this.magazine = 0;
  this.ammo = this.gunObj.capacity*5;
  this.offset = this.parent.offset.copy();

  this.render = function()
  {
    push();
    translate(-this.recoilValue,0);
    var invert = (this.parent.aiming.x > 0)?1:-1;
    rotate(map(this.shootTimer,this.gunObj.shootTimer,0,0,this.gunObj.recoilAngle)*invert*((this.heat+1)/this.gunObj.heatData.maxHeat));
    this.gunObj.render(this);
    pop();
  }

  this.HUD = function()
  {
    push();
    fill(51);
    if (this.ammo == 0 && this.magazine == 0)
    {
      fill(lerpColor(color(219, 48, 48),color(51),(1+sin(frameCount/10))/2));
    }
    textFont('Righteous');
    textAlign(RIGHT,BOTTOM);
    var x = width-10;
    for (var i = 0; i < this.actions.length; i++)
    {
      this.actions[i].size = lerp(this.actions[i].size,(this.actions[i].type == this.action)?20:15,0.15);
      push();
      fill(lerp(51,0,(this.actions[i].size-15)/5));
      textSize(this.actions[i].size);
      textAlign(RIGHT,CENTER);
      text(this.actions[i].type.toUpperCase(),x,height-70-this.actions[i].size/5);
      x-=textWidth(this.actions[i].type)+10;
      pop();
    }
    textSize(50);
    var txt = '/'+this.ammo;
    text(txt,width-10,height-5);
    var s = textWidth(txt);
    textSize(60);
    fill(0);
    if (this.ammo == 0 && this.magazine == 0)
    {
      fill(lerpColor(color(219, 48, 48),color(0),(1+sin(frameCount/10))/2));
    }
    text(this.magazine,width-15-s,height-3);
    if (this.ammo > 0 && this.magazine == 0 && !this.reloading.inProgress)
    {
      fill(0,lerp(255,0,(1+sin(frameCount/10))/2));
      noStroke();
      textSize(16);
      text('Press '+String.fromCharCode(game.keybinds.reload)+' to reload',width-10,height-90);
    }
    pop();
    if (this.reloading.inProgress && this.reloading.timer > 0)
    {
      push();
      noFill();
      stroke(0);
      strokeWeight(4);
      arc(width/2,height/2-100,40,40,0,constrain(map(this.reloading.timer,0,this.gunObj.reloadData.reloadTimer,PI*2,0),0,PI*2));
      fill(0);
      noStroke();
      textAlign(CENTER,CENTER);
      textFont('Righteous');
      textSize(20);
      text(nf(constrain(this.reloading.timer,0,this.gunObj.reloadData.reloadTimer),1,1),width/2,height/2-100);
      pop();
    }
  }

  this.update = function()
  {
    this.exactAiming = createVector(mouseX-width/2,mouseY-height/2);
    this.heatTimer--;
    if (this.heatTimer <= 0)
    {
      this.heat = constrain(this.heat-0.5,0,this.gunObj.heatData.maxHeat);
    }
    this.recoilValue = constrain(this.recoilValue+this.gunObj.recoilReset,this.gunObj.recoilConstraints.min,this.gunObj.recoilConstraints.max);
    if (this.shootTimer < this.gunObj.shootTimer)
    {
      this.shootTimer++;
    } else
    {
      this.shootTimer = this.gunObj.shootTimer;
    }
    this.updateBursts();
    this.updateReloads();
  }

  this.updateReloads = function()
  {
    if (this.reloading.inProgress)
    {
      this.reloading.timer-=1/60;
      if (this.reloading.timer <= 0)
      {
        this.reloading.inProgress = false;
        this.reloading.timer = 0;
        var capacity = (this.gunObj.shotgun)?1:this.gunObj.capacity;
        this.reloadGun(capacity);
        if (this.gunObj.shotgun)
        {
          this.reload();
        }
      }
    }
  }

  this.getAim = function()
  {
    var heading = this.parent.aiming.copy().rotate(PI);
    var mouse = createVector(mouseX-width/2,mouseY-height/2).normalize();
    var relative = mouse.copy().sub(heading.normalize());
    var theta = this.gunObj.aimSpeed;
    var angle = heading.copy().mult(cos(theta)).add(relative.mult(sin(theta)));
    return angle.rotate(PI);
  }

  this.reloadGun = function(capacity)
  {
    var increase = constrain(constrain(constrain(this.gunObj.capacity-this.magazine,0,this.gunObj.capacity),0,this.ammo),0,capacity);
    this.magazine+=increase;
    this.ammo-=increase;
  }

  this.updateBursts = function()
  {
    if (this.bursts > 0)
    {
      if (this.gunObj.burstData.burstTimer == 0)
      {
        var bursts = this.bursts;
        var valid = 0;
        while (this.bursts > 0)
        {
          valid+=this.shootBullet();
          if (valid == 'invalid')
          {
            valid = 0;
            this.bursts = 0;
            break;
          }
          this.bursts--;
        }
        if (valid > 0)
        {
          if (this.gunObj.shotgun)
          {
            this.magazine--;
          } else
          {
            this.magazine-=valid;
          }
          this.shootTimer = 0;
        }
      } else
      {
        if (this.burstTimer < this.gunObj.burstData.burstTimer)
        {
          this.burstTimer++;
        } else
        {
          this.burstTimer = 0;
          var valid = this.shootBullet();
          this.bursts--;
          if (valid)
          {
            this.magazine--;
            if (this.bursts == 0)
            {
              this.shootTimer = 0;
            }
          }
        }
      }
    }
  }

  this.shootBurst = function()
  {
    if (this.shootTimer >= this.gunObj.shootTimer && this.magazine > 0 && !this.reloading.inProgress)
    {
      this.bursts = constrain(this.gunObj.burstData.bursts,0,(this.gunObj.shotgun)?this.magazine*this.gunObj.burstData.bursts:this.magazine);
      this.burstTimer = this.gunObj.burstData.burstTimer;
    }
  }

  this.shoot = function()
  {
    if (this.reloading.inProgress && this.gunObj.shotgun)
    {
      this.reloading.inProgress = false;
      return;
    }
    if (this.action == 'burst' || this.action == 'pump')
    {
      this.shootBurst();
    } else if (this.action == 'semi' || this.action == 'auto')
    {
      this.shootBullet(true);
    }
  }

  this.shootBullet = function(bool)
  {
    if (this.reloading.inProgress)
    {
      if (!bool)
      {
        this.reloading.inProgress = false;
      }
      return 'invalid';
    }
    if (this.shootTimer >= this.gunObj.shootTimer && this.magazine > 0)
    {
      var bulletPos = this.parent.pos.copy().add(this.offset.copy().add(this.parent.aiming.copy().rotate(PI).setMag(this.gunObj.gunLength+this.gunObj.recoilConstraints.min)));
      var accuracy = map(this.heat,0,this.gunObj.heatData.maxHeat,this.gunObj.accuracyConstraints.min,this.gunObj.accuracyConstraints.max);
      var offset = random(-accuracy/2,accuracy/2);
      if (!this.validBulletPos(bulletPos))
      {
        return;
      }
      if (this.action != 'burst' && this.action != 'pump')
      {
        this.shootTimer = 0;
        this.magazine--;
      }
      this.heat = constrain(this.heat+1,0,this.gunObj.heatData.maxHeat);
      this.heatTimer = this.gunObj.heatData.heatTimer;
      this.recoilValue = this.gunObj.recoilConstraints.min;
      game.projectiles.push(new Bullet(this.gunObj,bulletPos.copy(),this.parent.aiming.copy().rotate(PI),offset));
      this.parent.vel.add(this.parent.aiming.copy().setMag(this.gunObj.recoilForce));
      game.createFlash(bulletPos,this.parent.aiming.copy().rotate(PI).normalize(),this.gunObj.flashIntensity);
      return true;
    }
  }

  this.validBulletPos = function(bulletPos)
  {
    var bulletPosTest = {pos:bulletPos.copy(),radius:1};
    var dir = bulletPos.copy().sub(this.parent.pos.copy().add(this.parent.offset)).normalize();
    var objects = [...game.blocks];
    objects.push(bulletPosTest);
    var raycast = RayCast(this.parent.pos.copy().add(this.parent.offset),dir,objects);
    return (raycast.object == bulletPosTest);
  }

  this.changeAction = function()
  {
    this.action = this.gunObj.actions[(this.gunObj.actions.indexOf(this.action)+1)%(this.gunObj.actions.length)];
  }

  this.reload = function()
  {
    if (this.ammo > 0 && this.magazine < this.gunObj.capacity && !this.reloading.inProgress)
    {
      this.reloading.inProgress = true;
      this.reloading.timer = this.gunObj.reloadData.reloadTimer;
    }
  }
}

function Bullet(gun,pos,vel,offset)
{
  this.id = 'bullet';
  this.gun = gun;
  this.pos = pos.copy();
  this.length = this.gun.ammo.length;
  this.vel = vel.copy().setMag(this.gun.bulletSpeed).rotate(offset);
  this.span = this.gun.power;
  this.splice = false;
  this.inside = null;

  this.run = function()
  {
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading());
    stroke(0);
    strokeWeight(1);
    line(-this.length,0,this.length,0);
    pop();
    this.vel.add(game.gravity.copy().mult(0.5));
    this.pos.add(this.vel.copy());
    this.span-=1;
    if (this.span <= 0)
    {
      this.splice = true;
    }
    this.checkBlocks();
  }

  this.checkBlocks = function()
  {
    for (var i = 0; i < game.blocks.length; i++)
    {
      if (this.hittingBlock(game.blocks[i]))
      {
        if (game.blocks[i].terrain)
        {
          return;
        }
        if (this.inside != game.blocks[i])
        {
          this.inside = game.blocks[i];
          this.dustCloud(this.pos.copy(),game.blocks[i]);
        }
        this.span-=game.blocks[i].density;
      } else if (this.inside == game.blocks[i])
      {
        this.dustCloud(this.pos.copy(),game.blocks[i]);
        this.inside = null;
      }
    }
  }

  this.dustCloud = function(pos,block)
  {
    for (var i = 0; i < 10; i++)
    {
      var span = random(20,30);
      game.projectiles.push(new Particle(pos.copy(),p5.Vector.random2D().mult(random(2)),function(p){
        var alpha = (p.data.span/p.data.maxSpan)*255;
        translate(p.pos.x,p.pos.y);
        fill(red(p.data.color),green(p.data.color),blue(p.data.color),alpha);
        noStroke();
        ellipse(0,0,p.data.size,p.data.size);
        p.vel.mult(0.9);
        p.vel.add(game.gravity.copy().mult(0.2));
        p.data.span--;
        if (p.data.span <= 0)
        {
          p.splice = true;
        }
      },{span:span,maxSpan:span,size:random(5,9),color:block.color}));
    }
  }

  this.hittingBlock = function(block)
  {
    if (block.terrain)
    {
      var terrain = block;
      if (this.pos.x < terrain.vertices[0].x || this.pos.x > terrain.vertices[terrain.vertices.length-3].x)
      {
        return false;
      }
      var prevVertex = terrain.vertices[0];
      for (var i = 1; i < terrain.vertices.length-2; i++)
      {
        var y = map(this.pos.x,prevVertex.x,terrain.vertices[i].x,prevVertex.y,terrain.vertices[i].y);
        if (this.pos.x > prevVertex.x && this.pos.x <= terrain.vertices[i].x)
        {
          if (this.pos.y > y)
          {
            this.span = 0;
            this.dustCloud(this.pos.copy(),{color:color(110, 88, 43)});
            return true;
          }
          return false;
        }
        prevVertex = terrain.vertices[i];
      }
    } else
    {
      return (abs(this.pos.x-block.pos.x) < block.size.x/2 && abs(this.pos.y-block.pos.y) < block.size.y/2);
    }
  }
}

function Particle(pos,vel,disp,data)
{
  this.id = 'particle';
  this.pos = pos.copy();
  this.vel = vel.copy();
  this.disp = disp;
  this.data = data;
  this.splice = false;

  this.run = function()
  {
    push();
    this.disp(this);
    pop();
    this.pos.add(this.vel);
  }
}

function mousePressed()
{
  game.mousePressed();
}

function keyPressed()
{
  game.keyPressed();
}

function RayCast(p,d,o)
{
  var pos = p.copy();
  var dir = d.copy();
  var objects = o;
  var closest = Infinity;
  var closestData = null;
  for (var i = 0; i < objects.length; i++)
  {
    if (objects[i].radius != undefined)
    {
      var rayData = getRayData({pos,dir},objects[i]);
      if (rayData)
      {
        var d = p5.Vector.dist(pos,rayData);
        if (d < closest || closestData == null)
        {
          closest = d;
          closestData = {object:objects[i],rayData};
        }
      }
    } else
    {
      var edges = getEdges(objects[i]);
      for (var j = 0; j < edges.length; j++)
      {
        var rayData = getRayData({pos,dir},edges[j]);
        if (rayData)
        {
          var d = p5.Vector.dist(pos,rayData);
          if (d < closest || closestData == null)
          {
            closest = d;
            closestData = {object:objects[i],rayData};
          }
        }
      }
    }
  }
  return closestData;
}

function getEdges(obj)
{
  var edges = [];
  if (obj.terrain)
  {
    for (var i = 1; i <= obj.vertices.length; i++)
    {
      var indexA = i-1;
      var indexB = (i == obj.vertices.length)?0:i;
      var a = obj.vertices[indexA].copy();
      var b = obj.vertices[indexB].copy();
      edges.push({a,b});
    }
  } else
  {
    edges.push({a:createVector(obj.pos.x-obj.hitbox.x/2,obj.pos.y-obj.hitbox.y/2),b:createVector(obj.pos.x+obj.hitbox.x/2,obj.pos.y-obj.hitbox.y/2)});
    edges.push({a:createVector(obj.pos.x+obj.hitbox.x/2,obj.pos.y-obj.hitbox.y/2),b:createVector(obj.pos.x+obj.hitbox.x/2,obj.pos.y+obj.hitbox.y/2)});
    edges.push({a:createVector(obj.pos.x+obj.hitbox.x/2,obj.pos.y+obj.hitbox.y/2),b:createVector(obj.pos.x-obj.hitbox.x/2,obj.pos.y+obj.hitbox.y/2)});
    edges.push({a:createVector(obj.pos.x-obj.hitbox.x/2,obj.pos.y+obj.hitbox.y/2),b:createVector(obj.pos.x-obj.hitbox.x/2,obj.pos.y-obj.hitbox.y/2)});
  }
  return edges;
}

function getRayData(ray,edge)
{
  if (edge.a && edge.b)
  {
    var x1 = edge.a.x;
    var y1 = edge.a.y;
    var x2 = edge.b.x;
    var y2 = edge.b.y;
    var x3 = ray.pos.x;
    var y3 = ray.pos.y;
    var x4 = ray.pos.x+ray.dir.x;
    var y4 = ray.pos.y+ray.dir.y;
    var den = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    if (den == 0)
    {
      return;
    }
    var t = ((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/den;
    var u = -((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/den;

    if (t > 0 && t < 1 && u > 0)
    {
      var pt = createVector();
      pt.x = x1+t*(x2-x1);
      pt.y = y1+t*(y2-y1);
      return pt;
    } else
    {
      return;
    }
  } else if (edge.pos && edge.radius)
  {
    var otc = edge.pos.copy().sub(ray.pos);
    var otcSq = otc.mag()*otc.mag();
    var radiusSq = edge.radius*edge.radius;
    var a = otc.dot(ray.dir.copy().normalize());
    var b = otcSq-(a*a);
    if (radiusSq-b < 0)
    {
      return;
    }
    var f = sqrt(radiusSq-b);
    var t = 0;
    if (otcSq < radiusSq)
    {
      t = a+f;
    } else
    {
      t = a-f;
    }
    if (t < 0)
    {
      return;
    }
    return ray.pos.copy().add(ray.dir.copy().setMag(t));
  }
}

function Button(pos,disp,needs,exec,hovering,data={})
{
  this.pos = pos.copy();
  this.disp = disp;
  this.needs = needs;
  this.exec = exec;
  this.hovering = hovering;
  this.value = 0;
  this.data = data;
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
    this.value = lerp(this.value,this.hover()*100,0.15);
    if (this.hover())
    {
      if (!this.hovered)
      {
        game.playSound('button-hover',0.2);
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
      this.exec(this);
      return true;
    }
  }
}
