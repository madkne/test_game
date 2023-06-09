
import { ZoneInfo, ZoneObjectInfo, ZoneWallObjectInfo } from './interfaces';
import * as THREE from 'three';
import { ZoneScene } from './ZoneScene';
import { Sky } from './jsm/objects/Sky.js';
import { GameMode, ZoneObjectType } from './types';
import { checkPointInBox, getMouse3DPosition } from './utils';
import { TransformControls } from './jsm/controls/TransformControls.js';
import { GameGUI } from './gui';
import axios from 'axios';
import { ObjectManagement } from './ObjectManagement';
import { BoxGeometry, MeshBasicMaterial } from 'three';


export class ZoneParserClass {
    protected zone: ZoneInfo;
    protected scene: ZoneScene;
    protected mode: GameMode = 'view';
    protected zoneName: string;
    protected objManage: ObjectManagement;
    protected gridHelper: THREE.GridHelper;
    protected groundY: number;
    protected squareMeterLength: number;

    protected transformControl: TransformControls;
    protected transformControlObject;
    protected transformControlObjectIndex = -1;
    protected editingObject = false;
    protected creatingObject = false;
    protected gui: GameGUI;
    protected pointer: THREE.Vector2;
    protected raycaster: THREE.Raycaster;
    protected mouseRaycaster: THREE.Raycaster;
    protected canSelectObject: any;
    protected canSelectObjectIndex: number;
    protected floor: THREE.Mesh;
    protected createObjectPlaceholder: THREE.Mesh;
    /************************************** */
    constructor(scene: ZoneScene, zoneName = 'zone0', groundY = -5) {
        this.scene = scene;
        this.zoneName = zoneName;
        this.objManage = new ObjectManagement(this.scene);
        this.groundY = groundY;
    }
    /************************************** */
    async init() {
        this.gui = new GameGUI();
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        await this.fetchZoneInfo();
        // =>calc squareMeterLength
        this.squareMeterLength = Number((this.zone.meta.ground.width / this.zone.meta.ground.height).toFixed(1));
        console.log('zone:', this.zone, this.squareMeterLength)
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
        this._resetSelectedObject();
        // =>remove create mode fields
        this.gui.removeElementsByGroup('create_mode');
        // =>enable camera zoom
        this.scene.controls.enableZoom = true;

        // =>disable grid
        if (this.gridHelper) {
            this.gridHelper.removeFromParent();
        }
        this.mouseRaycaster = new THREE.Raycaster();

        // =>if edit mode
        if (this.mode === 'edit') {
            // =>create search input
            this.gui.addTextInput('obj_search_input', 'select object by name ...').position({ top: '10px', 'left': '10px' }).setGroup('edit_mode').enterKeyEvent(() => {
                for (let i = 0; i < this.objManage.objects.length; i++) {
                    if (this.objManage.objects[i].name === this.gui.findById('obj_search_input').value()) {
                        this._selectObjectByIndex(i);
                    }
                }
            }).focus();
            // =>create save button
            this.gui.addButton('obj_save_button', 'save changes').setGroup('edit_mode').position({ top: '40px', left: '10px' }).clickEvent(() => {
                this._saveZone();
            })
        }
        // =>if create mode
        else if (this.mode === 'create') {
            // =>disable camera zoom
            this.scene.controls.enableZoom = false;
            // =>create type select
            this.gui.addSelect('obj_type_select', this.objManage.objectNames, 'select object ').position({ top: '10px', 'left': '10px' }).setGroup('create_mode');
            // =>create type select
            this.gui.addCheckbox('multi_obj_create_check', 'can create multiple objects', true).position({ top: '30px', 'left': '10px' }).setGroup('create_mode');
            // =>create create button
            this.gui.addButton('obj_create_button', 'create object').setGroup('create_mode').position({ top: '80px', left: '10px' }).clickEvent(() => {
                this.creatingObject = true;
            });
            // =>enable grid
            this.gridHelper = new THREE.GridHelper(this.zone.meta.ground.width, this.zone.meta.ground.width / this.squareMeterLength, 'red', 'blue');
            this.gridHelper.position.setY(this.groundY);
            this.scene.add(this.gridHelper);
        }
    }
    /************************************** */
    async animate() {
        // =>if edit /delete mode, hover an object
        if ((this.mode === 'edit' || this.mode === 'delete') && !this.editingObject) {
            // find intersections

            this.raycaster.setFromCamera(this.pointer, this.scene.camera);

            const intersects = this.raycaster.intersectObjects(this.objManage.objects, false);
            // console.log('intersects', intersects)
            if (intersects.length > 0) {
                if (this.canSelectObject != intersects[0].object) {

                    if (this.canSelectObject) {
                        this.canSelectObject.material.color.setHex(this.canSelectObject.currentHex);
                    }

                    this.canSelectObject = intersects[0].object;
                    // =>find index
                    this.canSelectObjectIndex = this.objManage.objects.findIndex(i => i.name === intersects[0].object.name);
                    this.canSelectObject.currentHex = this.canSelectObject.material.color.getHex();
                    this.canSelectObject.material.color.setHex(0xff0000);
                }

            } else {
                this._resetSelectedObject();
            }
        }
    }
    /************************************** */
    /************************************** */
    /************************************** */
    protected initEvents() {
        // =>lsiten on global mouse move
        window.addEventListener('mousemove', (e) => {
            this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, - (e.clientY / window.innerHeight) * 2 + 1);

            // =>if creating a object
            if (this.mode === 'create' && this.creatingObject) {
                if (!this.createObjectPlaceholder) {
                    this.createObjectPlaceholder = this.objManage.generateObjectPlaceholder(this.zone, this.gui.findById('obj_type_select').value());
                    if (!this.createObjectPlaceholder) return;
                    this.scene.add(this.createObjectPlaceholder);
                }


                this.mouseRaycaster.setFromCamera(this.pointer, this.scene.camera);

                const intersects = this.mouseRaycaster.intersectObjects([this.floor, ...this.objManage.objects], false);

                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    this.createObjectPlaceholder.position.copy(intersect.point).add(intersect.face.normal);
                    this.createObjectPlaceholder.position.divideScalar(this.squareMeterLength).floor().multiplyScalar(this.squareMeterLength)//.addScalar(this.squareMeterLength);

                    this.scene.renderer.render(this.scene, this.scene.camera);
                }
            }
        });
        // =>listen on global mouse down
        window.addEventListener('mousedown', (e) => {
            // =>if edit mode, select an object
            if (this.mode === 'edit' && !this.editingObject && this.canSelectObject) {
                this._selectObjectByIndex(this.canSelectObjectIndex);
            }
            // =>if cancel editing object
            else if (this.mode === 'edit' && this.editingObject && e.button === 2) {
                // =>save changes of object
                this.objManage.objects[this.transformControlObjectIndex].geometry.computeBoundingBox();
                this.objManage.objects[this.transformControlObjectIndex].updateMatrixWorld(true);
                // =>remove selected object
                this.transformControl.detach();
                this.transformControlObject = undefined;
                this.editingObject = false;
                this.scene.controls.enableRotate = true;
            }
            // =>if delete mode, select an object
            if (this.mode === 'delete' && this.canSelectObject && e.button === 0) {
                this._deleteObjectByIndex(this.canSelectObjectIndex);
            }
            // =>if cancel delete mode
            if (this.mode === 'delete' && this.canSelectObject && e.button === 2) {
                this._resetSelectedObject();
            }
            // =>if create mode to create a object
            else if (this.mode === 'create' && this.creatingObject && e.button === 0) {
                this.mouseRaycaster.setFromCamera(this.pointer, this.scene.camera);

                const intersects = this.mouseRaycaster.intersectObjects([this.floor, ...this.objManage.objects], false);

                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    console.log('intersects', intersects)
                    // =>create sample object to find correct position
                    const newObjectSample = new THREE.Mesh(new BoxGeometry(), new MeshBasicMaterial());
                    newObjectSample.position.copy(intersect.point).add(intersect.face.normal);
                    newObjectSample.position.divideScalar(this.squareMeterLength).floor().multiplyScalar(this.squareMeterLength)//.addScalar(this.squareMeterLength);
                    // =>create new object
                    this._createObject(newObjectSample.position.x, newObjectSample.position.y, newObjectSample.position.z);
                }
            }
            // =>if cancel creating object
            else if (this.mode === 'create' && this.creatingObject && e.button === 2) {
                if (this.createObjectPlaceholder) {
                    this.createObjectPlaceholder.removeFromParent();
                    this.createObjectPlaceholder = undefined;
                }
                this.creatingObject = false;
            }
        });

        // =>listen on global mouse wheel
        window.addEventListener('wheel', (event) => {
            // =>if creating a object
            if (this.mode === 'create' && this.creatingObject && this.createObjectPlaceholder) {
                let rotationValue = ZoneScene.GameCaptureKeys.Shift ? 0.1 : 0.001;
                // console.log(rotationValue)
                // =>rotate in x-axis
                if (ZoneScene.GameCaptureKeys.X) {
                    this.createObjectPlaceholder.rotation.x += event.deltaY * rotationValue;
                }
                // =>rotate in y-axis
                if (ZoneScene.GameCaptureKeys.Y) {
                    this.createObjectPlaceholder.rotation.y += event.deltaY * rotationValue;
                }
                // =>rotate in z-axis
                if (ZoneScene.GameCaptureKeys.Z) {
                    this.createObjectPlaceholder.rotation.z += event.deltaY * rotationValue;
                }
                // console.log('wheel', event)
            }
        });
        // 
    }
    /************************************** */
    protected initGround() {
        let groundInfo = this.zone.meta.ground;
        let tex = new THREE.TextureLoader().load(ObjectManagement.texturePath(groundInfo.texture));
        tex.anisotropy = 32
        tex.repeat.set(512, 512)
        tex.wrapT = THREE.RepeatWrapping;
        tex.wrapS = THREE.RepeatWrapping;
        // Floor
        let floorGeometry = new THREE.PlaneBufferGeometry(groundInfo.width, groundInfo.height, 512, 512);
        let floorMaterial = new THREE.MeshPhongMaterial({
            // color: 0xeeeeee,
            // shininess: 0,
            map: tex
        });

        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.receiveShadow = true;
        // floor.position.y = -11;
        // floor.position.set(0, 0, 0)
        this.floor.position.set(0, this.groundY, 0)
        this.floor.rotation.set(Math.PI / -2, 0, 0)
        this.scene.add(this.floor);
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
            azimuth: 90
        };

        const pmremGenerator = new THREE.PMREMGenerator(this.scene.renderer as any);
        let renderTarget;

        // const sunLight = new THREE.DirectionalLight(0xffffcc)
        // sunLight.position.set(0, 1, 0)
        // this.scene.add(sunLight);


        // const sunLight = new THREE.DirectionalLight(0xaabbff, 0.3);
        const sunLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.01);
        // sunLight['power'] = 3500 // 3500 lm (300W)
        sunLight.intensity = 1.0; // (City Twilight)
        sunLight.castShadow = true;
        this.scene.add(sunLight);
        // this.scene.camera.add(sunLight);


        const updateSun = () => {

            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            sunLight.position.x = sun.x;
            sunLight.position.y = sun.y;
            sunLight.position.z = sun.z;
            // sunMesh.position.set(sunLight.position.x, sunLight.position.y, sunLight.position.z);

            sky.material['uniforms']['sunPosition'].value.copy(sun);
            // water.material.uniforms['sunDirection'].value.copy(sun).normalize();

            if (renderTarget !== undefined) renderTarget.dispose();

            renderTarget = pmremGenerator.fromScene(sky as any);

            this.scene.environment = renderTarget.texture;

        }
        updateSun();
        // setInterval(() => {
        //     parameters.azimuth--;
        //     updateSun();
        // }, 300)


    }
    /************************************** */
    protected async initObjects() {
        for (const obj of this.zone.objects) {
            await this.objManage.renderObject(obj);
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
    private _initTransformControl() {
        this.transformControl = new TransformControls(this.scene.camera, this.scene.renderer.domElement);
        this.transformControl.addEventListener('change', (e) => {
            // console.log('transform info:', this.transformControlObject?.position, this.transformControlObject?.rotation)
        });

        this.scene.add(this.transformControl);

        window.addEventListener('keydown', (event) => {
            if (this.mode !== 'edit') return;
            switch (event.key.toLowerCase()) {

                case 'q': // Q
                    this.transformControl.setSpace(this.transformControl.space === 'local' ? 'world' : 'local');
                    break;

                case 'n': // snap
                    this.transformControl.setTranslationSnap(this.squareMeterLength);
                    this.transformControl.setRotationSnap(THREE.MathUtils.degToRad(15));
                    this.transformControl.setScaleSnap(this.squareMeterLength);
                    break;

                case 't': // translate
                    this.transformControl.setMode('translate');
                    break;

                case 'r': // rotate
                    this.transformControl.setMode('rotate');
                    break;

                case 's': // scale
                    this.transformControl.setMode('scale');
                    break;



                case '+': // increase size of control
                    this.transformControl.setSize(this.transformControl.size + 0.1);
                    break;

                case '-': // decrease size of control
                    this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
                    break;



                // case 32: // Spacebar
                //     this.transformControl['enabled'] = !this.transformControl['enabled'];
                //     break;

                // case 27: // Esc
                //     this.transformControl.reset();
                //     break;

            }

        });

        window.addEventListener('keyup', (event) => {

            switch (event.key.toLowerCase()) {

                case 'n': // snap
                    this.transformControl.setTranslationSnap(null);
                    this.transformControl.setRotationSnap(null);
                    this.transformControl.setScaleSnap(null);
                    break;
            }
        });
    }
    /************************************** */
    private _selectObjectByIndex(index: number) {
        let obj = this.objManage.objects[index];
        this.transformControlObject = obj;
        this.transformControl.attach(obj);
        this.transformControlObjectIndex = index;
        this.editingObject = true;
        this.scene.controls.enableRotate = false;
        this._resetSelectedObject();
    }
    /************************************** */
    private async _deleteObjectByIndex(index: number) {
        let obj = this.objManage.objects[index];
        if (await confirm(`Are you sure to delete '${obj.name}' object?`)) {
            this.objManage.removeObjectByIndex(index);
            // =>remove object from zone
            let objIndex = this.zone.objects.findIndex(i => i.name === obj.name);
            if (objIndex > -1) {
                this.zone.objects.splice(objIndex, 1);
            }
            this._saveZone();
        }
        this._resetSelectedObject();
    }
    /************************************** */
    private _resetSelectedObject() {
        if (this.canSelectObject) {
            this.canSelectObject.material.color.setHex(this.canSelectObject.currentHex);
        }

        this.canSelectObject = undefined;
        this.canSelectObjectIndex = undefined;
        this.mouseRaycaster = new THREE.Raycaster();
    }
    /************************************** */
    private async _saveZone() {
        this.zone = this.objManage.updateZoneObjects(this.zone);
        //         console.log(`import { ZoneInfo } from "../interfaces";

        // export const zone: ZoneInfo = `+ JSON.stringify(this.zone, null, 2));

        let res = await axios.put('/api/zone', {
            name: this.zoneName,
            zone: this.zone,
        });
    }
    /************************************** */
    private async _createObject(x = 0, y = 0, z = 0) {

        // =>get values of fields
        let values = this.gui.getFieldValuesByGroup('create_mode');
        console.log('values:', values);
        // =>get info of new object
        let objInfo = this.objManage.generateObjectInfo({
            x,
            y,
            z,
            objectName: values['obj_type_select'] ?? undefined,
            texture: values['obj_texture_select'] ?? undefined,
            scaleX: this.createObjectPlaceholder.scale.x,
            scaleY: this.createObjectPlaceholder.scale.y,
            scaleZ: this.createObjectPlaceholder.scale.z,
            rotateX: this.createObjectPlaceholder.rotation.x,
            rotateY: this.createObjectPlaceholder.rotation.y,
            rotateZ: this.createObjectPlaceholder.rotation.z,
        });
        // =>if stop create object enabled
        if (!values['multi_obj_create_check']) {
            if (this.createObjectPlaceholder) {
                this.createObjectPlaceholder.removeFromParent();
                this.createObjectPlaceholder = undefined;
            }
            this.creatingObject = false;
        }
        // =>add to zone objects
        this.zone.objects.push(objInfo);
        // =>render object
        await this.objManage.renderObject(objInfo);

        await this._saveZone();


    }
}