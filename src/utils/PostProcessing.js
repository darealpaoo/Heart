import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
export default function PostProcessing({THREE, renderer, scene, camera, gui}) {

    let composer = new EffectComposer(renderer);
composer.renderTarget1.samples = 8;
composer.renderTarget2.samples = 8;
    const renderPass = new RenderPass(scene,camera);
    composer.addPass(renderPass);

    const params = {
        threshold: .23,
        strength: .036,
        radius: 0
    };

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),1.5,0.4,0.85);
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;
    composer.addPass(bloomPass);
    let bloom=this.bloom={
        set threshold(v){
            bloomPass.threshold = Number(v);    
        },
        set strength(v){
            bloomPass.strength = Number(v);
        },
        set radius(v){
            bloomPass.radius = Number(v);
            bloomUniforms.bloomRadius.value = bloomPass.radius
        }
    }

    
    const bloomFolder = gui.addFolder('bloom');

    let bloomUniforms = bloomPass.compositeMaterial.uniforms;
    let bfac= bloomUniforms.bloomFactors.value;
    for(let i=0;i<5;i++)bfac[i]=10.1-(2.02*i);

    bloomFolder.add(params, 'threshold', 0.0, 1.0).onChange((v)=>bloom.threshold = v);
    bloomFolder.add(params, 'strength', 0.0, 3.0).onChange((v)=>bloom.strength = v);
    bloomFolder.add(params, 'radius', 0.0, 1.0).step(0.01).onChange((v)=>bloom.radius = v);
    
    bloomFolder.close();
    const wwidth = window.innerWidth;
    const wheight = window.innerHeight;

    let resize = this.resize=(width,height)=>{
        composer.setSize(width, height);
        
    }
    function onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;
        resize(width,height)
    }

    window.addEventListener('resize', onWindowResize);

    const outputPass = new OutputPass();

    composer.addPass(outputPass);

    this.render = ()=>{
        composer.render(scene, camera)
    }
}