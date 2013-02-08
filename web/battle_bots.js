// Battle Bots

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var FLOOR = -1000;

var r = 0;

var worldWidth = 128, worldHeight = 128, worldDepth = 128,
	worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

var clock = new THREE.Clock();

var home = {x: 0, y: 0, z:0};

var player = {
    position: {x: 0, y: 0, z:0},
    rotation: {x: 0, y: 0, z:0}
};

var moveState = {
    moving    : false,
    front     : false,
    Backwards : false,
    left      : false,
    right     : false,
    speed     : .1,
    angle     : 0
};

var terrainMesh;

function init() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );

	scene = new THREE.Scene();

	controls = new THREE.FirstPersonControls( camera );
	controls.movementSpeed = 1000;
	controls.lookSpeed = 0.1;

	var heightImg = new Image();
	
	heightImg.onload = function () {
		data = generateHeight(heightImg);

		camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 500;

		var geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

			geometry.vertices[ i ].y = data[ i ] * 10;

            if (data[i] > home.y) {
                home.x = geometry.vertices[i].x;
                home.y = geometry.vertices[i].y;
                home.z = geometry.vertices[i].z;
            }
		}

		//texture = new THREE.Texture( generateTexture( data, worldWidth, worldDepth ), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
		
		texture = new THREE.ImageUtils.loadTexture( './res/grass.png', new THREE.UVMapping(), function() {  } );

		texture.needsUpdate = true;

		terrainMesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		scene.add( terrainMesh );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.innerHTML = "";

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	heightImg.src = "./res/heightmap_128.jpg";
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	controls.handleResize();

}

function movePlayer() {

    var speed = moveState.speed;

    var direction = moveState.angle;
    if( moveState.front && !moveState.left && !moveState.Backwards && !moveState.right){direction +=   0}
    if( moveState.front &&  moveState.left && !moveState.Backwards && !moveState.right){direction +=  45}
    if(!moveState.front &&  moveState.left && !moveState.Backwards && !moveState.right){direction +=  90}
    if(!moveState.front &&  moveState.left &&  moveState.Backwards && !moveState.right){direction += 135}
    if(!moveState.front && !moveState.left &&  moveState.Backwards && !moveState.right){direction += 180}
    if(!moveState.front && !moveState.left &&  moveState.Backwards &&  moveState.right){direction += 225}
    if(!moveState.front && !moveState.left && !moveState.Backwards &&  moveState.right){direction += 270}
    if( moveState.front && !moveState.left && !moveState.Backwards &&  moveState.right){direction += 315}

    player.rotation.y = (direction+270) * Math.PI / 180;

    player.direction = direction;
    player.position.x -= Math.sin(direction * Math.PI / 180) * speed;
    player.position.z -= Math.cos(direction * Math.PI / 180) * speed;

    var vec = new THREE.Vector3( 0, -1, 0 );
    var pos = new THREE.Vector3(player.position.x, player.position.y+2, player.position.z);
    var raycaster = new THREE.Raycaster(pos, vec);
    var intersects = raycaster.intersectObject(terrainMesh);

    if (intersects.length>0) {
        player.position.y = intersects[0].point.y+.5;
    }
}

var timer;

document.addEventListener('keydown', function(e){
    if( !/65|68|83|87|38|40|37|39/.test(e.keyCode)){ console.log(e.keyCode); return }
    if( e.keyCode === 87 | e.keyCode === 38){
        moveState.front     = true;
        moveState.Backwards = false;
    } else if ( e.keyCode === 83 | e.keyCode === 40){
        moveState.Backwards = true;
        moveState.front     = false;
    } else if ( e.keyCode === 65 | e.keyCode === 37){
        moveState.left  = true;
        moveState.right = false;
    } else if ( e.keyCode === 68 | e.keyCode === 39){
        moveState.right = true;
        moveState.left  = false;
    }
    if(!moveState.moving){
        if(player.state === 'stand')  {player.changeMotion('run');}
        if(player.state === 'crstand'){player.changeMotion('crwalk');}
        moveState.moving = true;
        movePlayer();
        timer = setInterval( function(){
            movePlayer();
        }, 1000 / 60);
    }
}, false);

document.addEventListener('keyup', function(e){
    if( !/65|68|83|87|38|40|37|39|84/.test(e.keyCode)){ return }
    if( e.keyCode === 87 | e.keyCode === 38){
        moveState.front = false;
    } else if ( e.keyCode === 83 | e.keyCode === 40 ){
        moveState.Backwards = false;
    } else if ( e.keyCode === 65 | e.keyCode === 37){
        moveState.left = false;
    } else if ( e.keyCode === 68  | e.keyCode === 39){
        moveState.right = false;
    } else if (e.keyCode === 84 ) {
        moveState.front = false;
        moveState.Backwards = false;
        moveState.left = false;
        moveState.right = false;
       // teleportHome();
    }
    if(!moveState.front && !moveState.Backwards && !moveState.left && !moveState.right){
        player.changeMotion(player.state);
        moveState.moving = false;
        clearInterval(timer);
    }
}, false);

function generateHeight(heightImg) {
	var canvas = document.createElement( 'canvas' );
		canvas.width = worldWidth;
		canvas.height = worldHeight;
	
	var context = canvas.getContext( '2d' );

	context.drawImage(heightImg,0,0);

	var size = worldWidth * worldHeight, data = new Float32Array( size ),
	perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

	for ( var i = 0; i < size; i ++ ) {
		data[ i ] = 0;
	}

	var imgd = context.getImageData(0, 0, worldWidth, worldHeight);
	var pix = imgd.data;

	var j=0;
	
	for (var i = 0, n = pix.length; i < n; i += (4)) {
		var all = pix[i]+pix[i+1]+pix[i+2];
		data[j++] = all/30;
	}

	return data;

}

function generateTexture( data, width, height ) {

	var canvas, canvasScaled, context, image, imageData,
		level, diff, vector3, sun, shade;

	vector3 = new THREE.Vector3( 0, 0, 0 );

	sun = new THREE.Vector3( 1, 255, 1 );
	sun.normalize();

	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext( '2d' );
	context.fillStyle = '#00a';
	context.fillRect( 0, 0, width, height );

	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;

	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();

		shade = vector3.dot( sun );

		imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 256 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
	}

	context.putImageData( image, 0, 0 );

	// Scaled 4x

	canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;

	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );

	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;

	for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

		var v = ~~ ( Math.random() * 5 );

		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;

	}

	context.putImageData( image, 0, 0 );

	return canvasScaled;

}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	controls.update( clock.getDelta() );
	renderer.render( scene, camera );

}