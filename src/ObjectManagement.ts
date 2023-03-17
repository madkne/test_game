import { ZoneGlassObjectInfo, ZoneInfo, ZoneWallObjectInfo } from "./interfaces";
import * as THREE from 'three';
import { ZoneScene } from "./ZoneScene";
import { ZoneObjectInfoType, ZoneObjectType } from "./types";


export class ObjectManagement {
    protected scene: ZoneScene;
    protected _objects: any[] = [];
    protected _objectTypes: ZoneObjectType[] = ['wall', 'glass'];
    protected _objectTextures: string[] = ['dark_wall_stone.jpg', 'light_wall_stone.jpg', 'sand_ground.jpg'];
    /************************************** */
    constructor(scene: ZoneScene) {
        this.scene = scene;
    }

    /************************************** */
    updateZoneObjects(zone: ZoneInfo) {
        for (let i = 0; i < this.objects.length; i++) {
            // =>update name
            zone.objects[i].name = this.objects[i].name;
            // =>update position
            zone.objects[i].x = this.objects[i]['position'].x;
            zone.objects[i].y = this.objects[i]['position'].y;
            zone.objects[i].z = this.objects[i]['position'].z;
            // =>update rotation
            zone.objects[i].rotateX = this.objects[i]['rotation'].x;
            zone.objects[i].rotateY = this.objects[i]['rotation'].y;
            zone.objects[i].rotateZ = this.objects[i]['rotation'].z;
            // =>update scale
            zone.objects[i].scaleX = this.objects[i]['scale'].x;
            zone.objects[i].scaleY = this.objects[i]['scale'].y;
            zone.objects[i].scaleZ = this.objects[i]['scale'].z;
        }

        return zone;
    }
    /************************************** */
    generateObjectInfo(options: { x: number, y: number, z: number, type: ZoneObjectType; texture?: string; scaleX?: number; scaleY?: number; scaleZ?: number; }) {
        let info: ZoneObjectInfoType = {
            x: options.x,
            y: options.y,
            z: options.z,
            type: options.type,
            texture: options.texture,
            scaleX: options.scaleX ?? 1,
            scaleY: options.scaleY ?? 1,
            scaleZ: options.scaleZ ?? 1,
            name: this._generateName(),
        };
        // =>if create wall
        if (options.type === 'wall') {
            if (!info.texture) info.texture = 'light_wall_stone.jpg';
            if (!info.scaleZ) info.scaleZ = 1;
        }
        // =>if create glass
        else if (options.type === 'glass') {
            info.texture = undefined;
            if (!info.scaleZ) info.scaleZ = 1;
        }
        //TODO:

        return info;
    }
    /************************************** */
    async renderObject(info: ZoneObjectInfoType) {
        if (!info.name) info.name = this._generateName();
        // =>if wall type
        if (info.type === 'wall') {
            this._renderWall(info);
        }
        // =>if glass type
        else if (info.type === 'glass') {
            this._renderGlass(info);
        }
        //TODO:
    }
    /************************************** */
    generateObjectPlaceholder(zone: ZoneInfo, type: ZoneObjectType = 'wall') {
        let objPlaceholder;
        // =>if wall type
        if (type === 'wall' || type == 'glass') {
            const rollOverGeo = new THREE.BoxGeometry();
            let rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.3, transparent: true });
            objPlaceholder = new THREE.Mesh(rollOverGeo, rollOverMaterial);
            objPlaceholder.scale.set(zone.meta.ground.minScaler, zone.meta.ground.minScaler, 1);
        }

        //TODO:

        return objPlaceholder;
    }
    /************************************** */
    /************************************** */
    /************************************** */
    get objects() {
        return this._objects;
    }
    /************************************** */
    get objectTypes() {
        return this._objectTypes;
    }
    /************************************** */
    get objectTextures() {
        return this._objectTextures;
    }
    /************************************** */
    /************************************** */
    /************************************** */
    protected _renderWall(wall: ZoneWallObjectInfo) {
        const geometry = new THREE.BoxGeometry();
        let tex: THREE.Texture;
        if (wall.texture) {
            tex = new THREE.TextureLoader().load(ObjectManagement.texturePath(wall.texture));
            tex.anisotropy = 2
            tex.repeat.set(wall.scaleX / 2, wall.scaleY / 2)
            tex.wrapT = THREE.RepeatWrapping;
            tex.wrapS = THREE.RepeatWrapping;
        }
        const material = new THREE.MeshPhongMaterial({
            color: wall.color,
            map: tex,
            shininess: 1,
        });
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
        cube.name = wall.name ?? '';
        cube.geometry.computeBoundingBox();
        cube.updateMatrixWorld(true); // This might be necessary if box is moved
        this._objects.push(cube);
        this.scene.add(cube);
        // console.log(cube)

    }
    /************************************** */
    protected _renderGlass(glass: ZoneGlassObjectInfo) {
        const geometry = new THREE.BoxGeometry();
        let tex: THREE.Texture;
        const material = new THREE.MeshPhysicalMaterial({
            metalness: glass.metalness ?? 0.5,
            roughness: .05,
            envMapIntensity: 0.9,
            clearcoat: 1,
            transparent: true,
            // transmission: .95,
            opacity: .5,
            reflectivity: 0.2,
            // refractionRatio: 0.985,
            ior: 0.9,
            side: THREE.BackSide,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(glass.scaleX ?? 1, glass.scaleY ?? 1, glass.scaleZ ?? 1);
        cube.position.set(glass.x ?? 0, glass.y ?? 0, glass.z ?? 1);
        if (glass.rotateX) {
            cube.rotation.x = glass.rotateX;
        }
        if (glass.rotateY) {
            cube.rotation.y = glass.rotateY;
        }
        if (glass.rotateZ) {
            cube.rotation.z = glass.rotateZ;
        }
        cube.name = glass.name ?? '';
        cube.geometry.computeBoundingBox();
        cube.updateMatrixWorld(true); // This might be necessary if box is moved
        this._objects.push(cube);
        this.scene.add(cube);
        // console.log(cube)

    }
    /************************************** */
    private _generateName() {
        return 'obj_' + Math.ceil(Math.random() * 100000) + '_' + Math.ceil(Math.random() * 100);
    }
    /************************************** */
    /************************************** */
    /************************************** */
    static texturePath(filename: string) {
        return '../assets/textures/' + filename;
    }
}