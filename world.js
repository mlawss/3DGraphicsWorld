// Function to retrieve a random number within a minimum and maximum range
function getRand(min, max){
    return Math.random() * (max - min) + min;
}

// Set up scene
var scene = new THREE.Scene();

// Set up camera
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 ); 
camera.position.x = 0;
camera.position.y = 50;
camera.position.z = 200;

// Set up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // Size of the 2D projection
document.body.appendChild(renderer.domElement); // Connecting to the canvas

// Creating outlines/cel shading effect
var celEffect = new THREE.OutlineEffect(renderer);
function renderOutlines(){
	celEffect.render(scene,camera);
}

/////////////////
//Set up controls
/////////////////

// Add controls using OrbitControls functions
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

// Modify controls within OrbitControls.js
controls.keys = {
	LEFT: 65, //A
	UP: 87, // W
	RIGHT: 68, // D
	BOTTOM: 83 // S
};

/////////////////
//Set up collision
/////////////////

// Set up physics parameters using cannon.js
var world = new CANNON.World();
var mass = 10;
world.gravity.set(0,-9.82,0); // set gravity in negative y direction
world.solver.iterations = 20; // Increase solver iterations (default is 10)
world.solver.tolerance = 0.01; // Force solver to use all iterations

// Collision detection
world.broadphase = new CANNON.NaiveBroadphase();

// Create skybox
var skyGeometry = new THREE.CubeGeometry(3000,3000,3000);
var skyMaterials = [
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
	new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 0x87CEEB}),
]

var sky = new THREE.Mesh(skyGeometry, skyMaterials);
scene.add(sky);

/////////////////
//Set up materials
/////////////////

// create tree trunk material
var trunkMaterial = new THREE.MeshLambertMaterial(
	{
	    color: 0x7b6147
	});
	
// create tree leaf material
var leafMaterial = new THREE.MeshLambertMaterial(
	{
	    color: 0xFFB3FF
	});

// create boulder material by importing textures
var boulderMaterial = new THREE.MeshPhongMaterial( {
	map: new THREE.TextureLoader().load('textures/mountain_tex.jpg'), 
	shininess: 0, 
	bumpMap: new THREE.TextureLoader().load('textures/mountain_bump.jpg'), 
} );

// create box material
var boxMaterial = new THREE.MeshLambertMaterial(
	{
	    color: 0xCC0000
	});

/////////////////
//Set up boxes
/////////////////

// box array numbers
var numBox = 200;
var boxes = [];

// loop create a new mesh with box geometry
for (var i = 1; i < numBox; i++)
{
	boxes[i] = new THREE.Mesh(
	   new THREE.BoxGeometry(2.5,2.5,2.5),
	   boxMaterial);
	scene.add(boxes[i]);
}

// add box
var boxBody = [];
var boxShape = new CANNON.Box(new CANNON.Vec3(1.25,1.25,1.25));

for (var i = 1; i < numBox; i++)
{
	boxBody[i] = new CANNON.Body({mass: mass});
	boxBody[i].addShape(boxShape);
	boxBody[i].position.set((Math.floor(Math.random() * (70 + 70 + 1)) -70),80+((i-1)*10),(Math.floor(Math.random() * (70 + 70 + 1)) -70));
	world.add(boxBody[i]);
}

/////////////////
//Set up trees
/////////////////
	
// tree objects number and array
var numberOfTrees = 100;
var treeTrunk = [];
var treeLeaf = [];
var count = 0;

// tree physics shape and array
var treeTrunkShape = new CANNON.Box(new CANNON.Vec3(1,4,1));
var treeTrunkBody = [];
var treeLeafShape = new CANNON.Box(new CANNON.Vec3(2.5,2.5,2.5));
var treeLeafBody = [];

// particle array
var particleGeoArray = [];
var particleMatArray = [];
var particle = [];
var countParticle = 0;
	
for(var i = 0; i < numberOfTrees; i++)
{
	// Set up variables for randomization
	var angle = Math.random()*Math.PI*2;
	var randomVar = Math.sqrt(Math.random());
	var randomX = randomVar * Math.cos(angle) * 90;
	var randomY = randomVar * Math.sin(angle) * 90;

	// If the random location is in the middle of the ring
	if ((randomY >= -20) && (randomY <= 20) && (randomX >= -20) && (randomX <= 20))
	{
		// increase X and Y pos by 40
		randomX = randomX + 40;
		randomY = randomY + 40;
	}
	
	// create visual tree trunk
	treeTrunk[i] = new THREE.Mesh(new THREE.BoxGeometry(2,8,2), trunkMaterial);
	treeTrunk[i].position.set(randomX,4,randomY);
	scene.add(treeTrunk[i]);
	
	// create physical tree trunk 
	treeTrunkBody[i] = new CANNON.Body({mass: 0});
	treeTrunkBody[i].addShape(treeTrunkShape);
	treeTrunkBody[i].position = (treeTrunk[i].position);
	world.add(treeTrunkBody[i]);

	for(var j = 0; j < 4; j++)
	{
		// create visual tree leaf
		treeLeaf[j+count] = new THREE.Mesh(new THREE.BoxGeometry(5,5,5), leafMaterial);
		treeLeaf[j+count].position.set((getRand(-2, 2)),(j+3),(getRand(-2, 2)));
		treeTrunk[i].add(treeLeaf[j+count]);
	}
	// ensure that treeTrunk[0] has treeLeaf[0, 1, 2], then treeTrunk[1] has treeLeaf[3, 4, 5], etc
	count = count + 4; 
	
	// add 7 leaf blocks to each tree
	for(var j = 0; j < 7; j++)
	{
		// create particle
		particleGeoArray[i] = new THREE.BoxGeometry(0.65, 0.6, 0.6);
		particleMatArray[i] = new THREE.MeshPhongMaterial({color: 0xffb3ff, transparent: true, opacity: Math.random()*0.8});
		particle[j+countParticle] = new THREE.Mesh(particleGeoArray[i], particleMatArray[i]);
		particle[j+countParticle].position.set((getRand(-2.5, 2.5)), (getRand(-2.5, 2.5)), (getRand(-2.5, 2.5)));
		treeTrunk[i].add(particle[j+countParticle]);
	}
	// same principle as count
	countParticle = countParticle + 7;
}

/////////////////
//Set up boulders
/////////////////

var numberOfBoulders = 100
var boulderMesh = [];
var boulderBody = [];

for(var i = 0; i < numberOfBoulders; i++)
{
	var boulderSize = getRand(5,20);
	var angle = Math.random()*Math.PI*2; // random size
	var randomX = Math.cos(angle) * 103; // random X angle
	var randomY = Math.sin(angle) * 103; // random Y angle
	
	// create visual boulder
	boulderMesh[i] = new THREE.Mesh(new THREE.SphereGeometry(boulderSize, 50, 50), boulderMaterial);
	boulderMesh[i].position.set(randomX,getRand(-2, 2),randomY);
	scene.add(boulderMesh[i]);
	
	// create physical boulder
	var boulderShape = new CANNON.Sphere(boulderSize);
	boulderBody[i] = new CANNON.Body({mass: 0});
	boulderBody[i].addShape(boulderShape);
	boulderBody[i].position = (boulderMesh[i].position);
	world.add(boulderBody[i]);
}

/////////////////
//Set up ground
/////////////////

// add physical plane using cannon.js function
var plane = new CANNON.Plane();
var groundBody = new CANNON.Body({ mass: 0});
groundBody.addShape(plane);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
world.add(groundBody);

// add ring shaped ground
var geometry = new THREE.RingGeometry( 20, 100, 100 );
var material = new THREE.MeshLambertMaterial( { color: 0x52883f, side: THREE.DoubleSide } );
var ring = new THREE.Mesh( geometry, material );
scene.add( ring );

// add ring shaped road
var geometry = new THREE.RingGeometry( 60, 70, 70 );
var material = new THREE.MeshLambertMaterial( { color: 0x765e47, side: THREE.DoubleSide } );
var ringRoad = new THREE.Mesh( geometry, material );
scene.add( ringRoad );

// add ring mountain outside
var geometry = new THREE.TorusGeometry( 120, 20, 16, 100 );
var ringMountainOut = new THREE.Mesh( geometry, boulderMaterial );
scene.add( ringMountainOut );

// add ring mountain inside
var geometry = new THREE.TorusGeometry( 20, 6, 16, 100 );
var ringMountainIn = new THREE.Mesh( geometry, boulderMaterial );
scene.add( ringMountainIn );

// position and rotate rings
ring.rotation.set(-Math.PI/2, 0, 0);
ringRoad.position.set(0, 0.1, 0);
ringRoad.rotation.set(-Math.PI/2, 0, 0);
ringMountainOut.position.set(0, -5, 0);
ringMountainOut.rotation.set(-Math.PI/2, 0, 0);
ringMountainIn.position.set(0, -5, 0);
ringMountainIn.rotation.set(-Math.PI/2, 0, 0);

/////////////////
//Set up light
/////////////////

// Ambient light
var lightAmbient = new THREE.AmbientLight( 0x222222 ); // soft white light
scene.add(lightAmbient);

// Rendering shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Spot light
var lightThis = new THREE.SpotLight(0xffffff);
lightThis.position.x = -200; //original: 100
lightThis.position.y = 250; //300
lightThis.position.z = -250; //100
lightThis.intensity = 1.3;
lightThis.penumbra = 0.50;
lightThis.angle = Math.PI/6;
scene.add(lightThis);

// physical light object (sun)
var sunGeometry = new THREE.SphereGeometry(15,18,18);
var sunMaterial = new THREE.MeshBasicMaterial({color: 0xf9d71c});
var sun = new THREE.Mesh(sunGeometry,sunMaterial);
scene.add(sun);
sun.position.set(-200,130,-500);

// night version (moon)
var moonGeometry = new THREE.SphereGeometry(15,18,18);
var moonMaterial = new THREE.MeshBasicMaterial({color: 0xf4f1c9});
var moon = new THREE.Mesh(moonGeometry,moonMaterial);
scene.add(moon);
moon.position.set(-200,130,-500);
moon.visible = false; // so it doesn't appear in initial daytime scene

// stars for night
var numberOfStars = 1000; // reduce this if framerate drops at night
var stars = [];
for(var i=0; i<numberOfStars; i++){
	var starGeo = new THREE.SphereGeometry(4,1,1);
	var starMat = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
	var star = new THREE.Mesh(starGeo,starMat);
	scene.add(star);
	star.position.set(getRand(-3000,3000), getRand(-3000,3000), getRand(-3000,3000))
	// to make sure no stars appear close to or in the environment
	while((star.position.x <= 700 && star.position.x >= -700) && (star.position.y <= 700 && star.position.y >= -700) && (star.position.z <= 700 && star.position.z >= -700)){
		star.position.set(getRand(-3000,3000), getRand(-3000,3000), getRand(-3000,3000))
	}

	star.visible = false; // so they don't appear in initial daytime scene
	stars[i] = star;
}

// clouds for day
var numberOfClouds = 20;
var clouds = [];
for(var i=0; i<numberOfClouds; i++){
	var cloudGeo = new THREE.CubeGeometry(getRand(50,150), 30, getRand(50,150));
	var cloudMat = new THREE.MeshBasicMaterial({color: 0xFFFFFF, transparent: true, opacity: getRand(0.5,0.8)})
	var cloud = new THREE.Mesh(cloudGeo,cloudMat);
	scene.add(cloud);
	cloud.position.set(getRand(-1000,1000), 150, getRand(-1000,1000));

	clouds[i] = cloud;
}


// Shadow quality
lightThis.castShadow = true;
lightThis.shadow.mapSize.width = 1024;
lightThis.shadow.mapSize.height = 1024;
lightThis.shadow.camera.near = 0.5;
lightThis.shadow.camera.far = 500;
lightThis.shadow.radius = 5.0;

// Apply shadows to boxes
for (var i = 1; i < numBox; i++)
{
	boxes[i].castShadow = true;
	boxes[i].receiveShadow = true;
}

// Apply shadows to trees
var count = 0;
for (var i = 0; i < numberOfTrees; i++)
{
	treeTrunk[i].castShadow = true;
	treeTrunk[i].receiveShadow = true;

	for(var j = 0; j < 4; j++)
	{
		treeLeaf[j+count].castShadow = true;
		treeLeaf[j+count].receiveShadow = true;
	}
	count = count + 4;
}

// Apply shadows to boulders
for(var i = 0; i < numberOfBoulders; i++)
{
	boulderMesh[i].castShadow = true;
	boulderMesh[i].receiveShadow = true;
}

// Apply shadows to land and mountains
ring.castShadow = false;
ring.receiveShadow = true;
ringRoad.castShadow = false;
ringRoad.receiveShadow = true;
ringMountainOut.castShadow = true;
ringMountainOut.receiveShadow = true;
ringMountainIn.castShadow = true;
ringMountainIn.receiveShadow = true;

/////////////////
// Set up text feedback
/////////////////

var numOfFireworksSetOff = 0;
var text1 = document.createElement('div');
text1.style.position = 'absolute';
text1.style.width = 150;
text1.style.width = 150;
text1.style.backgroundColor = "black";
text1.style.color = "white";
text1.innerHTML = "Fireworks set off: " + numOfFireworksSetOff;
text1.style.top = 80+'px';
text1.style.left = 1370+'px';
document.body.appendChild(text1);

////////////////////
// Set up fireworks
////////////////////

var fireworkParticles = []
var numberOfFireworkParticles = 50;
var velocities = [];
var createdFirework = false;
var fireworkOrigin = new THREE.Vector3(0,0,0)

// function to create firework particles
function createFirework(x, y, z, colour){
	// reset values and arrays
	fireworkParticles = [];
	velocities = [];
	var origin = new THREE.Vector3(x,y,z);
	fireworkOrigin = origin;

	// create arrays of particles and velocities
	for(var i=0; i<numberOfFireworkParticles; i++){
		var particleGeo = new THREE.SphereGeometry(2,1,1);
		var particleMat = new THREE.MeshBasicMaterial({color: colour});
		var particle = new THREE.Mesh(particleGeo,particleMat);
		scene.add(particle);
		fireworkParticles[i] = particle;
		particle.position.set(x,y,z);

		//set up random velocities for each particle
		var partVel = new THREE.Vector3(getRand(-5,5), getRand(-5,5), getRand(-5,5));
		velocities[i] = partVel;
	}
}

// function to animate/explode the firework
function explodeFirework(){
	for(var i=0; i<numberOfFireworkParticles; i++){
		fireworkParticles[i].position.x += velocities[i].x;
		fireworkParticles[i].position.y += velocities[i].y;
		fireworkParticles[i].position.z += velocities[i].z;

		// remove particles at certain distance from origin point, and set boolean to false to trigger new firework if it's still night
		if(fireworkParticles[i].position.distanceTo(fireworkOrigin) > 200){
			for(var j=0; j<numberOfFireworkParticles; j++){
				scene.remove(fireworkParticles[j]);
			}
			createdFirework = false;
		}
	}
}

// function to toggle day/night
function toggleDay(){
	if(sun.visible == true){
		sun.visible = false;
		sky.visible = false;
		moon.visible = true;
		// less intense night-time lighting
		lightThis.intensity = 0.3;

		// making night-time stars appear
		for(var i=0; i<numberOfStars; i++){
			stars[i].visible = true;
		}

		// making daytime clouds disappear
		for(var i=0; i<numberOfClouds; i++){
			clouds[i].visible = false;
		}
	}
	else{
		sun.visible = true;
		sky.visible = true;
		moon.visible = false;
		// more intense daytime lighting
		lightThis.intensity = 1.3;

		// making night-time stars disappear
		for(var i=0; i<numberOfStars; i++){
			stars[i].visible = false;
		}

		// making daytime clouds appear
		for(var i=0; i<numberOfClouds; i++){
			clouds[i].visible = true;
		}
	}
}

// function to reset positions of red boxes
function resetBoxes(){
	for (var i = 1; i < numBox; i++){
		boxBody[i].position.set((Math.floor(Math.random() * (70 + 70 + 1)) -70),80+((i-1)*10),(Math.floor(Math.random() * (70 + 70 + 1)) -70));
	}
}

/////////////////
// Set up GUI
/////////////////

var gui = new dat.GUI();

// add button to toggle day/night, calling toggleDay()
var dayNightButton = new function(){
	this.Toggle_DayNight = toggleDay;
}
gui.add(dayNightButton, 'Toggle_DayNight');

// add button to reset red falling boxes, calling resetBoxes()
var boxesButton = new function(){
	this.Reset_Boxes = resetBoxes;
}
gui.add(boxesButton, 'Reset_Boxes');

/////////////////
//Set up animate
/////////////////

var timeStep = 1.0 / 60.0; // seconds
var iFrame = 0;
function animate()
{
    requestAnimationFrame(animate);
	controls.update(); // for OrbitControl
	world.step(timeStep);
	// ... update visualization ...

	// animate sun/moon as well as clouds during day
	if(sun.visible == true){
		// clouds
		for(var i=0; i<numberOfClouds; i++){
			clouds[i].position.x += 0.6;
			clouds[i].position.z -= 0.35;
			// making sure they don't wander off
			if(clouds[i].position.x > 1000 || clouds[i].position.z < -1000){
				clouds[i].position.x = getRand(-1000,1000);
				clouds[i].position.z = getRand(-1000,1000);
			}
		}
	}

	//create firework if no other fireworks are active, only at night
	if(sun.visible == false && createdFirework == false){
		createFirework(getRand(-250,250), 100, -400, Math.random()*0xFFFFFF) // x y and z coords of firework + random colour
		createdFirework = true;
		// update text feedback
		numOfFireworksSetOff += 1;
		text1.innerHTML = "Fireworks set off: " + numOfFireworksSetOff;
	 }
	// animate firework
	if(createdFirework == true){
		explodeFirework();
	}

	// animate tree leaves
	var count = 0;
	for (var i = 0; i < numberOfTrees; i++)
	{
		for (var j =0; j<7; j++)
		{
			particle[j+count].position.y -= 0.02;
			if(particle[j+count].position.y < -4)
			{
				particle[j+count].position.y = (particle[j+count].position.y + 6)
			}
		}
		count = count + 7;
	}

	// animate falling boxes
	for (var i = 1; i < numBox; i++)
	{
		// attach visual box to physical box position
		boxes[i].position.x = boxBody[i].position.x;
		boxes[i].position.y = boxBody[i].position.y;
		boxes[i].position.z = boxBody[i].position.z;
		boxes[i].quaternion.x = boxBody[i].quaternion.x;
		boxes[i].quaternion.y = boxBody[i].quaternion.y;
		boxes[i].quaternion.z = boxBody[i].quaternion.z;
		boxes[i].quaternion.w = boxBody[i].quaternion.w;
	}

	iFrame++;
	renderer.render(scene, camera);
	renderOutlines();
}
animate();
