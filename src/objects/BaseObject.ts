import { ZoneInfo } from "../interfaces";
import { ZoneObjectInfoType, ZoneObjectType } from "../types";
import * as THREE from 'three';
import { ObjectManagement } from "../ObjectManagement";
import { ZoneParserClass } from "../ZoneParser";


export abstract class BaseObject {

    abstract get title(): string;
    abstract get type(): ZoneObjectType;
    /************************************** */
    abstract renderObject(info: ZoneObjectInfoType);
    /************************************** */
    generateObjectInfo(info: ZoneObjectInfoType) {
        return info;
    }
    /************************************** */
    static objectName(obj: typeof BaseObject) {
        return obj.prototype['constructor']['name'];
    }
    /************************************** */
    generateObjectPlaceholder(zone: ZoneInfo, objectName: string) {
        let objPlaceholder;
        // =>if wall type
        // if (type === 'wall' || type == 'glass') {
        const rollOverGeo = new THREE.BoxGeometry();
        let rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.3, transparent: true });
        objPlaceholder = new THREE.Mesh(rollOverGeo, rollOverMaterial);
        objPlaceholder.scale.set(zone.meta.ground.minScaler, zone.meta.ground.minScaler, 1);
        // }
        // // =>if floor type
        // else if (type === 'floor') {
        //     const rollOverGeo = new THREE.BoxGeometry();
        //     let rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.3, transparent: true });
        //     objPlaceholder = new THREE.Mesh(rollOverGeo, rollOverMaterial);
        //     objPlaceholder.scale.set(zone.meta.ground.minScaler, zone.meta.ground.minScaler, 1);
        //     objPlaceholder.scale.set(zone.meta.ground.minScaler, 1, zone.meta.ground.minScaler);
        // }



        return objPlaceholder;
    }
    /************************************** */
    /***************HELPERS**************** */
    /************************************** */
    protected _createMesh(geometry: THREE.BufferGeometry, material: THREE.Material, info: ZoneObjectInfoType) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.scale.set(info.scaleX ?? 1, info.scaleY ?? 1, info.scaleZ ?? 1);
        mesh.position.set(info.x ?? 0, info.y ?? 0, info.z ?? 1);
        if (info.rotateX) {
            mesh.rotation.x = info.rotateX;
        }
        if (info.rotateY) {
            mesh.rotation.y = info.rotateY;
        }
        if (info.rotateZ) {
            mesh.rotation.z = info.rotateZ;
        }
        mesh.name = info.name ?? '';
        mesh.geometry.computeBoundingBox();
        mesh.updateMatrixWorld(true); // This might be necessary if box is moved
        return mesh;
    }
    /************************************** */
    protected _createCube(info: ZoneObjectInfoType, textureLoader?: (tex: THREE.Texture) => THREE.Texture) {
        const geometry = new THREE.BoxGeometry();
        let tex: THREE.Texture;
        if (info.texture) {
            tex = new THREE.TextureLoader().load(ObjectManagement.texturePath(info.texture));
            if (textureLoader) {
                tex = textureLoader(tex);
            } else {
                tex.anisotropy = 4;
                tex.repeat.set(info.scaleX / 2, info.scaleY / 2)
                tex.wrapT = THREE.RepeatWrapping;
                tex.wrapS = THREE.RepeatWrapping;
            }
        }
        let parameters: THREE.MeshStandardMaterialParameters = {
            // shininess: 3,
            roughness: 0.7,
            // color: 0xffffff,
            bumpScale: 0.002,
            metalness: 0.2
        };
        if (info.color) parameters.color = info.color;
        if (tex) parameters.map = tex;
        // const material = new THREE.MeshPhongMaterial(parameters);
        const material = new THREE.MeshStandardMaterial(parameters);
        material.needsUpdate = true;
        let cube = this._createMesh(geometry, material, info);

        return cube;
    }
}