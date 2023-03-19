import * as HTTP from "http";
import * as URL from 'url';
import * as PATH from 'path';
import * as FS from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { getChar, getZone, updateChar, updateZone } from "./apis";

const SERVER_PORT = 8800;

export class HttpWebServer {
    server: express.Express;
    responseTime: number;
    // upload = multer({ dest: config('UPLOAD_PATH') }).single('file');
    /**************************************** */
    constructor() {
        // => init server
        this.server = express();
        // =>config middlewares
        this.server.use(cors());
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: false }));
        this.server.set('trust proxy', true);

        // =>start to listen to api server
        this.server.listen(SERVER_PORT, () => {
            console.log('init', `API Web Server Running on ${SERVER_PORT} port`);
        });

        // =>listen on urls
        this.initRoutes();
    }
    /**************************************** */
    async initRoutes() {
        // =>Serve static files
        this.server.use(express.static('public'));
        /**
         * get zone info 
         * GET
         * /api/zone?zone=zone0
         */
        this.server.get('/api/zone', (req, res) => {
            getZone(req, res);
        });
        /**
         * update zone info 
         * PUT
         * /api/zone?zone=zone0
         */
        this.server.put('/api/zone', (req, res) => {
            updateZone(req, res);
        });
        /**
        * get char info 
        * GET
        * /api/char?char=char0
        */
        this.server.get('/api/char', (req, res) => {
            getChar(req, res);
        });
        /**
         * update char info 
         * PUT
         * /api/char?char=char0
         */
        this.server.put('/api/char', (req, res) => {
            updateChar(req, res);
        });
    }

}


