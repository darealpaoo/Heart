import Renderer from "./utils/renderer.js"
import startApp from './utils/app.js'
let renderer3 = new Renderer();

let {THREE, scene,camera,renderer, controls, gltfLoader, flow, raycasting,ground,buttons,vec3} = renderer3;
window.app = await startApp({
    renderer3
})

let {dd} = renderer3;

window.app = await startApp({
    renderer3
});

// Thiết lập vị trí và góc quay của camera
camera.position.set(-0.02, 33, 63.73);

renderer3.start();


//controls.autoRotate = true

import {ParticleContext} from "./components/rtparticles2.js"

let {abs,min,max,random,PI,sin,cos}=Math;
let rrng=(n=0,p=1)=>(random()*(p-n))+n;
let irrng=(n=0,p=1)=>((random()*(p-n))+n)|0;
let grav = -.0098;
function* mt(){}
class sys{
	constructor(){
		this.nodes = []
		this.now=performance.now()/1000;
	}
	step(){
		let now=performance.now()/1000;
		this.dt = now-this.now;
		this.now=now;
		this.ndt = this.dt/(1/60)
		let i=0,w=0;
		for(;i<this.nodes.length;i++){
			let n = this.nodes[i];
			if(!n.step()){this.nodes[w++]=n}
		}
		this.nodes.length = w;
	}
	emit(fn=mt,ctx){
		let n = new sys.node(this);
		n.flow = flow.start(fn,n,ctx);
		n.flow.onDone=()=>n.dead=true;
		n.velocity.randomDirection();
		n.velocity.x *= .1;
		n.velocity.z *= .1;
		n.velocity.y = abs(n.velocity.y);
		n.velocity.y *= .4;
		this.nodes.push(n)
		return n;
	}
}

	let _p=vec3();
	let _n=vec3();
	let cscale = (c, v) => {
		return (((((c >> 0) & 255) * v) | 0) << 0)
			| (((((c >> 8) & 255) * v) | 0) << 8)
			| (((((c >> 16) & 255) * v) | 0) << 16);
	};

sys.node = class {
	constructor(sys){
		this.sys = sys;
		this.life = .2;
		this.spawntime = sys.now
		this.mass = 1.;
		this.drag = 0;
		this.position = vec3()
		this.velocity = vec3()
		this.color = (Math.random()*(1<<24))|0;
		this.prims = new Array(8);
		this.ptop = 0;
	}
	destroyPrim(p){
		dd.pushtop(p)
		dd.moveto(0,0,0)
		dd.lineto(0,0,0)
		dd.poptop()
	}
	dispose(){
		let t=this.ptop;
		if(this.ptop>=this.prims.length)t=this.prims.length;
		for(let i=0;i<t;i++)
			this.destroyPrim(this.prims[i])
	}
	step(){
		dd.color = this.color;

		let age = min(1,(this.sys.now-this.spawntime)/this.life);

		
		if(this.ptop>=this.prims.length){
			let p = this.prims[this.ptop%this.prims.length]
			dd.pushtop(p)
			dd.moveto(0,0,0)
			dd.lineto(0,0,0)
			dd.poptop()
		}
		
		this.prims[this.ptop%this.prims.length]=dd.top();
		this.ptop++;
		dd.moveto(this.position)
		_p.copy(this.velocity);
		_p.multiplyScalar(this.sys.ndt);
		this.position.add(_p);
		dd.lineto(this.position)
		this.velocity.y += grav*this.mass*this.sys.ndt;
		if(this.position.y<0){
			this.position.y=0-this.position.y;
			this.velocity.y *= -1.;
			this.velocity.multiplyScalar(.5);
		}else{
			if(this.drag)
				this.velocity.multiplyScalar(this.drag);			
		}
		for(let i=0,t=min(this.prims.length,this.ptop);i<t;i++){
			let id=(this.ptop+i)%this.prims.length;
			let p = this.prims[id]
			let brightness = (i/t)*(((1-age)**2)*2.0);
			dd.pushtop(p)
			dd.lineCol(dd._color,brightness);
			dd.poptop()
		}
		
		if(this.dead){
			this.dispose();
			return true;
		}
	}
}


function* spark(n,shell){
	n.position.copy(shell.position);
	n.velocity.randomDirection().multiplyScalar(.23 * shell.power);
	n.velocity.add(shell.velocity);
	n.life = rrng(.8,1.);
	n.mass = rrng(0.5,1.);
	n.drag = rrng(.95,.99);
	yield n.life*1000;
}

function* shell(shell){
	shell.velocity.y+=.7;
	shell.velocity.x*=1.5;
	shell.velocity.z*=1.5;
	shell.power = rrng(1,2);
	shell.life = 1.05*shell.power;
	yield shell.life*1000;// (1900*shell.velocity.y)|0;
	shell.dead = true;

	if(thraxBomb&&(!irrng(0,20))){
		shell.sys.emit(thraxBomb,shell);
	}
	for(let i=0;i<50;i++){
		shell.sys.emit(spark,shell);
	}
}

function* launcher(launcher){
	launcher.velocity.set(0,0,0);
	launcher.position.set(0, 0, 0);
	while(1){
		//yield irrng(10,30);
		yield irrng(5, 15);
		if(rrng()>.95)
			yield 3000;
		launcher.sys.emit(shell,launcher)
	}
}
let msys = new sys;
msys.emit(launcher);

flow.start(function*(){
	while(1){
		msys.step()
		yield 0;
	}
})

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three';
import { WebGLRenderer } from 'https://threejs.org/build/three.module.js';
import { Camera } from 'https://threejs.org/build/three.module.js';
import { Scene } from 'https://threejs.org/build/three.module.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';

const loader = new FontLoader();

let thraxBomb;
loader.load( 'Noto Sans_Regular.json', function ( font ) {

	const geometry = new TextGeometry( 'thrax', {
        font: font,
        size: 16,
        depth: 1.,
        curveSegments: 2,
        bevelEnabled: true,
        bevelThickness: .1,
        bevelSize: .1,
        bevelOffset: 0,
        bevelSegments: 1
    });
	let mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#300'}))
	
	scene.add(mesh)
	let bnds = new THREE.Box3().setFromObject(mesh);
	bnds.getCenter(_p);
	mesh.geometry.translate(-_p.x,-_p.y,-_p.z)
	bnds.getSize(_p);
	let sc=1/_p.x;
	mesh.geometry.scale(sc,sc,sc);

	let mss = new MeshSurfaceSampler(mesh)
					.setWeightAttribute(  null )
					.build();


	function* meshSpark(n,shell){
		mss.sample(_p,_n);
		_p.applyQuaternion(camera.quaternion);//localToWorld(_p);
		n.position.copy(shell.position);
		n.position.add(_p);
		_p.multiplyScalar(1.5);
		n.velocity.copy(_p);
		//n.velocity.randomDirection().multiplyScalar(.23 * shell.power);
		n.velocity.add(shell.velocity);
		n.life = rrng(1.5,3);
		n.mass = 1.2;//rrng(0.1,0.11);
		n.drag = .99;//rrng(.95,.95);
		yield n.life*1000;
	}

	function* heartSpark(n, shell) {
		let t = rrng(0, 2 * PI); // Góc để tính toán vị trí
		let scale = 0.5; // Kích thước hình trái tim
		_p.set(
			scale * 16 * Math.pow(Math.sin(t), 3),
			scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
			rrng(-0.5, 0.5) // Giá trị z ngẫu nhiên để tạo 3D
		);
	
		_p.applyQuaternion(camera.quaternion); // Đưa vào không gian camera
		n.position.copy(shell.position);
		n.position.add(_p);
		n.velocity.copy(_p).multiplyScalar(0.1); // Tốc độ di chuyển của tia
		n.velocity.add(shell.velocity); // Thêm vận tốc ban đầu
		n.life = rrng(1.5, 3); // Thời gian sống
		n.mass = 1.2;
		n.drag = 0.99;
		yield n.life * 1000;
	}
	
	
	thraxBomb = function*(n,shell){
		for(let i=0; i < 100; i++){
			let spark = n.sys.emit(meshSpark,shell)
			spark.color = n.color;
		}
	}

	thraxBomb = function* (n, shell) {
		for (let i = 0; i < 500; i++) {
			let spark = n.sys.emit(heartSpark, shell);
			spark.color = n.color;
		}
	};
} );

loader.load('Noto Sans_Regular.json', function (font) {
    const textGeometry = new TextGeometry('Chúc mừng sinh nhật Quân chan\nMong được đồng hành cùng cậu\nđến quãng đời còn lại', {
        font: font,
        size: 5, // Decrease the size
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelSegments: 5,
    });

    // Set color and emissive properties
    const textMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff), // White color
        roughness: 0.5,
        metalness: 0.0,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        side: THREE.FrontSide
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Center the text by adjusting its position
    const boundingBox = new THREE.Box3().setFromObject(textMesh);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    textMesh.position.set(-50, 50, -50); // Center the text

    // Optional: Adjust the Y position for better visibility
    textMesh.position.y += 2; // Move it slightly up

    scene.add(textMesh);

    // Rainbow effect
    let time = 0;
    const rainbowColors = [
        new THREE.Color(0xFF0000), // Red
        new THREE.Color(0xFF7F00), // Orange
        new THREE.Color(0xFFFF00), // Yellow
        new THREE.Color(0x00FF00), // Green
        new THREE.Color(0x0000FF), // Blue
        new THREE.Color(0x4B0082), // Indigo
        new THREE.Color(0x8B00FF), // Violet
    ];

    function updateRainbow() {
        time += 0.01;
        const colorIndex = Math.floor(time * rainbowColors.length) % rainbowColors.length;
        textMaterial.color = rainbowColors[colorIndex];
    }

    function animate() {
        requestAnimationFrame(animate);
        updateRainbow();
    }
    animate();
});

// Bánh
function createCake() {
    const cakeGroup = new THREE.Group();

    // Base of the cake (cylinder)
    const baseGeometry = new THREE.CylinderGeometry(10, 10, 5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 2.5;
    cakeGroup.add(baseMesh);

    // Top layer of icing
    const topGeometry = new THREE.CylinderGeometry(10.5, 10.5, 1, 32);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = 6;
    cakeGroup.add(topMesh);

    // Decoration: Torus around the cake
    const torusGeometry = new THREE.TorusGeometry(10.5, 0.5, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.rotation.x = Math.PI / 2;
    torusMesh.position.y = 6;
    cakeGroup.add(torusMesh);

    // Adding candles with animated flames
    const candleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    
    // Adjusted flame geometry
    const flameGeometry = new THREE.CylinderGeometry(0.1, 0.5, 1, 16);
    const flameMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500 });

    for (let i = 0; i < 5; i++) {
        const candleMesh = new THREE.Mesh(candleGeometry, candleMaterial);
        candleMesh.position.set(
            Math.cos((i / 5) * Math.PI * 2) * 5,
            8,
            Math.sin((i / 5) * Math.PI * 2) * 5
        );
        cakeGroup.add(candleMesh);

        // Create flame mesh
        const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
        flameMesh.position.set(
            Math.cos((i / 5) * Math.PI * 2) * 5,
            10, // Position above the candle
            Math.sin((i / 5) * Math.PI * 2) * 5
        );

        // Make the flame point straight up
        flameMesh.rotation.x = Math.PI / 2; // Rotate to point up

        // Animate flame flickering
        (function (flame) {
            let scale = 1;
            let direction = 1;

            function animateFlame() {
                scale += direction * 0.05;
                if (scale > 1.1 || scale < 0.9) direction *= -1; // Flicker effect
                flame.scale.set(scale, scale, scale);
                requestAnimationFrame(animateFlame);
            }
            animateFlame();
        })(flameMesh);

        cakeGroup.add(flameMesh);
    }

    // Set cake position in the scene
    cakeGroup.position.set(0, 0, -20);
    scene.add(cakeGroup);
}

// Call the createCake function to add the cake to the scene
createCake();

// Xóa button chọn
const lilGuiElement = document.querySelector('.lil-gui');
if (lilGuiElement) {
  lilGuiElement.style.display = 'none';
}
