import { ZoneObjectInfo, ZoneWallObjectInfo } from "./interfaces";

export type ZoneObjectType = 'wall' | 'glass';

export type GameMode = 'view' | 'edit' | 'create';

export type ZoneObjectInfoType = ZoneWallObjectInfo | ZoneObjectInfo;