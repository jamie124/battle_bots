(function (bb, $, undefined) {

    var worldWidth = 1024, worldHeight = 1024, segmentsWidth = 128, segmentsHeight = 128;

    var initScene, render, createShape, NoiseGen,
        renderer, render_stats, physics_stats, scene, light, ground, groundGeometry, groundMaterial, camera;

    var terrainData;

    var contentItemsLoaded = 0;
    var totalContent = 0;

    var isMouseDown = false, onMouseDownPosition = {x: 0, y: 0},
        radius = 200, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    var testCube;

    bb.loadContent = function () {

        contentItemsLoaded = 0;


        var heightImg = new Image();

        heightImg.onload = function () {
            terrainData = bb.generateHeight(heightImg);

            bb.contentLoaded();
        };
        heightImg.src = "./res/heightmap.jpg";


        /*
         var loader = new THREE.JSONLoader();
         loader.load("./res/terrain.js", bb.setTerrain);
         */

        totalContent++;
    };

    /*
     bb.setTerrain = function (terrainGeometry) {
     groundGeometry = terrainGeometry;
     }
     */

    bb.contentLoaded = function () {
        console.log('Content item finished loading.');

        contentItemsLoaded++;

        if (contentItemsLoaded === totalContent) {
            console.log('All content has finished loading.');

            bb.init();
        }

    }


    bb.init = function () {
        TWEEN.start();

        renderer = new THREE.WebGLRenderer({ antialias: true });

        var width = $('#container').width(),
            height = $('#container').height();

        renderer.setSize(width, height);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        document.getElementById('container').appendChild(renderer.domElement);

        render_stats = new Stats();
        render_stats.domElement.style.position = 'absolute';
        render_stats.domElement.style.top = '0px';
        render_stats.domElement.style.zIndex = 100;
        document.getElementById('container').appendChild(render_stats.domElement);

        physics_stats = new Stats();
        physics_stats.domElement.style.position = 'absolute';
        physics_stats.domElement.style.top = '50px';
        physics_stats.domElement.style.zIndex = 100;
        document.getElementById('container').appendChild(physics_stats.domElement);

        scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
        scene.setGravity(new THREE.Vector3(0, -30, 0));
        scene.addEventListener(
            'update',
            function () {
                scene.simulate(undefined, 2);
                physics_stats.update();
            }
        );

        camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.set(200, 60, 200);
        // camera.lookAt(scene.position);
        scene.add(camera);

        // Light
        light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set(20, 40, -15);
        light.target.position.copy(scene.position);
        light.castShadow = true;
        light.shadowCameraLeft = -60;
        light.shadowCameraTop = -60;
        light.shadowCameraRight = 60;
        light.shadowCameraBottom = 60;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 200;
        light.shadowBias = -.0001
        light.shadowMapWidth = light.shadowMapHeight = 2048;
        light.shadowDarkness = .7;
        scene.add(light);

        // Materials
        groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./res/grass.png') }),
            .8, // high friction
            .4 // low restitution
        );
        groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
        groundMaterial.map.repeat.set(2.5, 2.5);

        // Ground

        NoiseGen = new SimplexNoise;

        groundGeometry = new THREE.PlaneGeometry(worldWidth, worldHeight, segmentsWidth, segmentsHeight);
        for (var i = 0; i < groundGeometry.vertices.length; i++) {
            var vertex = groundGeometry.vertices[i];
            // vertex.z = NoiseGen.noise(vertex.x / 10, vertex.y / 10) * 2;

            vertex.z = terrainData[i];
        }


        groundGeometry.computeFaceNormals();
        groundGeometry.computeVertexNormals();

        // If your plane is not square as far as face count then the HeightfieldMesh
        // takes two more arguments at the end: # of x faces and # of y faces that were passed to THREE.PlaneMaterial
        ground = new Physijs.HeightfieldMesh(
            groundGeometry,
            groundMaterial,
            0, // mass
            segmentsWidth,
            segmentsHeight
        );

        ground.position.y = -100;
        ground.rotation.x = Math.PI / -2;
        ground.receiveShadow = true;
        scene.add(ground);

        // camera.lookAt(ground.position);

        // Test stuff
        var box_geometry = new THREE.CubeGeometry(3, 3, 3),
            shape,
            material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: false });

        /*
        testCube = new THREE.Mesh(
            box_geometry,
            material
        );
        */
        testCube = new Physijs.BoxMesh(
            box_geometry,
            material
        );

        testCube.material.color.setRGB(255, 0, 0);
        testCube.castShadow = true;
        testCube.receiveShadow = true;

        testCube.position.set(
            0,
            0,
            0
        );

        camera.lookAt(testCube.position);

        /*
         shape.rotation.set(
         Math.random() * Math.PI,
         Math.random() * Math.PI,
         Math.random() * Math.PI
         );
         */

        scene.add(testCube);

        requestAnimationFrame(bb.render);
        scene.simulate();

        // bb.createShape();
    };

    bb.render = function () {
        requestAnimationFrame(bb.render);

        // Update camera look, move to actual movement method when implemented
        camera.lookAt(testCube.position);

        renderer.render(scene, camera);
        render_stats.update();
    };

    bb.createShape = function () {

        bb.doCreateShape();

        // return function () {
        //     setTimeout(bb.doCreateShape(), 1000);
        // };
    };

    bb.doCreateShape = function () {
        var addshapes = true,
            shapes = 0,
            box_geometry = new THREE.CubeGeometry(3, 3, 3),
            sphere_geometry = new THREE.SphereGeometry(1.5, 32, 32),
            cylinder_geometry = new THREE.CylinderGeometry(2, 2, 1, 32),
            cone_geometry = new THREE.CylinderGeometry(0, 2, 4, 32),
            octahedron_geometry = new THREE.OctahedronGeometry(1.7, 1),
            torus_geometry = new THREE.TorusKnotGeometry(1.7, .2, 32, 4),
            shape,
            material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });

        switch (0) {
            case 0:
                shape = new Physijs.BoxMesh(
                    box_geometry,
                    material
                );
                break;

            case 1:
                shape = new Physijs.SphereMesh(
                    sphere_geometry,
                    material,
                    undefined,
                    { restitution: Math.random() * 1.5 }
                );
                break;
        }

        shape.material.color.setRGB(Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100);
        shape.castShadow = true;
        shape.receiveShadow = true;

        shape.position.set(
            Math.random() * 30 - 15,
            20,
            Math.random() * 30 - 15
        );

        shape.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        if (addshapes) {
            shape.addEventListener('ready', createShape);
        }
        scene.add(shape);

        // camera.lookAt(shape.position);

        new TWEEN.Tween(shape.material).to({opacity: 1}, 500).start();

        // document.getElementById('shapecount').textContent = (++shapes) + ' shapes created';
    };

    bb.generateHeight = function (heightImg) {
        var canvas = document.createElement('canvas');
        canvas.width = worldWidth;
        canvas.height = worldHeight;

        var context = canvas.getContext('2d');

        context.drawImage(heightImg, 0, 0);

        var size = worldWidth * worldHeight, data = new Float32Array(size);

        for (var i = 0; i < size; i++) {
            data[ i ] = 0;
        }

        var imgd = context.getImageData(0, 0, worldWidth, worldHeight);
        var pix = imgd.data;

        var j = 0;

        for (var i = 0, n = pix.length; i < n; i += (4)) {
            var all = pix[i] + pix[i + 1] + pix[i + 2];
            data[j++] = all / 30;
        }

        return data;

    };

    /**
     * Update camera position and look at
     */
    bb.updateCamera = function () {
        camera.position.x = radius * Math.sin(theta * Math.PI / 360)
            * Math.cos(phi * Math.PI / 360);
        camera.position.y = radius * Math.sin(phi * Math.PI / 360);
        camera.position.z = radius * Math.cos(theta * Math.PI / 360)
            * Math.cos(phi * Math.PI / 360);

        camera.updateMatrix();
    }

    bb.handleMouseUp = function () {
        isMouseDown = false;

        onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
        onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
    };

    bb.handleMouseDown = function (mouseEvent) {
        isMouseDown = true;

        onMouseDownTheta = theta;
        onMouseDownPhi = phi;
        onMouseDownPosition.x = mouseEvent.clientX;
        onMouseDownPosition.y = mouseEvent.clientY;
    };

    bb.handleMouseMove = function (mouseEvent) {
        mouseEvent.preventDefault();

        if (isMouseDown) {

            theta = -( ( mouseEvent.clientX - onMouseDownPosition.x ) * 0.5 )
                + onMouseDownTheta;
            phi = ( ( mouseEvent.clientY - onMouseDownPosition.y ) * 0.5 )
                + onMouseDownPhi;

            phi = Math.min(180, Math.max(0, phi));

            bb.updateCamera();


        }
    }

}(window.bb = window.bb || {}, jQuery));