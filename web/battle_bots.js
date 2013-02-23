(function (bb, $, undefined) {

    var worldWidth = 256, worldLength = 256, segmentsWidth = 128, segmentsHeight = 128;

    var initScene, render, createShape, NoiseGen,
        renderer, render_stats, physics_stats, scene, light, ground, groundGeometry, groundMaterial, camera;

    var terrainData;

    var contentItemsLoaded = 0;
    var totalContent = 0;

    var isMouseDown = false, onMouseDownPosition = {x: 0, y: 0},
        radius = 300, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    var testCube;

    bb.loadContent = function () {

        contentItemsLoaded = 0;


        var heightImg = new Image();

        heightImg.onload = function () {
            terrainData = bb.generateHeight(heightImg);

            bb.contentLoaded();
        };
        heightImg.src = "./res/heightmap_256.png";


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

        scene = new Physijs.Scene({ reportsize: 50, fixedTimeStep: 1 / 60 });
        scene.setGravity(new THREE.Vector3(0, -3, 0));

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
            10000
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
        /*
        groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./res/grass.png')}),
            .9, // high friction
            .2 // low restitution
        );
        */
        var groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( './res/grass.png' ), ambient: 0xFFFFFF }),
            .9, // high friction
            .2 // low restitution
        );

        groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
        groundMaterial.map.repeat.set(5, 5);


        // Ground

        // NoiseGen = new SimplexNoise;

        //groundGeometry = new THREE.PlaneGeometry(worldWidth, worldHeight, segmentsWidth, segmentsHeight);
        groundGeometry = new THREE.PlaneGeometry(800, 800, worldWidth - 1, worldLength - 1);


        var terrainTestData = new Array();
        var terrainVertex = {x: 0, y: 0, z: 0};

        groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        groundGeometry.dynamic = true;

        var vertexPosition = 0;
        for (var z = 0; z < worldLength; z++) {
            for (var x = 0; x < worldWidth; x++) {

                var vertex = groundGeometry.vertices[vertexPosition];

                vertex.y = terrainData[z][x];

                //console.log(z + ':' + x + '=' + vertexPosition + '| Y: ' + vertex.y);

                // bb.createText(z + ':' + x , vertex.x, vertex.y, vertex.z);

                // terrainVertex = new Object();
                //  terrainVertex.x = vertex.x;
                // terrainVertex.y = vertex.y;
                // terrainVertex.z = vertex.z;


                // terrainTestData.push(terrainVertex);

                vertexPosition += 1;

            }
        }


        //console.log(groundGeometry.vertices);

        /*
         $.post("/battlebots/debugLogging", {
         "debug_type": "terrain",
         "data": JSON.stringify(terrainTestData),
         "width": worldWidth,
         "height": worldLength
         }, function (data) {
         alert(data);
         });
         */


        groundGeometry.computeCentroids();
        groundGeometry.computeFaceNormals();
        groundGeometry.computeVertexNormals();
        groundGeometry.computeTangents();

        // groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));

        // If your plane is not square as far as face count then the HeightfieldMesh
        // takes two more arguments at the end: # of x faces and # of y faces that were passed to THREE.PlaneMaterial


        ground = new Physijs.HeightfieldMesh(
            groundGeometry,
            groundMaterial,
            0,
            worldWidth - 1,
            worldLength - 1
        );


        //ground.position.y = 150;

        // ground = new THREE.Mesh(groundGeometry);

        // ground.position.y = 100;
        // ground.rotation.x = Math.PI / 2;
        ground.receiveShadow = true;
       scene.add(ground);


        var table_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( './res/grass.png' ), ambient: 0xFFFFFF }),
            .9, // high friction
            .2 // low restitution
        );
        table_material.map.wrapS = table_material.map.wrapT = THREE.RepeatWrapping;
        table_material.map.repeat.set( 5, 5 );

       var table = new Physijs.PlaneMesh(
            new THREE.PlaneGeometry(50, 50, 50, 50),
            table_material,
            0, // mass
            { restitution: .2, friction: .8 }
        );
        table.position.y = 20;
        table.receiveShadow = true;
        table.rotation.x = 180;

        //scene.add( table );

        // camera.lookAt(ground.position);


        /*
         testCube = new THREE.Mesh(
         box_geometry,
         material
         );
         */

        /*
         testCube = new Physijs.BoxMesh(
         box_geometry,
         material
         );
         */

        /*
         testCube = new Physijs.BoxMesh(
         new THREE.CubeGeometry(5, 5, 5),
         new THREE.MeshBasicMaterial({color: 0x888888})
         );

         // testCube.material.color.setRGB(255, 0, 0);
         testCube.castShadow = true;
         testCube.receiveShadow = true;

         testCube.position.set(
         0,
         200,
         0
         );

         camera.lookAt(testCube.position);



         scene.add(testCube);
         */

        requestAnimationFrame(bb.render);

        scene.simulate();

        bb.createShape();
    };

    bb.render = function () {
        requestAnimationFrame(bb.render);

        // Update camera look, move to actual movement method when implemented
        //camera.lookAt(testCube.position);
        bb.updateCamera();

        //  scene.simulate();

        renderer.render(scene, camera);
        render_stats.update();
    };

    bb.createShape = function () {

        bb.doCreateShape();

        // return function () {
        //     setTimeout(bb.doCreateShape(), 1000);
        // };
    };

    bb.createText = function (text, x, y, z) {

        var text3d = new THREE.TextGeometry(text, {

            size: 1,
            height: 2,
            curveSegments: 8,

            font: "optimer",
            weight: "normal",
            style: "normal",

            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelEnabled: false,


            material: 0,
            extrudeMaterial: 1

        });

        text3d.computeBoundingBox();
        text3d.computeVertexNormals();

        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        var textMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: true });
        text = new THREE.Mesh(text3d, textMaterial);

        text.position.x = x;
        text.position.y = y;
        text.position.z = z;

        text.rotation.x = 30;
        //  text.rotation.y = 45;
        // text.rotation.z = 180;

        var parent = new THREE.Object3D();
        parent.add(text);


        scene.add(parent);
    };

    bb.doCreateShape = function () {
        var addshapes = false,
            shapes = 0,
            box_geometry = new THREE.CubeGeometry(3, 3, 3),
            sphere_geometry = new THREE.SphereGeometry(1.5, 32, 32),
            cylinder_geometry = new THREE.CylinderGeometry(2, 2, 1, 32),
            cone_geometry = new THREE.CylinderGeometry(0, 2, 4, 32),
            octahedron_geometry = new THREE.OctahedronGeometry(1.7, 1),
            torus_geometry = new THREE.TorusKnotGeometry(1.7, .2, 32, 4),
            shape,
            material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });

        switch (1) {
            case 0:
                testCube = new Physijs.BoxMesh(
                    box_geometry,
                    material
                );
                break;

            case 1:
                testCube = new Physijs.SphereMesh(
                    sphere_geometry,
                    material,
                    undefined,
                    { restitution: Math.random() * 1.5 }
                );
                break;
        }

        testCube.material.color.setRGB(Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100);
        testCube.castShadow = true;
        testCube.receiveShadow = true;

        /*
         testCube.position.set(
         Math.random() * 30 - 15,
         20,
         Math.random() * 30 - 15
         );
         */

        testCube.position.set(
            0,
            30,
            0
        );

        testCube.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        if (addshapes) {
            shape.addEventListener('ready', createShape);
        }
        scene.add(testCube);

        camera.lookAt(testCube.position);

        new TWEEN.Tween(testCube.material).to({opacity: 1}, 500).start();

        // document.getElementById('shapecount').textContent = (++shapes) + ' shapes created';
    };

    /**
     * Convert an heightmap image into height values.
     * @param heightImg
     */

    bb.generateHeight = function (heightImg) {
        var data = new Array(worldLength);

        for (var h = 0; h < worldLength; h++) {
            data[h] = new Array(worldWidth);
        }

        var canvas = document.createElement('canvas');

        $('#heightMap').append(canvas);

        var width = worldWidth,
            height = worldLength;

        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext('2d');

        context.drawImage(heightImg, 0, 0);

        /*
         var size = (width) * (height), data = new Float32Array(size);

         for (var i = 0; i < size; i++) {
         data[ i ] = 0;
         }
         */

        /*
         var imgd = context.getImageData(0, 0, width, height);
         var pix = imgd.data;

         var j = 0;

         var i = 0;
         for (i = 0, n = pix.length; i < n; i += (4)) {
         var all = pix[i] + pix[i + 1] + pix[i + 2];
         data[j++] = all / 20;

         // console.log(j);
         }
         */

        for (var z = 0; z < worldLength; z++) {
            for (var x = 0; x < worldWidth; x++) {

                var imgd = context.getImageData(x, z, 1, 1);
                var pix = imgd.data;

                var all = pix[0] + pix[ 1] + pix[ 2];
                // console.log('z: ' + z + ' x: ' + x + ' = ' + (all / 20));

                data[z][x] = all / 20;
            }
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

        if (camera.position.y < 20) {
            camera.position.y = 20;
        }

        //camera.position.y = 90;
        camera.position.z = radius * Math.cos(theta * Math.PI / 360)
            * Math.cos(phi * Math.PI / 360);

        camera.lookAt(testCube.position);

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

            var msg = "Theta: ";
            msg += theta + ", Phi: " + phi;
            $("#log").html("<div>" + msg + "</div>");

            //  bb.updateCamera();


        }
    };

    bb.changeZoom = function (direction) {
        if (direction === 1) {
            // Zoom in
            radius += 10;
        } else if (direction === -1) {
            // Zoom out
            radius -= 10;
        }

        if (radius <= 50) {
            radius = 50;
        } //else if (radius >= 300) {
        //    radius = 300;
        //}
    }

}(window.bb = window.bb || {}, jQuery));