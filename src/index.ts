
import { ZoneScene } from "./ZoneScene";
// sets up the scene
let scene = new ZoneScene();
scene.initialize();
// loops updates
function loop() {
    scene.camera.updateProjectionMatrix();
    scene.renderer.render(scene, scene.camera);
    scene.animate();
    // scene.orbitals.update()
    requestAnimationFrame(loop);
}
// runs a continuous loop
loop()