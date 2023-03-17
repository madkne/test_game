import { ZoneObjectInfo, ZoneWallObjectInfo } from "./interfaces";

export type ZoneObjectType = 'wall' | 'glass' | 'floor';

export type GameMode = 'view' | 'edit' | 'create' | 'delete';

export type ZoneObjectInfoType = ZoneWallObjectInfo | ZoneObjectInfo;