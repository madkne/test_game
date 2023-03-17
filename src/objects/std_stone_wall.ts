import { ZoneObjectInfoType, ZoneObjectType } from "../types";
import { BaseObject } from "./BaseObject";
import * as THREE from 'three';
import { ObjectManagement } from "../ObjectManagement";
import { ZoneInfo } from "../interfaces";


export class std_stone_wall extends BaseObject {
    get title(): string {
        return 'Standard Stone Wall';
    }
    get type(): ZoneObjectType {
        return 'wall';
    }

    /************************************** */
    generateObjectInfo(info: ZoneObjectInfoType) {
        info.texture = 'light_wall_stone.jpg';
        info.scaleZ = 2;
        info.scaleX = 2;
        info.scaleY = 2;
        return info;
    }
    /************************************** */
    generateObjectPlaceholder(zone: ZoneInfo, objectName: string) {
        let objPlaceholder;
        const rollOverGeo = new THREE.BoxGeometry();
        let rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.3, transparent: true });
        objPlaceholder = new THREE.Mesh(rollOverGeo, rollOverMaterial);
        objPlaceholder.scale.set(2, 2, 2);

        return objPlaceholder;
    }
    /************************************** */
    async renderObject(wall: ZoneObjectInfoType) {
        wall.scaleX = wall.scaleY = wall.scaleZ = 2;
        return this._createCube(wall, (tex) => {
            tex.repeat.set(0.5, 0.5);
            tex.anisotropy = 4;
            return tex;
        });
    }
}