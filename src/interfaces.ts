import { ZoneObjectType } from "./types";


export interface ZoneInfo {
    meta: {
        ground: {
            texture: string;
            width: number;
            height: number;
        };
        sky: {
            texture: string;
        }
    };
    objects: (ZoneWallObjectInfo | ZoneObjectInfo)[];
}

export interface ZoneWallObjectInfo extends ZoneObjectInfo {
}

export interface ZoneObjectInfo {
    type: ZoneObjectType;
    texture?: string;
    color?: string;
    x?: number;
    y?: number;
    /**
     * @default 1
     */
    z?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
    name?: string;
}


// export interface GameGUIField {
//     element: HTMLElement;
//     id: string;
// }