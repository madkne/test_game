import * as THREE from 'three';
let FBXLoader = require('three-fbxloader-offical')
export class BasicCharacterController {
    _target;
    _scene: THREE.Scene
    _animations: { [k: string]: { clip: any; action: THREE.AnimationAction; } } = {};
    _mixer: THREE.AnimationMixer;
    constructor(scene: THREE.Scene) {
        this._scene = scene
        this.init();
    }
    async init() {
        await this._loadModels();
        await this._loadAnimations();
        let walking = this._animations['walking'].action;
        // const clip = THREE.AnimationClip.findByName(clips, 'dance');
        console.log('walking', this._animations, this._animations['walking'])
        // let walking = this._mixer.clipAction(this._animations['walking'].clip)
        walking.time = 0.0;
        walking.enabled = true;
        walking.setEffectiveTimeScale(1.0)
        walking.setEffectiveWeight(1.0)
        walking.play();
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
            const loader = new FBXLoader();
            // loader.setPath('../assets/');
            loader.load('../assets/kaya.fbx', (fbx) => {
                fbx.scale.setScalar(0.1)
                this._target = fbx;
                this._target.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                    }
                });
                this._target.position.y = -4;
                // this._target.position.z 
                this._scene.add(this._target);
                this._mixer = new THREE.AnimationMixer(this._target);
                res(true);
            }, (error) => {
                console.error(error);
                res(false);
            });
        });

    }

    async _loadAnimations() {
        return new Promise((res) => {
            const loader = new FBXLoader();
            loader.load('../assets/Walking.fbx', (anim) => {
                const clip = anim.animations[0];
                // console.log('anim:', anim)
                const action = this._mixer.clipAction(clip);
                this._animations['walking'] = {
                    clip,
                    action,
                };
                res(true);
            })
        });
    }
} 