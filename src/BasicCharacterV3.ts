import { GUI } from 'dat.gui';
import * as THREE from 'three';
import BasicScene from './BasicScene.js';
// let FBXLoader = require('three-fbxloader-offical')
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import Stats from './jsm/libs/stats.module.js';




export class BasicCharacterV3Controller {
    _target;
    _scene: BasicScene//THREE.Scene
    // _animations: { [k: string]: { clip: any; action: THREE.AnimationAction; } } = {};
    _mixer: THREE.AnimationMixer;
    // idleWeight: number;
    api = { state: 'Walking' };
    stats;
    clock: THREE.Clock;
    loader: GLTFLoader;
    gui;
    actions;
    activeAction: THREE.AnimationAction;
    previousAction: THREE.AnimationAction;
    container;

    constructor(scene: BasicScene) {
        this._scene = scene
        this.clock = new THREE.Clock()
        this.init();
    }
    async init() {
        await this._loadModels();
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        // stats
        this.stats = new (Stats as any)();
        this.container.appendChild(this.stats.dom);
        // await this._loadAnimations();
        // let walking = this._animations['walking'].action;
        // const clip = THREE.AnimationClip.findByName(clips, 'dance');
        // console.log('walking', this._animations, this._animations['walking'])
        // // let walking = this._mixer.clipAction(this._animations['walking'].clip)
        // walking.time = 0.0;
        // walking.enabled = true;
        // walking.setEffectiveTimeScale(1.0)
        // walking.setEffectiveWeight(1.0)
        // walking.play();
        const animate = () => {
            requestAnimationFrame(animate);

            if (this._mixer) {
                const dt = 0.75 * this.clock.getDelta();
                this._mixer.update(dt);
            }

            // if (this._scene.renderer) {
            this._scene.renderer.render(this._scene, this._scene.camera);
            // }
            if (this.stats) {
                this.stats.update();
            }


        }
        animate();
    }

    async _loadModels() {
        return new Promise((res) => {
            this.loader = new GLTFLoader();
            this.loader.load('../assets/RobotExpressive.glb', (gltf) => {
                let model = gltf.scene;
                model.position.set(20, 5, 25.0);

                this._scene.add(model);
                console.log(model)

                this.createGUI(model, gltf.animations);

                res(true);
            }, undefined, (error) => {
                console.error('err33:', error);
                res(false);
            });
            // loader.load('../assets/kaya.fbx', (fbx) => {
            //     fbx.scale.setScalar(0.1)
            //     this._target = fbx;
            //     this._target.traverse(o => {
            //         if (o.isMesh) {
            //             o.castShadow = true;
            //             o.receiveShadow = true;
            //         }
            //     });
            //     this._target.position.y = -4;
            //     // this._target.position.z 
            //     this._scene.add(this._target);
            //     this._mixer = new THREE.AnimationMixer(this._target);
            //     res(true);
            // }, (error) => {
            //     console.error(error);
            //     res(false);
            // });
        });

    }

    createGUI(model, animations) {

        const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
        const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

        this.gui = new GUI();

        this._mixer = new THREE.AnimationMixer(model);

        this.actions = {};

        for (let i = 0; i < animations.length; i++) {

            const clip = animations[i];
            const action = this._mixer.clipAction(clip);
            this.actions[clip.name] = action;

            if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

                action.clampWhenFinished = true;
                action.loop = THREE.LoopOnce;

            }

        }

        // states

        const statesFolder = this.gui.addFolder('States');
        // console.log('states:', this.api)

        const clipCtrl = statesFolder.add(this.api, 'state').options(states);

        clipCtrl.onChange(() => {
            console.log('action', this.api.state)
            this.fadeToAction(this.api.state, 0.5);

        });

        statesFolder.open();

        // emotes

        const emoteFolder = this.gui.addFolder('Emotes');

        const createEmoteCallback = (name) => {

            this.api[name] = () => {

                this.fadeToAction(name, 0.2);

                this._mixer.addEventListener('finished', restoreState);

            };
            // console.log('api:', this.api)
            emoteFolder.add(this.api, name);

        }

        const restoreState = () => {

            this._mixer.removeEventListener('finished', restoreState);

            this.fadeToAction(this.api.state, 0.2);

        }

        for (let i = 0; i < emotes.length; i++) {

            createEmoteCallback(emotes[i]);

        }

        emoteFolder.open();

        // expressions

        let face = model.getObjectByName('Head_4');

        const expressions = Object.keys(face.morphTargetDictionary);
        const expressionFolder = this.gui.addFolder('Expressions');

        for (let i = 0; i < expressions.length; i++) {

            expressionFolder.add(face.morphTargetInfluences, String(i), 0, 1, 0.01).name(expressions[i]);

        }
        this.activeAction = this.actions['Walking'];
        console.log(this.activeAction)
        this.activeAction.play();


        // Critical section...
        // let mesh = this._scene.children[0];

        // mesh.scale.set(-1, -1, 1);

        // var sequence = THREE.AnimationClip.CreateFromMorphTargetSequence('animation', (mesh as any).geometry.morphTargets, 25, true);
        // var animation = mixer.clipAction(sequence);
        // animation.play();
        // End of critital section

        expressionFolder.open();

    }

    fadeToAction(name, duration) {

        this.previousAction = this.activeAction;
        this.activeAction = this.actions[name];

        if (this.previousAction !== this.activeAction) {

            this.previousAction.fadeOut(duration);

        }
        console.log('active action:', this.activeAction, duration)
        this.activeAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();


    }

    onWindowResize() {

        // camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();

        // renderer.setSize(window.innerWidth, window.innerHeight);

    }

    //

    // animate() {

    //     const dt = this.clock.getDelta();

    //     if (this._mixer) this._mixer.update(dt);

    //     requestAnimationFrame(this.animate);
    //     this['renderer'].render(this._scene, this['camera']);

    //     this.stats.update();

    // }

} 