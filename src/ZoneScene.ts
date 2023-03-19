import * as THREE from 'three';
import { OrbitControls, MapControls } from './jsm/controls/OrbitControls.js';
import { GameCaptureKeyType, GameMode } from './types';

import { ZoneParserClass } from './ZoneParser';
import Stats from './jsm/libs/stats.module';
import { GameData } from './data';
import { CharParserClass } from './CharParser';
import { compareCameras } from './utils';

export class ZoneScene extends THREE.Scene {
    // Setups a scene camera
    camera: THREE.PerspectiveCamera = null;
    private _compareCamera: THREE.PerspectiveCamera = null;
    controls: OrbitControls;
    // setup renderer
    renderer: THREE.Renderer = null;
    width = window.innerWidth;
    height = window.innerHeight;
    mode: GameMode = 'view';
    modeHtmlElement: HTMLDivElement;
    zone: ZoneParserClass;
    char: CharParserClass;

    static GameCaptureKeys: { [k in GameCaptureKeyType]?: boolean } = {};


    /************************************** */
    /**
    * Initializes the scene by adding lights, and the geometry
    */
    initialize() {
        this._initWindowEvents();
        this.captureGlobalKeys();

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
        this.zone = new ZoneParserClass(this, GameData.zoneName, GameData.groundY);
        this.zone.init();
        // =>load char
        this.char = new CharParserClass(this, GameData.charName, GameData.groundY, GameData.saveStateInterval);


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

        if (this.char) {
            await this.char.animate();
        }

        this.modeHtmlElement.textContent = this.mode + ` (shift+${this.mode[0]})`;
        // =>detect changes of camera
        if (!compareCameras(this.camera, this._compareCamera)) {
            this.char.needSaveState();
        }
        this._compareCamera.copy(this.camera);

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
            else if (event.shiftKey && event.key == 'D') {
                this.mode = 'delete';
                if (this.zone) {
                    this.zone.setMode(this.mode);
                }
            }
            // console.log('mode:', this.mode)
        });

    }

    /************************************** */
    async _initCamera(debug = false) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 2, 1000)
        this.camera.position.set(25, 10, 25);
        // for sky
        // this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 3000000);
        // this.camera.position.set(-900, -200, -900);

        this.renderer.render(this, this.camera);
        // add window resizing
        this.addWindowResizing();
        this._compareCamera = this.camera.clone();

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

        this.controls.minDistance = 2;
        this.controls.maxDistance = 100;
        // this.controls.minZoom = 100;
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
        //     // console.log('key:', ev)
        //     if (ev.key === 'ArrowUp') {
        //         this.camera.position.y++;
        //     }
        //     else if (ev.key === 'ArrowDown') {
        //         this.camera.position.y--;
        //     }
        //     // else if (ev.key === '+') {
        //     //     camera.zoom++;
        //     // } else if (ev.key === '-') {
        //     //     camera.zoom--;
        //     // }
        // };
    }
    /************************************** */
    captureGlobalKeys() {
        window.addEventListener('keydown', (event) => {
            if (event.shiftKey || event.key === 'Shift') {
                ZoneScene.GameCaptureKeys.Shift = true;
            }
            if (event.ctrlKey || event.key === 'Ctrl') {
                ZoneScene.GameCaptureKeys.Ctrl = true;
            }
            if (event.altKey || event.key === 'Alt') {
                ZoneScene.GameCaptureKeys.Alt = true;
            }
            if (event.key) {
                switch (event.key.toLowerCase()) {
                    case 'x':
                        ZoneScene.GameCaptureKeys.X = true;
                        break;
                    case 'y':
                        ZoneScene.GameCaptureKeys.Y = true;
                        break;
                    case 'z':
                        ZoneScene.GameCaptureKeys.Z = true;
                        break;
                }
            }

        });

        window.addEventListener('keyup', (event) => {
            if (event.shiftKey || event.key === 'Shift') {
                ZoneScene.GameCaptureKeys.Shift = false;
            }
            if (event.ctrlKey || event.key === 'Ctrl') {
                ZoneScene.GameCaptureKeys.Ctrl = false;
            }
            if (event.altKey || event.key === 'Alt') {
                ZoneScene.GameCaptureKeys.Alt = false;
            }
            if (event.key) {
                switch (event.key.toLowerCase()) {
                    case 'x':
                        ZoneScene.GameCaptureKeys.X = false;
                        break;
                    case 'y':
                        ZoneScene.GameCaptureKeys.Y = false;
                        break;
                    case 'z':
                        ZoneScene.GameCaptureKeys.Z = false;
                        break;
                }
            }
        });
    }
}