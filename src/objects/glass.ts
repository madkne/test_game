import { ZoneObjectInfoType, ZoneObjectType } from "../types";
import { BaseObject } from "./BaseObject";
import * as THREE from 'three';
import { ObjectManagement } from "../ObjectManagement";
import { ZoneGlassObjectInfo } from "../interfaces";


export class glass extends BaseObject {
    get title(): string {
        return 'Glass';
    }
    get type(): ZoneObjectType {
        return 'glass';
    }

    /************************************** */
    generateObjectInfo(info: ZoneObjectInfoType) {
        info.texture = 'light_wall_stone.jpg';
        if (!info.scaleZ) info.scaleZ = 1;
        return info;
    }
    /************************************** */
    async renderObject(glass: ZoneGlassObjectInfo) {
        const geometry = new THREE.BoxGeometry();
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
        const cube = this._createMesh(geometry, material, glass);

        return cube;
    }
}