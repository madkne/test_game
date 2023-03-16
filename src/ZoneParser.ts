
import { ZoneInfo, ZoneObjectInfo, ZoneWallObjectInfo } from './interfaces';
import * as THREE from 'three';
import { ZoneScene } from './ZoneScene';
import { Sky } from './jsm/objects/Sky.js';
import { GameMode } from './types';
import { checkPointInBox, getMouse3DPosition } from './utils';
import { TransformControls } from './jsm/controls/TransformControls.js';
import { GameGUI } from './gui';
import axios from 'axios';


export class ZoneParserClass {
    protected zone: ZoneInfo;
    protected scene: ZoneScene;
    protected mode: GameMode = 'view';
    protected objects: any[] = [];
    protected zoneName: string;

    protected transformControl: TransformControls;
    protected transformControlObject;
    protected transformControlObjectIndex = -1;
    protected editingObject = false;
    protected gui: GameGUI;
    protected pointer: { x: number, y: number } = { x: 0, y: 0 };
    protected raycaster: THREE.Raycaster;
    protected canSelectObject: any;
    protected canSelectObjectIndex: number;
    /************************************** */
    constructor(scene: ZoneScene, zoneName = 'zone0') {
        this.scene = scene;
        this.zoneName = zoneName;
    }
    /************************************** */
    async init() {
        this.gui = new GameGUI();
        this.raycaster = new THREE.Raycaster();
        await this.fetchZoneInfo();
        console.log('zone:', this.zone)
        this._initTransformControl();
        this.initGround();
        this.initSky();
        this.initObjects();
        this.initEvents();
    }
    /************************************** */
    setMode(mode: GameMode) {
        // =>if same as prev mode
        if (this.mode === mode) return;
        this.mode = mode;
        // =>remove edit mode fields
        this.gui.removeElementsByGroup('edit_mode');

        // =>if edit mode
        if (this.mode === 'edit') {
            // =>create search input
            this.gui.addInput('obj_search_input', 'select object by name ...').position({ top: '10px', 'left': '10px' }).setGroup('edit_mode').enterKeyEvent(() => {
                for (let i = 0; i < this.objects.length; i++) {
                    if (this.objects[i].name === this.gui.findById('obj_search_input').element<HTMLInputElement>().value) {
                        this._selectObjectByIndex(i);
                    }
                }
            }).focus();
            // =>create save button
            this.gui.addButton('obj_save_button', 'save changes').setGroup('edit_mode').position({ top: '40px', left: '10px' }).clickEvent(() => {
                this._saveZone();
            })

        }
    }
    /************************************** */
    async animate() {
        // =>if edit mode, hover an object
        if (this.mode === 'edit' && !this.editingObject) {
            // find intersections

            this.raycaster.setFromCamera(this.pointer, this.scene.camera);

            const intersects = this.raycaster.intersectObjects(this.objects, false);
            // console.log('intersects', intersects)
            if (intersects.length > 0) {
                if (this.canSelectObject != intersects[0].object) {

                    if (this.canSelectObject) {
                        this.canSelectObject.material.color.setHex(this.canSelectObject.currentHex);
                    }

                    this.canSelectObject = intersects[0].object;
                    // =>find index
                    this.canSelectObjectIndex = this.objects.findIndex(i => i.name === intersects[0].object.name);
                    this.canSelectObject.currentHex = this.canSelectObject.material.color.getHex();
                    this.canSelectObject.material.color.setHex(0xff0000);
                }

            } else {

                if (this.canSelectObject) this.canSelectObject.material.color.setHex(this.canSelectObject.currentHex);

                this.canSelectObject = undefined;

            }
        }
    }
    /************************************** */
    /************************************** */
    /************************************** */
    protected initEvents() {
        // =>lsiten on global mouse move
        window.addEventListener('mousemove', (e) => {
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
        });
        // =>listen on global mouse down
        window.addEventListener('mousedown', (e) => {
            // =>if edit mode, select an object
            if (this.mode === 'edit' && !this.editingObject && this.canSelectObject) {
                this._selectObjectByIndex(this.canSelectObjectIndex);
            }
            // =>if cancel editing object
            if (this.mode === 'edit' && this.editingObject && e.button === 2) {
                // =>save changes of object
                this.objects[this.transformControlObjectIndex].geometry.computeBoundingBox();
                this.objects[this.transformControlObjectIndex].updateMatrixWorld(true);
                // =>remove selected object
                this.transformControl.detach();
                this.transformControlObject = undefined;
                this.editingObject = false;
                this.scene.controls.enableRotate = true;

            }
        });

    }
    /************************************** */
    protected initGround() {
        let groundInfo = this.zone.meta.ground;
        let tex = new THREE.TextureLoader().load(this._texturePath(groundInfo.texture));
        tex.anisotropy = 32
        tex.repeat.set(100, 100)
        tex.wrapT = THREE.RepeatWrapping;
        tex.wrapS = THREE.RepeatWrapping;
        // Floor
        let floorGeometry = new THREE.PlaneBufferGeometry(groundInfo.width, groundInfo.height, 512, 512);
        let floorMaterial = new THREE.MeshPhongMaterial({
            // color: 0xeeeeee,
            // shininess: 0,
            map: tex
        });

        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        // floor.position.y = -11;
        // floor.position.set(0, 0, 0)
        floor.position.set(0, -5, 0)
        floor.rotation.set(Math.PI / -2, 0, 0)
        this.scene.add(floor);
    }
    /************************************** */
    protected initSky() {
        let skyInfo = this.zone.meta.sky;
        let groundInfo = this.zone.meta.ground;
        const sky = new Sky();
        const sun = new THREE.Vector3();
        sky.scale.setScalar(10000);
        this.scene.add(sky);

        const skyUniforms = sky.material['uniforms'];

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const parameters = {
            elevation: 2,
            azimuth: 180
        };

        const pmremGenerator = new THREE.PMREMGenerator(this.scene.renderer as any);
        let renderTarget;

        const sunLight = new THREE.DirectionalLight(0xffffcc)
        sunLight.position.set(0, 1, 0)
        this.scene.add(sunLight);

        const updateSun = () => {

            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            sky.material['uniforms']['sunPosition'].value.copy(sun);
            // water.material.uniforms['sunDirection'].value.copy(sun).normalize();

            if (renderTarget !== undefined) renderTarget.dispose();

            renderTarget = pmremGenerator.fromScene(sky as any);

            this.scene.environment = renderTarget.texture;

        }

        updateSun();


    }
    /************************************** */
    protected initObjects() {
        for (const obj of this.zone.objects) {
            // =>if wall type
            if (obj.type === 'wall') {
                this._renderWall(obj);
            }
        }
    }
    /************************************** */
    protected async fetchZoneInfo() {
        let res = await axios.get('/api/zone?zone=' + this.zoneName);
        if (res.status === 200) {
            // console.log(res)
            this.zone = res.data;
        }
    }
    /************************************** */
    /************************************** */
    /************************************** */
    private _texturePath(filename: string) {
        return '../assets/textures/' + filename;
    }
    /************************************** */
    private _renderWall(wall: ZoneWallObjectInfo) {
        const geometry = new THREE.BoxGeometry();
        let tex: THREE.Texture;
        if (wall.texture) {
            tex = new THREE.TextureLoader().load(this._texturePath(wall.texture));
            tex.anisotropy = 32
            tex.repeat.set(100, 100)
            tex.wrapT = THREE.RepeatWrapping;
            tex.wrapS = THREE.RepeatWrapping;
        }
        const material = new THREE.MeshBasicMaterial({ color: wall.color, map: tex });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(wall.scaleX ?? 1, wall.scaleY ?? 1, wall.scaleZ ?? 1);
        cube.position.set(wall.x ?? 0, wall.y ?? 0, wall.z ?? 1);
        if (wall.rotateX) {
            cube.rotation.x = wall.rotateX;
        }
        if (wall.rotateY) {
            cube.rotation.y = wall.rotateY;
        }
        if (wall.rotateZ) {
            cube.rotation.z = wall.rotateZ;
        }
        cube.name = wall.name ?? 'obj_' + Math.ceil(Math.random() * 10000);
        cube.geometry.computeBoundingBox();
        cube.updateMatrixWorld(true); // This might be necessary if box is moved
        this.objects.push(cube);
        this.scene.add(cube);
        // console.log(cube)

    }
    /************************************** */
    private _initTransformControl() {
        this.transformControl = new TransformControls(this.scene.camera, this.scene.renderer.domElement);
        this.transformControl.addEventListener('change', (e) => {
            // console.log('transform info:', this.transformControlObject?.position, this.transformControlObject?.rotation)
        });

        this.scene.add(this.transformControl);

        window.addEventListener('keydown', (event) => {
            if (this.mode !== 'edit') return;
            switch (event.keyCode) {

                case 81: // Q
                    this.transformControl.setSpace(this.transformControl.space === 'local' ? 'world' : 'local');
                    break;

                case 16: // Shift
                    this.transformControl.setTranslationSnap(100);
                    this.transformControl.setRotationSnap(THREE.MathUtils.degToRad(15));
                    this.transformControl.setScaleSnap(0.25);
                    break;

                case 87: // W
                    this.transformControl.setMode('translate');
                    break;

                case 69: // E
                    this.transformControl.setMode('rotate');
                    break;

                case 82: // R
                    this.transformControl.setMode('scale');
                    break;



                case 187:
                case 107: // +, =, num+
                    this.transformControl.setSize(this.transformControl.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
                    break;

                case 88: // X
                    this.transformControl['showX'] = !this.transformControl['showX'];
                    break;

                case 89: // Y
                    this.transformControl['showY'] = !this.transformControl['showY'];
                    break;

                case 90: // Z
                    this.transformControl['showZ'] = !this.transformControl['showZ'];
                    break;

                case 32: // Spacebar
                    this.transformControl['enabled'] = !this.transformControl['enabled'];
                    break;

                case 27: // Esc
                    this.transformControl.reset();
                    break;

            }

        });

        window.addEventListener('keyup', (event) => {

            switch (event.keyCode) {

                case 16: // Shift
                    this.transformControl.setTranslationSnap(null);
                    this.transformControl.setRotationSnap(null);
                    this.transformControl.setScaleSnap(null);
                    break;
            }
        });
    }
    /************************************** */
    private _selectObjectByIndex(index: number) {
        let obj = this.objects[index];
        this.transformControlObject = obj;
        this.transformControl.attach(obj);
        this.transformControlObjectIndex = index;
        this.editingObject = true;
        this.scene.controls.enableRotate = false;
        if (this.canSelectObject) {
            this.canSelectObject.material.color.setHex(this.canSelectObject.currentHex);
            this.canSelectObjectIndex = undefined;
            this.canSelectObject = undefined;
        }
    }
    /************************************** */
    private async _saveZone() {
        for (let i = 0; i < this.objects.length; i++) {
            // =>update name
            this.zone.objects[i].name = this.objects[i].name;
            // =>update position
            this.zone.objects[i].x = this.objects[i]['position'].x;
            this.zone.objects[i].y = this.objects[i]['position'].y;
            this.zone.objects[i].z = this.objects[i]['position'].z;
            // =>update rotation
            this.zone.objects[i].rotateX = this.objects[i]['rotation'].x;
            this.zone.objects[i].rotateY = this.objects[i]['rotation'].y;
            this.zone.objects[i].rotateZ = this.objects[i]['rotation'].z;
            // =>update scale
            this.zone.objects[i].scaleX = this.objects[i]['scale'].x;
            this.zone.objects[i].scaleY = this.objects[i]['scale'].y;
            this.zone.objects[i].scaleZ = this.objects[i]['scale'].z;
        }
        //         console.log(`import { ZoneInfo } from "../interfaces";

        // export const zone: ZoneInfo = `+ JSON.stringify(this.zone, null, 2));

        let res = await axios.put('/api/zone', {
            name: this.zoneName,
            zone: this.zone,
        });
    }
}