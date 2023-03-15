import * as THREE from 'three';
import { BasicCharacterV3Controller } from './BasicCharacterV3';
import { BasicCharacterV4Controller } from './BasicCharacterV4';
import { OrbitControls, MapControls } from './jsm/controls/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';




/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene {
    // A dat.gui class debugger that is added by default
    // debugger: GUI = null;
    // Setups a scene camera
    camera: THREE.PerspectiveCamera = null;
    controls: OrbitControls;
    // setup renderer
    renderer: THREE.Renderer = null;
    // setup Orbitals
    // orbitals: OrbitControls = null;
    // Holds the lights for easy reference
    lights: Array<THREE.Light> = [];
    // Number of PointLight objects around origin
    lightCount: number = 6;
    // Distance above ground place
    lightDistance: number = 3;
    // Get some basic params
    width = window.innerWidth;
    height = window.innerHeight;
    /**
     * Initializes the scene by adding lights, and the geometry
     */
    initialize(debug: boolean = true, addGridHelper: boolean = true) {





        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("app") as HTMLCanvasElement,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // =>camera
        this._initCamera();




        // this.add(line);



        // lights
        this._initLighting();


        this._loadMainEnvironmentModel();

        // let char = new BasicCharacterController(this);
        // let char = new BasicCharacterV3Controller(this);
        let char = new BasicCharacterV4Controller(this);

        // renderer.render(scene, camera);

        this.animate();
        // setup camera
        // this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000);
        // this.camera.position.z = 12;
        // this.camera.position.y = 12;
        // this.camera.position.x = 12;
        // // setup renderer
        // this.renderer = new THREE.WebGLRenderer({
        //     canvas: document.getElementById("app") as HTMLCanvasElement,
        //     alpha: true
        // });
        // this.renderer.setSize(this.width, this.height);

        // // sets up the camera's orbital controls
        // this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
        // // Adds an origin-centered grid for visual reference
        // if (addGridHelper) {
        //     // Adds a grid
        //     this.add(new THREE.GridHelper(10, 10, 'red'));
        //     // Adds an axis-helper
        //     this.add(new THREE.AxesHelper(3))
        // }
        // // set the background color
        // // this.background = new THREE.Color(0xefefef);
        // // create the lights
        // for (let i = 0; i < this.lightCount; i++) {
        //     // Positions evenly in a circle pointed at the origin
        //     const light = new THREE.PointLight(0xffffff, 1);
        //     let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i);
        //     let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i);
        //     // Create a light
        //     light.position.set(lightX, this.lightDistance, lightZ)
        //     light.lookAt(0, 0, 0)
        //     this.add(light);
        //     this.lights.push(light);
        //     // Visual helpers to indicate light positions
        //     this.add(new THREE.PointLightHelper(light, .5, 0xff9900));
        // }
        // // Creates the geometry + materials
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshPhongMaterial({ color: 0xff9900 });
        // let cube = new THREE.Mesh(geometry, material);
        // cube.position.y = .5;
        // // add to scene
        // this.add(cube);
        // // setup Debugger
        // if (debug) {
        //     this.debugger = new GUI();
        //     // Debug group with all lights in it.
        //     const lightGroup = this.debugger.addFolder("Lights");
        //     for (let i = 0; i < this.lights.length; i++) {
        //         lightGroup.add(this.lights[i], 'visible', true);
        //     }
        //     lightGroup.open();
        //     // Add the cube with some properties
        //     const cubeGroup = this.debugger.addFolder("Cube");
        //     cubeGroup.add(cube.position, 'x', -10, 10);
        //     cubeGroup.add(cube.position, 'y', .5, 10);
        //     cubeGroup.add(cube.position, 'z', -10, 10);
        //     cubeGroup.open();
        //     // Add camera to debugger
        //     const cameraGroup = this.debugger.addFolder('Camera');
        //     cameraGroup.add(this.camera, 'fov', 20, 80);
        //     cameraGroup.add(this.camera, 'zoom', 0, 1)
        //     cameraGroup.open();
        // }
    }

    animate() {
        //     requestAnimationFrame(animate);
        //     cube.rotation.x += Math.random() * 0.1;
        //     cube.rotation.y += Math.random() * 0.1;

        //     // this.renderer.render(this, this.camera);
        //     // camera.zoom -= 0.01;
        //     // camera.rotateZ(0.01);
        //     // camera.rotateY(0.01)
        if (this.controls) {
            this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        }

    };
    /**
     * Given a ThreeJS camera and renderer, resizes the scene if the
     * browser window is resized.
     * @param camera - a ThreeJS PerspectiveCamera object.
     * @param renderer - a subclass of a ThreeJS Renderer object.
     */
    static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            // uses the global window widths and height
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        // window.onkeydown = (ev: KeyboardEvent) => {
        //     console.log('key:', ev)
        //     if (ev.key === 'ArrowUp') {
        //         camera.position.y++;
        //     }
        //     else if (ev.key === 'ArrowDown') {
        //         camera.position.y--;
        //     }
        //     else if (ev.key === '+') {
        //         camera.zoom++;
        //     } else if (ev.key === '-') {
        //         camera.zoom--;
        //     }
        // };
    }

    async _loadMainEnvironmentModel() {
        return new Promise((res) => {
            let loader = new FBXLoader();
            loader.load('../assets/store.fbx', async (fbx) => {
                fbx.scale.setScalar(0.15)
                fbx.position.y = 0.4;
                this.add(fbx);
                await this.generateFloor();
                // this._mixer = new THREE.AnimationMixer(this._target);
                res(true);
            }, undefined, (error) => {
                console.error('err33:', error);
                res(false);
            });

        });
    }

    async generateFloor() {

        const WIDTH = 8000
        const LENGTH = 8000
        let tex = new THREE.TextureLoader().load("../assets/green-fake-grass-background.jpg")
        tex.anisotropy = 32
        tex.repeat.set(100, 100)
        tex.wrapT = THREE.RepeatWrapping
        tex.wrapS = THREE.RepeatWrapping


        // let loader = new FBXLoader()
        // loader.load('../assets/base_grass.fbx', (fbx) => {
        //     fbx.scale.setScalar(10);
        //     fbx.traverse(c => {
        //         c.castShadow = true;
        //         // if (c.isMesh) {

        //         //     // switch the material here - you'll need to take the settings from the 
        //         //     //original material, or create your own new settings, something like:
        //         //     const oldMat = c.material;

        //         //     c.material = new THREE.MeshLambertMaterial({
        //         //         color: oldMat.color,
        //         //         map: oldMat.map,
        //         //         //etc
        //         //     });

        //         // }
        //     })
        //     fbx.position.set(0, 0, 0)
        //     // fbx.rotation.set(Math.PI / -2, 0, 0)
        //     // this.add(fbx)
        // })
        // Floor
        let floorGeometry = new THREE.PlaneBufferGeometry(10000, 10000)// new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
        let floorMaterial = new THREE.MeshPhongMaterial({
            // color: 0xeeeeee,
            // shininess: 0,
            map: tex
        });

        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // floor.rotation.x = - Math.PI / 2
        // floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
        floor.receiveShadow = true;
        // floor.position.y = -11;
        floor.position.set(0, 0, 0)
        floor.rotation.set(Math.PI / -2, 0, 0)
        this.add(floor);
    }

    async _initLighting() {
        // let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
        // hemiLight.position.set(0, 50, 0);
        // // Add hemisphere light to scene
        // this.add(hemiLight);

        // let d = 8.25;
        // let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
        // dirLight.position.set(0, 0, 0);
        // dirLight.castShadow = true;
        // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        // dirLight.shadow.camera.near = 0.1;
        // dirLight.shadow.camera.far = 1500;
        // dirLight.shadow.camera.left = d * -1;
        // dirLight.shadow.camera.right = d;
        // dirLight.shadow.camera.top = d;
        // dirLight.shadow.camera.bottom = d * -1;
        // // Add directional Light to scene
        // this.add(dirLight);
        // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        // const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
        // hemiLight.position.set(0, 1000, 0);
        // this.add(hemiLight);

        const sun = new THREE.DirectionalLight(0xffffcc)
        sun.position.set(0, 1, 0)
        this.add(sun)



        // var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        // dirLight.position.set(-1, 0.75, 1);
        // dirLight.position.multiplyScalar(50);
        // dirLight.name = "dirlight";
        // dirLight.castShadow = true;

        // this.add(dirLight);


        var dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight1.position.set(25, 10, 25);
        dirLight1.position.multiplyScalar(50);
        dirLight1.name = "dirlight1";
        dirLight1.castShadow = true;

        this.add(dirLight1);


        // dirLight.shadowDarkness = 0.35;
        // const dirLight = new THREE.DirectionalLight(0xffffff);
        // dirLight.position.set(0, 200, 10);
        // this.add(dirLight);
    }

    async _initCamera() {
        // const scene = new THREE.Scene();
        // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        // camera.position.set(0, 0, 100);
        // camera.lookAt(0, 0, 0);
        // this.camera = new THREE.PerspectiveCamera(
        //     50,
        //     window.innerWidth / window.innerHeight,
        //     0.1,
        //     500
        // );
        // this.camera.zoom = 1;
        // this.camera.position.z = 30
        // this.camera.position.x = 0;
        // this.camera.position.y = -1;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(25, 19, 25);
        this.renderer.render(this, this.camera);
        // add window resizing
        BasicScene.addWindowResizing(this.camera, this.renderer);
        // =>controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.minZoom = 300;
        // this.controls.maxZoom = 1;
        // this.controls.maxDistance = 100;
        this.controls.listenToKeyEvents(window); // optional
        this.controls.addEventListener('change', (e) => {
            // console.log('control change', e, this.camera.position);
        })

        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;

        this.controls.screenSpacePanning = false;

        this.controls.minDistance = 1;
        this.controls.maxDistance = 400;

        this.controls.maxPolarAngle = Math.PI / 2;
    }
}