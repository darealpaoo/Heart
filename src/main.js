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
camera.position.set(0.89, 25, 66);
camera.rotation.set(0.22, 0.01, 0.0);

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
let cscale=(c,v)=>{
	return (((((c>>0)&255)*v)|0)<<0)
			(((((c>>8)&255)*v)|0)<<8)
			(((((c>>16)&255)*v)|0)<<16);
}
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
	while(1){
		yield irrng(10,30);
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
const loader = new FontLoader();
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

let thraxBomb;
loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

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
	} );
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
		for(let i=0;i<300;i++){
			let spark = n.sys.emit(meshSpark,shell)
			spark.color = n.color;
		}
	}

	thraxBomb = function* (n, shell) {
		for (let i = 0; i < 300; i++) {
			let spark = n.sys.emit(heartSpark, shell);
			spark.color = n.color;
		}
	};
} );

// Chữ happy birth day
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry('Happy Birthday', {
        font: font,
        size: 10,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelSegments: 5,
    });

    // ShaderMaterial để tạo hiệu ứng cầu vồng
    const textMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                float r = 0.5 + 0.5 * sin(time + vUv.x * 6.28);
                float g = 0.5 + 0.5 * sin(time + vUv.x * 6.28 + 2.0);
                float b = 0.5 + 0.5 * sin(time + vUv.x * 6.28 + 4.0);
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `,
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Căn chỉnh vị trí chữ
    const boundingBox = new THREE.Box3().setFromObject(textMesh);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    textMesh.position.set(-center.x, -center.y, -center.z); // Đặt chữ phía sau pháo hoa (z < 0)

    // Thêm vào scene
    scene.add(textMesh);

    // Cập nhật màu sắc động
    function animateRainbow() {
        textMaterial.uniforms.time.value += 0.02; // Điều chỉnh tốc độ thay đổi màu
        requestAnimationFrame(animateRainbow);
    }
    animateRainbow();
});

// Bánh
function createCake() {
    const cakeGroup = new THREE.Group();

    // Phần thân bánh (trụ tròn)
    const baseGeometry = new THREE.CylinderGeometry(10, 10, 5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb }); // Màu hồng nhạt
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 2.5; // Nâng bánh lên để không bị chìm vào nền
    cakeGroup.add(baseMesh);

    // Lớp kem trên cùng
    const topGeometry = new THREE.CylinderGeometry(10.5, 10.5, 1, 32);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Màu trắng
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = 6; // Đặt trên thân bánh
    cakeGroup.add(topMesh);

    // Trang trí: Đường viền quanh bánh
    const torusGeometry = new THREE.TorusGeometry(10.5, 0.5, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 }); // Màu hồng đậm
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.rotation.x = Math.PI / 2; // Xoay để nằm ngang
    torusMesh.position.y = 6; // Trùng với lớp kem
    cakeGroup.add(torusMesh);

    // Trang trí: Nến
    const candleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Màu vàng
    for (let i = 0; i < 5; i++) {
        const candleMesh = new THREE.Mesh(candleGeometry, candleMaterial);
        candleMesh.position.set(
            Math.cos((i / 5) * Math.PI * 2) * 5,
            8, // Cao hơn lớp kem
            Math.sin((i / 5) * Math.PI * 2) * 5
        );
        cakeGroup.add(candleMesh);
    }

    // Trang trí: Ngọn lửa nến
    const flameGeometry = new THREE.ConeGeometry(0.5, 1, 16);
    const flameMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 }); // Màu cam
    for (let i = 0; i < 5; i++) {
        const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
        flameMesh.position.set(
            Math.cos((i / 5) * Math.PI * 2) * 5,
            10, // Nằm trên đỉnh nến
            Math.sin((i / 5) * Math.PI * 2) * 5
        );
        cakeGroup.add(flameMesh);
    }

    // Đặt bánh kem vào cảnh
    cakeGroup.position.set(0, 0, -20); // Đặt vị trí
    scene.add(cakeGroup);
}

createCake();