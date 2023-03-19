import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export async function getZone(request: Request, response: Response) {
    let zoneName = request.query['zone'];
    // =>read json file of zone
    let zoneFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db', zoneName + '.json')).toString());

    response.status(200).json(zoneFile);
}

export async function updateZone(request: Request, response: Response) {
    let zoneName = request.body['name'];
    let zoneInfo = request.body['zone'];
    // =>write json file of zone
    fs.writeFileSync(path.join(__dirname, '..', 'db', zoneName + '.json'), JSON.stringify(zoneInfo, null, 2));

    response.status(200).end();
}


export async function getChar(request: Request, response: Response) {
    let charName = request.query['char'];
    // =>read json file of char
    let charFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db', charName + '.json')).toString());

    response.status(200).json(charFile);
}

export async function updateChar(request: Request, response: Response) {
    let charName = request.body['name'];
    let charInfo = request.body['zone'];
    // =>write json file of zone
    fs.writeFileSync(path.join(__dirname, '..', 'db', charName + '.json'), JSON.stringify(charInfo, null, 2));

    response.status(200).end();
}