import * as THREE from 'three'
import { CharParserClass } from '../CharParser.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { CharacterAnimationType } from '../types.js';
import { A, D, DIRECTIONS, KeyDisplay, S, SHIFT, W } from './KeyDisplay'


export class CharacterControls {

    protected parser: CharParserClass;
    protected currentAction: CharacterAnimationType;
    protected keysPressed: {} = {};




    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()

    // constants
    fadeDuration: number = 0.2
    runVelocity = 3
    walkVelocity = 1
    /************************************** */

    constructor(parser: CharParserClass, currentAction: CharacterAnimationType, velocity = 2) {
        this.parser = parser;


        this.currentAction = currentAction;
        // =>run current action
        (this.parser.getAnimation(currentAction)).then(anim => anim.action?.play());

        this.updateCameraTarget(0, 0)
        this.runVelocity *= velocity;
        this.walkVelocity *= velocity;
        this._initEvents();
    }

    /************************************** */

    public async update(delta: number) {
        const isAnyKeysPressed = DIRECTIONS.some(key => this.keysPressed[key] == true);
        var play: CharacterAnimationType = 'Idle';
        // =>if any key pressed
        if (isAnyKeysPressed) {
            // =>if any direction keys pressed 
            if (this.keysPressed[W] || this.keysPressed[S] || this.keysPressed[D] || this.keysPressed[A]) {
                if (this.keysPressed[SHIFT]) {
                    play = 'Run'
                } else {
                    play = 'Walking'
                }
            }
        }
        // if (play !== 'Idle') {
        //     console.log("update char:", delta, play, isAnyKeysPressed, this.keysPressed)
        // }

        if (this.currentAction != play) {
            const toPlay = await this.parser.getAnimation(play);
            const current = await this.parser.getAnimation(this.currentAction);

            current.action.fadeOut(this.fadeDuration)
            toPlay.action.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play
        }

        // this.parser['mixer'].update(delta)

        if (this.currentAction == 'Run' || this.currentAction == 'Walking') {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                (this.parser['scene'].camera.position.x - this.parser.model.position.x),
                (this.parser['scene'].camera.position.z - this.parser.model.position.z))
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(this.keysPressed)
            // directionOffset *= -1;
            // rotate model
            let angle = angleYCameraDirection + directionOffset;
            angle += Math.PI; //TODO: maybe different for any char
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angle);
            this.parser.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)
            // console.log('rotate char:', angle, this.rotateQuarternion)

            // calculate direction
            this.parser['scene'].camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // run/walk velocity
            const velocity = this.currentAction == 'Run' ? this.runVelocity : this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta;
            // console.log('char move:', moveX, moveZ, this.walkDirection);
            this.parser.model.position.x += moveX
            this.parser.model.position.z += moveZ
            this.updateCameraTarget(moveX, moveZ)
        }
    }
    /************************************** */

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.parser['scene'].camera.position.x += moveX
        this.parser['scene'].camera.position.z += moveZ

        // update camera target
        this.cameraTarget.x = this.parser.model.position.x
        this.cameraTarget.y = this.parser.model.position.y + 1
        this.cameraTarget.z = this.parser.model.position.z
        this.parser['scene'].controls.target = this.cameraTarget
    }
    /************************************** */

    private directionOffset(keysPressed: any) {
        var directionOffset = 0 // w

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed[D]) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed[D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed[A]) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }
    /************************************** */

    private _initEvents() {
        // CONTROL KEYS
        const keyDisplayQueue = new KeyDisplay();
        document.addEventListener('keydown', (event) => {
            keyDisplayQueue.down(event.key)
            if (event.shiftKey) {
                this.keysPressed[SHIFT] = true;
            }

            this.keysPressed[event.key.toLowerCase()] = true;

        }, false);
        document.addEventListener('keyup', (event) => {
            keyDisplayQueue.up(event.key);
            (this.keysPressed as any)[event.key.toLowerCase()] = false
            if (event.shiftKey) {
                this.keysPressed[SHIFT] = false;
            }
        }, false);
    }
}