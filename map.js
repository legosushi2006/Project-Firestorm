function getMap()
{
	return {
		playerPos:createVector(100,0),
		checkPoints:{

		},
		backgrounds:[
			new ForestBackground(),
		],
		tiles:[
			new Tree(-600,20,450),
			new Tree(-680,10,350),
			new Tree(-300,30,400),
			new Tree(-380,30,350),
			new Tree(-440,20,380),
			new Tree(440,-30,450),
			new Tree(100,50,330),
			new Tree(-100,50,300),
			new Tree(20,40,350),
			new Tree(250,50,400),
			new Tree(350,30,400),
			new Tree(550,-40,280),
			new Tree(620,-80,380),
			new Tree(1220,-80,320),
			new Tree(1520,-140,320),
			// Details ^
		],
		enemies:[
			new Turret(createVector(900,-133),p5.Vector.fromAngle(-PI/2+PI/32)),
		],
		blocks:[
			new Terrain(0,40),
		],
	};
}

function getTerrain(add)
{
	var vertices = [
		createVector(-1000,-100),
		createVector(-350,-30),
		createVector(-250,0),
		//
		createVector(-50,0),
		createVector(80,-16),
		createVector(100,-22),
		createVector(120,-28),
		createVector(200,-40),
		createVector(230,-42),
		createVector(260,-39),
		createVector(300,-45),
		createVector(350,-65),
		createVector(600,-150),
		createVector(650,-190),
		createVector(680,-200),
		createVector(720,-190),
		createVector(1040,-160),
		createVector(1240,-150),
		createVector(1440,-180),
		createVector(1740,-280),
		createVector(10000,0),
		createVector(10000,height),
		createVector(-1000,height),
	];
	for (var i = 0; i < vertices.length; i++)
	{
		vertices[i].add(add);
	}
	return vertices;
}
