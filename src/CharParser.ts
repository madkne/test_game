import * as THREE from 'three';
import { ZoneScene } from './ZoneScene';
import axios from 'axios';
import { CharacterInfo } from './interfaces';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { CharacterControls } from './char/characterControls';
import { KeyDisplay } from './char/KeyDisplay';
import { CharacterAnimationCollection, CharacterAnimationType } from './types';


export class CharParserClass {
    protected targetObject: THREE.Group;
    protected scene: ZoneScene;
    protected animations: { [k: string]: { clip: any; action: THREE.AnimationAction; } } = {};
    protected mixer: THREE.AnimationMixer;
    protected idleWeight: number;
    protected groundY: number;
    protected charName: string;
    protected char: CharacterInfo;
    protected clock: THREE.Clock;


    protected characterControls: CharacterControls;

    /************************************** */
    constructor(scene: ZoneScene, charName = 'char0', groundY = -5) {
        this.scene = scene;
        this.charName = charName;
        this.groundY = groundY;
        this.clock = new THREE.Clock();
        this.init();
    }
    /************************************** */
    async init() {
        await this.fetchCharInfo();
        await this.loadModel();
        this.characterControls = new CharacterControls(this, 'Idle', this.char.velocity);

    }
    /************************************** */
    get model() {
        return this.targetObject;
    }
    /************************************** */
    async animate() {
        let mixerUpdateDelta = this.clock.getDelta();
        if (this.characterControls) {
            this.characterControls.update(mixerUpdateDelta);
        }
        if (this.mixer) {
            this.mixer.update(mixerUpdateDelta);
        }
    }
    /************************************** */
    async fetchCharInfo() {
        let res = await axios.get('/api/char?char=' + this.charName);
        if (res.status === 200) {
            // console.log(res)
            this.char = res.data;
            // =>detect model type
            if (this.char.model.endsWith('.fbx')) {
                this.char.modelType = 'fbx';
            }
            if (!this.char.y && this.char.y !== 0) {
                this.char.y = this.groundY;
            }
            if (this.char.x === undefined) {
                this.char.x = 0;
            }
            if (this.char.z === undefined) {
                this.char.z = 0;
            }
            if (!this.char.animations) {
                this.char.animations = {};
            }
            if (!this.char.velocity) {
                this.char.velocity = 2;
            }
            this.loadCharAllAnimationKeys();
        }
    }

    /************************************** */
    async getAnimation(name: CharacterAnimationType) {
        if (this.animations[name]) {
            return this.animations[name];
        }
        // =>load first animation
        await this._loadFBXAnimation(name, false);
        return this.animations[name];
    }
    /************************************** */
    /************************************** */
    /************************************** */
    protected async loadModel() {
        if (this.char.modelType === 'fbx') {
            await this._loadFBXModel();
        } else {
            console.warn('can not load char model', this.char.model, this.char.modelType);
        }
    }
    /************************************** */
    /************************************** */
    /************************************** */
    private loadCharAllAnimationKeys() {
        const defaultAnimationKeys: CharacterAnimationCollection = {
            'Idle': 'Idle',
            'Walking': 'Walking',
            'Run': 'Fast_Run'
            //TODO:
        };
        for (const key in defaultAnimationKeys) {
            if (!this.char.animations[key]) {
                this.char.animations[key] = defaultAnimationKeys[key];
            }
        }

    }
    /************************************** */
    private async _loadFBXModel() {
        return new Promise((res) => {
            const loader = new FBXLoader();
            // loader.setPath('../assets/');
            loader.load('../assets/models/' + this.char.model, (fbx) => {
                console.log(fbx)
                this.targetObject = fbx;
                this.targetObject.scale.setScalar(this.char.scale);
                this.targetObject.traverse(o => {
                    if (o['isMesh']) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                    }
                });

                this.targetObject.position.set(this.char.x, this.char.y, this.char.z);

                this.scene.add(this.targetObject);
                this.mixer = new THREE.AnimationMixer(this.targetObject);
                // =>run Idle animation
                // this._loadFBXAnimation();

                // let action = this.mixer.clipAction(this._target.animations[0]);
                // action.play();
                res(true);
            }, (progress) => {

            }, (error) => {
                console.error(error);
                res(false);
            });
        });

    }


    /************************************** */
    private async _loadFBXAnimation(animationName: CharacterAnimationType = 'Idle', autoPlay = true) {
        let realAnimationName = this.char.animations[animationName] ?? animationName;
        return new Promise((res) => {
            const loader = new FBXLoader();
            loader.load(`../assets/animations/${realAnimationName}.fbx`, (anim) => {
                const clip = anim.animations[0];
                // console.log('anim:', anim)
                const action = this.mixer.clipAction(clip);
                // this._animations['walking'] = {
                //     clip,
                //     action,
                // };

                this.animations[animationName] = {
                    clip,
                    action,
                };
                if (autoPlay) {
                    action.play();
                }
                // this._mixers.push(m)
                // let idle = m.clipAction(anim.animations[0])
                res(true);
            })
        });
    }
}