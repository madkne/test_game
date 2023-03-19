import { ZoneGlassObjectInfo, ZoneInfo, ZoneWallObjectInfo } from "./interfaces";
import * as THREE from 'three';
import { ZoneScene } from "./ZoneScene";
import { ZoneObjectInfoType, ZoneObjectType } from "./types";
import { stone_wall_v1 } from "./objects/stone_wall_v1";
import { BaseObject } from "./objects/BaseObject";
import { std_stone_wall } from "./objects/std_stone_wall";
import { glass } from "./objects/glass";


export class ObjectManagement {
    protected scene: ZoneScene;
    protected _objects: any[] = [];
    protected _objectNames: { text: string; value: string }[] = [];
    protected _objectClasses = [stone_wall_v1, std_stone_wall, glass];
    /************************************** */
    constructor(scene: ZoneScene) {
        this.scene = scene;
        // =>init object names
        for (const obj of this._objectClasses) {
            this._objectNames.push({
                text: obj.prototype.title,
                value: obj.prototype['constructor']['name']
            });
            // console.log(obj.prototype.title)
        }
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
    generateObjectInfo(options: { x: number, y: number, z: number, objectName: string; texture?: string; scaleX?: number; scaleY?: number; scaleZ?: number; rotateX?: number; rotateY?: number; rotateZ?: number; }) {
        // =>check if obj name is empty
        if (!options.objectName) {
            options.objectName = this._objectNames[0].value;
        }
        // =>find target object class
        let objectClass = this._objectClasses[this.objectNames.findIndex(i => i.value === options.objectName)] as (typeof BaseObject);

        let info: ZoneObjectInfoType = {
            objectName: options.objectName,
            x: options.x,
            y: options.y,
            z: options.z,
            type: objectClass.prototype.type,
            texture: options.texture,
            scaleX: options.scaleX ?? 1,
            scaleY: options.scaleY ?? 1,
            scaleZ: options.scaleZ ?? 1,
            rotateX: options.rotateX ?? 0,
            rotateY: options.rotateY ?? 0,
            rotateZ: options.rotateZ ?? 0,
            name: this._generateName(),
        };
        let instance = new (objectClass as any)() as BaseObject;
        info = instance.generateObjectInfo(info);
        // // =>if create wall
        // if (options.type === 'wall') {
        //     if (!info.texture) info.texture = 'light_wall_stone.jpg';
        //     if (!info.scaleZ) info.scaleZ = 1;
        // }
        // // =>if create glass
        // else if (options.type === 'glass') {
        //     info.texture = undefined;
        //     if (!info.scaleZ) info.scaleZ = 1;
        // }
        // // =>if create floor
        // if (options.type === 'floor') {
        //     if (!info.texture) info.texture = 'parquet1.jpg';
        //     if (!info.scaleZ) info.scaleZ = 1;
        // }

        return info;
    }
    /************************************** */
    async renderObject(info: ZoneObjectInfoType) {
        if (!info.name) info.name = this._generateName();
        // =>find target object class
        let objectClass = this._findObjectClassByName(info.objectName);
        if (!objectClass) {
            console.warn('can not find object class for render', info);
            return;
        }
        let instance = new (objectClass as any)() as BaseObject;
        let object = await instance.renderObject(info);
        this._objects.push(object);
        this.scene.add(object);
    }
    /************************************** */
    generateObjectPlaceholder(zone: ZoneInfo, objectName: string) {
        // =>find target object class
        let objectClass = this._findObjectClassByName(objectName);
        if (!objectClass) {
            console.warn('can not find object class for placeholder', objectName);
            return undefined;
        }
        let instance = new (objectClass as any)() as BaseObject;
        let objPlaceholder = instance.generateObjectPlaceholder(zone, objectName);
        return objPlaceholder;
    }
    /************************************** */
    removeObjectByIndex(index: number) {
        if (this._objects.length < index + 1) return;
        this._objects[index].removeFromParent();
        this._objects.splice(index, 1);
    }
    /************************************** */
    /************************************** */
    /************************************** */
    get objects() {
        return this._objects;
    }
    /************************************** */
    get objectNames() {
        return this._objectNames;
    }
    /************************************** */
    /************************************** */
    /************************************** */


    /************************************** */
    private _generateName() {
        return 'obj_' + Math.ceil(Math.random() * 100000) + '_' + Math.ceil(Math.random() * 100);
    }
    /************************************** */
    private _findObjectClassByName(name: string) {
        let objectClass = this._objectClasses.find(i => i.objectName(i) === name);
        return objectClass;
    }
    /************************************** */
    /************************************** */
    /************************************** */
    static texturePath(filename: string) {
        return '../assets/textures/' + filename;
    }
}