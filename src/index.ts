import BasicScene from "./BasicScene";
// sets up the scene
let scene = new BasicScene();
scene.initialize();
// loops updates
function loop() {
    scene.camera.updateProjectionMatrix();
    scene.renderer.render(scene, scene.camera);
    // scene.orbitals.update()
    requestAnimationFrame(loop);
}
// runs a continuous loop
loop()