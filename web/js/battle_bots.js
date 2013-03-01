(function (bb, $, undefined) {

    var worldWidth = 256, worldLength = 256, segmentsWidth = 128, segmentsHeight = 128;

    var initScene, render, createShape, NoiseGen,
        renderer, render_stats, physics_stats, scene, light, ground, groundGeometry, groundMaterial, camera;

    var characterNode, engineGeometry, input;

    var vehicleNode, vehicleMesh, vehicleGeo;

    var terrainData;

    var contentItemsLoaded = 0;
    var totalContent = 0;

    var isMouseDown = false, onMouseDownPosition = {x: 0, y: 0},
        radius = 50, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    var testCubeMesh;

    bb.loadContent = function () {

        contentItemsLoaded = 0;


        var heightImg = new Image();

        heightImg.onload = function () {
            terrainData = bb.generateHeightData(heightImg);

            bb.contentLoaded();
        };
        heightImg.src = "./res/test_world.png";

        var loader = new THREE.JSONLoader();

        totalContent++;

        loader.load("./res/models/basic_bot.js", function (vehicle) {

            totalContent++;
            loader.load("./res/models/basic_engine.js", function (engine) {

                /*
                 characterMesh = new Physijs.BoxMesh(
                 car,
                 new THREE.MeshFaceMaterial
                 );
                 */

                /*
                 vehicleGeo = new THREE.Mesh(
                 car,
                 new THREE.MeshFaceMaterial
                 );
                 */


                /*
                 vehicleGeo.doubleSided = true;

                 vehicleGeo.position.y = 20;
                 vehicleGeo.castShadow  = true;
                 */

                vehicleGeo = vehicle;

                engineGeometry = engine;

                bb.contentLoaded();
            });

            bb.contentLoaded();
        });

        totalContent++;
    };


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
                if (input && characterNode) {
                    if (input.direction !== null) {
                        input.steering += input.direction / 50;
                        if (input.steering < -.6) input.steering = -.6;
                        if (input.steering > .6) input.steering = .6;
                    }
                    /*
                     characterNode.setSteering(input.steering, 0);
                     characterNode.setSteering(input.steering, 1);

                     if (input.power === 1) {
                     characterNode.applyEngineForce(300);
                     } else if (input.power === 0) {
                     characterNode.setBrake(20, 2);
                     characterNode.setBrake(20, 3);

                     characterNode.applyEngineForce(0);
                     } else if (input.power === -1) {
                     characterNode.applyEngineForce(-200);
                     } else {
                     characterNode.applyEngineForce(0);
                     }
                     */
                }

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

        // Ground
        groundGeometry = bb.convertHeightDataToMesh(terrainData, worldWidth, worldLength);

        groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./res/grass.png') }),
            .8, // high friction
            .4 // low restitution
        );
        groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
        groundMaterial.map.repeat.set(2.5, 2.5);

        ground = new Physijs.HeightfieldMesh(
            groundGeometry,
            undefined,
            0
        );

        ground.rotation.x = Math.PI / -2;


        ground.receiveShadow = true;

        scene.add(ground);


        requestAnimationFrame(bb.render);

        scene.simulate();

        // Create character
        bb.initialiseCharacter();

        //   bb.createShapes();
    };

    /**
     * Render to screen
     */
    bb.render = function () {
        requestAnimationFrame(bb.render);

        bb.updateCharacter();

        // Update camera look, move to actual movement method when implemented
        bb.updateCamera();


        renderer.render(scene, camera);
        render_stats.update();
    };

// Create a shape
    bb.createShape = function () {

        bb.doCreateShapePhysijs();

        // return function () {
        //     setTimeout(bb.doCreateShape(), 1000);
        // };
    };

    /**
     * Draw text at a position
     * @param text
     * @param x
     * @param y
     * @param z
     */
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

        // var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

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


    /**
     * Create character
     */
    bb.initialiseCharacter = function () {
        /*
         characterNode = new Physijs.Vehicle(characterMesh, new Physijs.VehicleTuning(
         10.88,
         1.83,
         0.28,
         500,
         10.5,
         6000
         ));
         */

        // scene.add(characterNode);

        // window.vehicle = vehicle;
        //  window.scene = scene;

        var wheel_material = new THREE.MeshFaceMaterial;

        var engines = new THREE.Object3D();

        for (var i = 0; i < 4; i++) {

            //  var engineMesh = new THREE.Mesh(engineGeometry, new THREE.MeshFaceMaterial);
            var engineMesh = new Physijs.BoxMesh(engineGeometry, new THREE.MeshFaceMaterial);

            /*
            engineMesh.position.set(i % 2 === 0 ? -0.9 : 0.9,
                0.4,
                i < 2 ? 1.2 : -1.2);
                */

            //engineMesh.rotation.set(Math.PI / 2, 0, (i % 2 === 0 ? Math.PI : 0));

            engines.add(engineMesh);

            //  scene.add(engineMesh);

            /*
             characterNode.addWheel(
             characterWheel,
             wheel_material,
             new THREE.Vector3(
             i % 2 === 0 ? -0.9 : 0.9,
             0.5,
             i < 2 ? 1.4 : -1.4
             ),
             new THREE.Vector3(0, -1, 0),
             new THREE.Vector3(-1, 0, 0),
             0.5,
             0.7,
             i < 2 ? true : true
             );
             */
        }

        vehicleNode = new THREE.Object3D();

        // var vehicleMesh = new THREE.Mesh(vehicleGeo, new THREE.MeshFaceMaterial);
        vehicleMesh = new Physijs.BoxMesh(vehicleGeo, new THREE.MeshFaceMaterial);

        vehicleMesh.position.set(0, 20, 0);
        vehicleMesh.add(engines)

        vehicleNode.add(vehicleMesh);
        // vehicleNode.add(engines);

        //var test = Physijs.BoxMesh(vehicleGeo);

        scene.add(vehicleMesh);

        input = {
            power: null,
            direction: null,
            steering: 0
        };
        document.addEventListener('keydown', function (ev) {
            switch (ev.keyCode) {
                case 65: // left
                    input.direction = 1;
                    break;

                case 87: // forward
                    input.power = 1;
                    break;

                case 68: // right
                    input.direction = -1;
                    break;

                case 83: // back
                    input.power = -1;
                    break;
            }
        });
        document.addEventListener('keyup', function (ev) {
            switch (ev.keyCode) {
                case 65: // left
                    input.direction = null;
                    break;

                case 87: // forward
                    input.power = 0;
                    break;

                case 68: // right
                    input.direction = null;
                    break;

                case 83: // back
                    input.power = 0;
                    break;
            }
        });

        //new TWEEN.Tween(vehicleNode.mesh.material).to({opacity: 1}, 500).start();
        new TWEEN.Tween(vehicleMesh.material).to({opacity: 1}, 500).start();
    };

    bb.updateCharacter = function () {
        var message = 'Character position, X:' + vehicleNode.position.x.toFixed(1)
            + ' Y:' + vehicleNode.position.y.toFixed(1) + ' Z:' + vehicleNode.position.z.toFixed(1);

        bb.logMessage(message);
    };

    /**
     * Convert an heightmap image into height values.
     * @param heightImg
     */
    bb.generateHeightData = function (heightImg) {
        var data = new Array(worldLength);

        for (var h = 0; h < worldLength; h++) {
            data[h] = new Array(worldWidth);
        }

        var canvas = document.createElement('canvas');

        // Debugging
        $('#heightMap').append(canvas);

        var width = worldWidth,
            height = worldLength;

        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext('2d');

        context.drawImage(heightImg, 0, 0);

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
     * Convert the height values into a Plane Geometry
     * @param data
     * @param width
     * @param length
     * @return {THREE.PlaneGeometry}
     */
    bb.convertHeightDataToMesh = function (data, width, length) {
        var mesh = new THREE.PlaneGeometry(200, 200, width - 1, length - 1);


        var vertexPosition = 0;


        for (var z = 0; z < worldLength; z++) {
            for (var x = 0; x < worldWidth; x++) {

                var vertex = mesh.vertices[vertexPosition];

                vertex.z = terrainData[z][x];


                //console.log(z + ':' + x + '=' + vertexPosition + '| Y: ' + vertex.y);

                //  bb.createText(z + ':' + x, vertex.x, vertex.y, vertex.z);

                // terrainVertex = new Object();
                //  terrainVertex.x = vertex.x;
                // terrainVertex.y = vertex.y;
                // terrainVertex.z = vertex.z;


                // terrainTestData.push(terrainVertex);

                vertexPosition += 1;

            }
        }


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


        mesh.computeFaceNormals();
        mesh.computeVertexNormals();

        return mesh;
    }

    /**
     * Update camera position and look at
     */
    bb.updateCamera = function () {
        camera.position.x = radius * Math.sin(theta * Math.PI / 360)
            * Math.cos(phi * Math.PI / 360);
        camera.position.y = radius * Math.sin(phi * Math.PI / 360);

        if (camera.position.y < 10) {
            camera.position.y = 10;
        }

        //camera.position.y = 90;
        camera.position.z = radius * Math.cos(theta * Math.PI / 360)
            * Math.cos(phi * Math.PI / 360);

        camera.lookAt(vehicleMesh.position);

        //camera.lookAt(ground.position);

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
            bb.logMessage(msg);

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

        if (radius <= 0) {
            radius = 50;
        } //else if (radius >= 300) {
        //    radius = 300;
        //}
    };

    bb.logMessage = function (message) {
        $("#log").html("<div>" + message + "</div>");
    };

}
    (window.bb = window.bb || {}, jQuery)
    )
;