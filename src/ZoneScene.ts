import * as THREE from 'three';
import { OrbitControls, MapControls } from './jsm/controls/OrbitControls.js';
import { GameMode } from './types.js';

import { ZoneParserClass } from './ZoneParser';
import Stats from './jsm/libs/stats.module';

export class ZoneScene extends THREE.Scene {
    // Setups a scene camera
    camera: THREE.PerspectiveCamera = null;
    controls: OrbitControls;
    // setup renderer
    renderer: THREE.Renderer = null;
    width = window.innerWidth;
    height = window.innerHeight;
    mode: GameMode = 'view';
    modeHtmlElement: HTMLDivElement;
    zone: ZoneParserClass;



    /************************************** */
    /**
    * Initializes the scene by adding lights, and the geometry
    */
    initialize() {
        this._initWindowEvents();

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("app") as HTMLCanvasElement,
            alpha: true,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        // =>camera
        this._initCamera();
        // lights
        // this._initLighting();

        this.animate();
        // =>load zone
        this.zone = new ZoneParserClass(this);
        this.zone.init();

        let stats = Stats();
        stats.dom.style.left = 'unset';
        stats.dom.style.right = '0';
        document.body.appendChild(stats.dom);
    }
    /************************************** */
    async animate() {
        if (this.controls) {
            this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        }
        // =>update mode display
        if (!this.modeHtmlElement) {
            this.modeHtmlElement = document.createElement("div");
            this.modeHtmlElement.style.color = 'blue';
            this.modeHtmlElement.style.fontSize = '40px';
            this.modeHtmlElement.style.fontWeight = '800';
            this.modeHtmlElement.style.position = 'fixed';
            this.modeHtmlElement.style.pointerEvents = 'none';
            this.modeHtmlElement.style.top = `${window.innerHeight - 100}px`;
            this.modeHtmlElement.style.left = `${100}px`;
            document.body.append(this.modeHtmlElement);
        }
        if (this.zone) {
            await this.zone.animate();
        }

        this.modeHtmlElement.textContent = this.mode + ` (shift+${this.mode[0]})`;

    }
    /************************************** */
    private _initWindowEvents() {
        // =>listen on global shortcuts
        window.addEventListener('keydown', (event) => {
            // console.log(event)

            if (event.shiftKey && event.key == 'E') {
                this.mode = 'edit';
                if (this.zone) {
                    this.zone.setMode(this.mode);
                }
            } else if (event.shiftKey && event.key == 'V') {
                this.mode = 'view';
                if (this.zone) {
                    this.zone.setMode(this.mode);
                }
            }
            else if (event.shiftKey && event.key == 'C') {
                this.mode = 'create';
                if (this.zone) {
                    this.zone.setMode(this.mode);
                }
            }
            // console.log('mode:', this.mode)
        });

    }
    /************************************** */
    async _initLighting() {

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


    }
    /************************************** */
    async _initCamera(debug = false) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
        this.camera.position.set(25, 200, 25);
        // for sky
        // this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 3000000);
        // this.camera.position.set(-900, -200, -900);

        this.renderer.render(this, this.camera);
        // add window resizing
        this.addWindowResizing();
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
        // var centerPosition = this.controls.target.clone();
        // centerPosition.y = 0;
        // var groundPosition = this.camera.position.clone();
        // groundPosition.y = 0;
        // var d = (centerPosition.distanceTo(groundPosition));

        // var origin = new THREE.Vector2(this.controls.target.y, 0);
        // var remote = new THREE.Vector2(0, d); // replace 0 with raycasted ground altitude
        // var angleRadians = Math.atan2(remote.y - origin.y, remote.x - origin.x);
        // this.controls.maxPolarAngle = angleRadians;



    }
    /************************************** */

    addWindowResizing() {
        window.addEventListener('resize', () => {
            // uses the global window widths and height
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
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
}