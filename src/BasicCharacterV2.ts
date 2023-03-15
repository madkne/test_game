import * as THREE from 'three';
// let FBXLoader = require('three-fbxloader-offical')
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';




export class BasicCharacterV2Controller {
    _target;
    _scene: THREE.Scene
    _animations: { [k: string]: { clip: any; action: THREE.AnimationAction; } } = {};
    _mixer: THREE.AnimationMixer;
    idleWeight: number;


    constructor(scene: THREE.Scene) {
        this._scene = scene
        this.init();
    }
    async init() {
        await this._loadModels();
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
        const clock = new THREE.Clock()
        const animate = () => {
            requestAnimationFrame(animate)

            if (this._mixer) {
                // this._mixer.update(clock.getDelta())
            }
        }
        animate();
    }

    async _loadModels() {
        return new Promise((res) => {
            const loader = new GLTFLoader();
            loader.load('../assets/Soldier.glb', (gltf) => {
                console.log('gltf', gltf)
                let model = gltf.scene;
                this._scene.add(model);

                model.traverse(function (object) {

                    if (object.isMesh) object.castShadow = true;

                });

                //

                let skeleton = new THREE.SkeletonHelper(model);
                skeleton.visible = false;
                this._scene.add(skeleton);

                //

                // createPanel();


                //

                const animations = gltf.animations;

                let mixer = new THREE.AnimationMixer(model);



                this._activateAllActions(mixer, animations);

                this._animate();
                res(true);
            }, (error) => {
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


    _activateAllActions(mixer: THREE.AnimationMixer, animations) {

        let idleAction = mixer.clipAction(animations[0]);
        let walkAction = mixer.clipAction(animations[3]);
        let runAction = mixer.clipAction(animations[1]);

        let actions = [idleAction, walkAction, runAction];

        // this._setWeight(idleAction, settings['modify idle weight']);
        // this._setWeight(walkAction, settings['modify walk weight']);
        // this._setWeight(runAction, settings['modify run weight']);

        actions.forEach((action) => {

            action.play();

        });
    }

    _setWeight(action, weight) {

        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);

    }

    _animate() {

        // Render loop

        // requestAnimationFrame(animate);

        // this.idleWeight = idleAction.getEffectiveWeight();
        // this.walkWeight = walkAction.getEffectiveWeight();
        // this.runWeight = runAction.getEffectiveWeight();

        // // Update the panel values if weights are modified from "outside" (by crossfadings)

        // updateWeightSliders();

        // // Enable/disable crossfade controls according to current weight values

        // updateCrossFadeControls();

        // // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

        // let mixerUpdateDelta = clock.getDelta();

        // // If in single step mode, make one step and then do nothing (until the user clicks again)

        // if (singleStepMode) {

        //     mixerUpdateDelta = sizeOfNextStep;
        //     sizeOfNextStep = 0;

        // }

        // // Update the animation mixer, the stats panel, and render this frame

        // mixer.update(mixerUpdateDelta);

        // stats.update();

        // renderer.render(scene, camera);

    }

} 