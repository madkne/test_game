import { ZoneObjectInfo, ZoneWallObjectInfo } from "./interfaces";

export type ZoneObjectType = 'wall' | 'glass' | 'floor';

export type GameMode = 'view' | 'edit' | 'create' | 'delete';

export type ZoneObjectInfoType = ZoneWallObjectInfo | ZoneObjectInfo;


export type CharacterAnimationType = 'Idle' | 'Walking' | 'Run'; //TODO:

export type CharacterAnimationCollection = { [k in CharacterAnimationType]?: string };

export type GameCaptureKeyType = 'Ctrl' | 'Shift' | 'Alt' | 'X' | 'Y' | 'Z';