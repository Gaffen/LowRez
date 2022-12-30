/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const loader = new GLTFLoader()
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import getPaths from './paths'
import FlameTex from './utils/flameTexture'

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#000')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: false}) // turn on antialias
const pixelRatio = 0.5 / Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(pixelRatio) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div
renderer.domElement.imageSmoothingEnabled = false;

const clock = new THREE.Clock();
let delta = 0;

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(0,2,4)
camera.rotation.set(-0.333,0,0)
scene.add(camera)

const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)
})

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
const tex = new FlameTex(pixelRatio)

document.querySelector('body').appendChild(tex.canvas);
document.querySelector('body').appendChild(tex.noiseTex);
tex.noiseTex.style.position = "absolute";
tex.noiseTex.style.top = 0;
tex.noiseTex.style.left = 0;

loader.load('models/gltf/bonfire.glb', function (gltf) {

    const model = gltf.scene;
    const lineMat = new THREE.LineBasicMaterial( { color: 0xffffff, depthTest: false, side: THREE.DoubleSide } );
    const fillMat = new THREE.MeshPhongMaterial( {
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1,
        color: false, side: THREE.DoubleSide, depthTest: true
    } );


    const firePlace = new THREE.Mesh(model.geometry, fillMat);
    firePlace.scale.set(1000,1000,1000)
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    scene.add(firePlace)

    // model.traverse((o) => {
    //     if(o.isMesh) {
    //         const edges = new THREE.EdgesGeometry( o.geometry );
    //         firePlace.add( new THREE.LineSegments( edges, lineMat ));
    //     }
    // })

    console.log(firePlace)
    model.scale.set(4, 4, 4)
    scene.add(model)
    // console.log(gltf)
})
const paths = getPaths();
scene.add(paths);

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight)

const composer = new EffectComposer( renderer );
composer.addPass(new RenderPass(scene, camera))

// composer.addPass(new OutlinePass(renderer.size, scene, camera))

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {

    delta = clock.getDelta();

    controls.update()

    paths.rotation.y += 2 * delta;

    composer.render() // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function

    // tex.update(delta);
    
}

rendeLoop() //start rendering