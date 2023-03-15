import * as THREE from 'three';
// let FBXLoader = require('three-fbxloader-offical')
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { CharacterControls } from './characterControls';
import BasicScene from './BasicScene.js';
import { KeyDisplay } from './utils';



export class BasicCharacterV4Controller {
    _target;
    _scene: BasicScene;
    _animations: { [k: string]: { clip: any; action: THREE.AnimationAction; } } = {};
    _mixer: THREE.AnimationMixer;
    idleWeight: number;
    characterControls: CharacterControls;


    constructor(scene: BasicScene) {
        this._scene = scene
        this.init();
    }
    async init() {
        await this._loadModels();
        // CONTROL KEYS
        const keysPressed = {}
        const keyDisplayQueue = new KeyDisplay();
        document.addEventListener('keydown', (event) => {
            keyDisplayQueue.down(event.key)
            if (event.shiftKey && this.characterControls && !this.characterControls.toggleRun) {
                this.characterControls.switchRunToggle()
            } else {
                (keysPressed as any)[event.key.toLowerCase()] = true
            }
        }, false);
        document.addEventListener('keyup', (event) => {
            keyDisplayQueue.up(event.key);
            (keysPressed as any)[event.key.toLowerCase()] = false
            if (event.shiftKey && this.characterControls && this.characterControls.toggleRun) {
                this.characterControls.switchRunToggle()
            }
        }, false);

        const clock = new THREE.Clock();
        // ANIMATE
        const animate = () => {
            let mixerUpdateDelta = clock.getDelta();
            if (this.characterControls) {
                this.characterControls.update(mixerUpdateDelta, keysPressed);
            }
            // this. orbitControls.update()
            // renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        // document.body.appendChild(renderer.domElement);
        animate();

    }

    async _loadModels() {
        return new Promise((res) => {
            const loader = new GLTFLoader();
            loader.load('../assets/Soldier.glb', (gltf) => {
                const model = gltf.scene;
                console.log(model)
                model.traverse(function (object: any) {
                    if (object.isMesh) object.castShadow = true;
                });
                model.scale.set(10, 10, 10);
                model.position.set(20, 0, 25.0);

                this._scene.add(model);

                const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
                const mixer = new THREE.AnimationMixer(model);
                const animationsMap: Map<string, THREE.AnimationAction> = new Map()
                gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
                    animationsMap.set(a.name, mixer.clipAction(a))
                })

                this.characterControls = new CharacterControls(model, mixer, animationsMap, this._scene.controls as any, this._scene.camera, 'Idle', 44, 10)
                res(true);
            }, (error) => {
                console.error('err33:', error);
                res(false);
            });

        });

    }



} 