import { ZoneObjectInfoType, ZoneObjectType } from "../types";
import { BaseObject } from "./BaseObject";
import * as THREE from 'three';
import { ObjectManagement } from "../ObjectManagement";


export class stone_wall_v1 extends BaseObject {
    get title(): string {
        return 'Stone Wall v1';
    }
    get type(): ZoneObjectType {
        return 'wall';
    }

    /************************************** */
    generateObjectInfo(info: ZoneObjectInfoType) {
        info.texture = 'light_wall_stone.jpg';
        if (!info.scaleZ) info.scaleZ = 1;
        return info;
    }
    /************************************** */
    async renderObject(wall: ZoneObjectInfoType) {
        return this._createCube(wall);
    }
}