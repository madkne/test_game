import * as THREE from 'three';


// export function getMousePosition(clientX, clientY, camera: THREE.PerspectiveCamera) {
//     var mouse2D = new THREE.Vector3();
//     var mouse3D = new THREE.Vector3();
//     mouse2D.x = (clientX / window.innerWidth) * 2 - 1;
//     mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
//     mouse2D.z = 0.5;
//     mouse3D = projector.unprojectVector(mouse2D.clone(), camera);
//     return mouse3D;
//     var vector = new THREE.Vector3(
//         (clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1,
//         0.5);

//     projector.unprojectVector(vector, camera);
//     var dir = vector.sub(camera.position).normalize();
//     var distance = -camera.position.z / dir.z;
//     var pos = camera.position.clone().add(dir.multiplyScalar(distance));
//     return pos;
// }

export function getMouse3DPosition(e: MouseEvent, camera: THREE.PerspectiveCamera) {

    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        - (e.clientY / window.innerHeight) * 2 + 1,
        0.5);

    vec.unproject(camera);

    vec.sub(camera.position).normalize();

    var distance = - camera.position.z / vec.z;

    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    if (pos.z < -5) pos.setZ(-1);
    return pos;
}

export function checkPointInBox(pt: THREE.Vector3, cube, boxDim?) {
    cube.updateMatrixWorld(); //Make sure the object matrix is current with the position/rotation/scaling of the object...
    // var localPt = cube.worldToLocal(pt.clone()); //Transform the point from world space into the objects space
    let localPt = pt.clone()
    if (localPt.z < -5) localPt.z = -1;
    return cube.geometry.boundingBox.containsPoint(localPt);
}

export function compareCameras(camera1: THREE.PerspectiveCamera, camera2: THREE.PerspectiveCamera) {
    if (!camera1.position.equals(camera2.position)) return false;
    if (camera1.zoom !== camera2.zoom) return false;

    return true;
}