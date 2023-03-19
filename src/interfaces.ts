import { CharacterAnimationCollection, CharacterAnimationType, ZoneObjectInfoType, ZoneObjectType } from "./types";


export interface ZoneInfo {
    meta: {
        ground: {
            texture: string;
            width: number;
            height: number;
            minScaler: number;
        };
        sky: {
            texture: string;
        }
    };
    objects: ZoneObjectInfoType[];
}

export interface ZoneWallObjectInfo extends ZoneObjectInfo {
}

export interface ZoneGlassObjectInfo extends ZoneObjectInfo {
    /**
     * between 0,1
     * @default 0.5
     */
    metalness?: number;
}
export interface ZoneObjectInfo {
    objectName: string;
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



export interface CharacterInfo {
    model: string;
    modelType?: 'fbx';
    scale?: number;
    x?: number;
    y?: number;
    /**
     * @default 1
     */
    z?: number;
    animations?: CharacterAnimationCollection;
    /**
     * Character movement speed coefficient
     * @default 2
     */
    velocity?: number;
}
