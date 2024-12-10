import Renderer from "./utils/renderer.js"
import startApp from './utils/app.js'

let renderer3 = new Renderer();
let {THREE, scene,camera,renderer, controls, gltfLoader, flow, raycasting,ground,buttons,vec3} = renderer3;

window.app = await startApp({ renderer3 });
renderer3.start();

let {dd} = renderer3;

camera.position.set(0.00, 50, 50.00); // Camera position

// Hàm tạo message box
let messageBox;

function createMessageBox() { 
    const text = "Ấn vào màn hình để thổi nến";
    const loader = new FontLoader();

    loader.load('Noto Sans_Regular.json', function (font) {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 5,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.5,
            bevelSize: 0.3,
            bevelSegments: 5,
        });

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff), // Màu trắng
            transparent: true, // Bật chế độ trong suốt
            opacity: 1.0, // Độ trong suốt ban đầu
            roughness: 0.5,
            metalness: 0.0,
            emissive: new THREE.Color(0xffffff), // Màu phát sáng
            emissiveIntensity: 0.2, // Độ sáng nhẹ để tạo hiệu ứng blur
        });

        messageBox = new THREE.Mesh(geometry, material);
        messageBox.position.set(-50, 30, -50); // Điều chỉnh vị trí
        scene.add(messageBox);
    });
}

createMessageBox();

// Hàm tạo ngọn lửa
function createFlame(position) {
    const flameGeometry = new THREE.CylinderGeometry(0.2, 1, 2, 16);
    const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff4500,
        emissiveIntensity: 1,
        transparent: true, // Bật chế độ trong suốt
    });
    const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);

    // Đặt ngọn lửa ở vị trí của nến với y + 3
    flameMesh.position.set(position.x, position.y + 3, position.z);

    // Đặt ngọn lửa thẳng đứng
    flameMesh.rotation.x = Math.PI / -180; // Xoay 90 độ quanh trục x

    // Animation nhấp nháy
    (function animateFlame() {
        const scale = 1 + Math.random() * 0.1; // Thay đổi kích thước ngẫu nhiên
        flameMesh.scale.set(scale, scale, scale);
        requestAnimationFrame(animateFlame);
    })();

    flameMesh.material.opacity = 1; // Khởi tạo độ trong suốt

    scene.add(flameMesh);
    return flameMesh; // Trả về ngọn lửa
}

// Biến để lưu ngọn lửa
let flames = [];

// Tạo bánh kem
function createCake() {
    const cakeGroup = new THREE.Group();

    // Base of the cake (cylinder)
    const baseGeometry = new THREE.CylinderGeometry(20, 20, 10, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 5;
    cakeGroup.add(baseMesh);

    // Top layer of icing
    const topGeometry = new THREE.CylinderGeometry(21, 21, 2, 32);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = 11;
    cakeGroup.add(topMesh);

    // Adding candles
    const candleGeometry = new THREE.CylinderGeometry(0.6, 0.6, 8, 16);
    const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    for (let i = 0; i < 5; i++) {
        const candleMesh = new THREE.Mesh(candleGeometry, candleMaterial);
        candleMesh.position.set(
            Math.cos((i / 5) * Math.PI * 2) * 10,
            16,
            Math.sin((i / 5) * Math.PI * 2) * 10
        );
        cakeGroup.add(candleMesh);

        // Tạo ngọn lửa cho nến và lưu vào mảng
        const flameMesh = createFlame(candleMesh.position);
        flames.push(flameMesh);
    }

    cakeGroup.position.set(0, -2, 0);
    scene.add(cakeGroup);
}

// Hàm để biến mất ngọn lửa
function extinguishFlames() {
    flames.forEach(flame => {
        const fadeOut = setInterval(() => {
            if (flame.material.opacity > 0) {
                flame.material.opacity -= 0.05; // Giảm độ trong suốt
            } else {
                clearInterval(fadeOut); // Dừng nếu đã hoàn toàn trong suốt
                scene.remove(flame); // Xóa ngọn lửa khỏi scene
            }
        }, 100); // Thay đổi độ trong suốt mỗi 100ms
    });
}

// Hàm thêm chữ chúc mừng sinh nhật
function addBirthdayText() {
	let text = 'Chúc mừng sinh nhật Quân chan\nMong được đồng hành cùng cậu\nđến quãng đời còn lại';

	// Tạo các chữ cái riêng biệt và thêm chúng vào scene dần dần
	let letters = [];
	let index = 0;
	let maxIndex = text.length;
	let lineHeight = 10; // Khoảng cách giữa các dòng chữ
	let xOffset = -80;   // Vị trí bắt đầu của chữ trên trục X
	let yOffset = 50;    // Vị trí bắt đầu của chữ trên trục Y
	let currentLine = 0; // Biến để theo dõi dòng hiện tại
	let currentX = xOffset; // Vị trí X hiện tại cho từng chữ
	
	loader.load('Noto Sans_Regular.json', function (font) {
		function createLetterGeometry(letter, positionX, positionY) {
			const geometry = new TextGeometry(letter, {
				font: font,
				size: 5,
				height: 1,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.5,
				bevelSize: 0.3,
				bevelSegments: 5,
			});
			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(0xffffff), // Màu trắng cho chữ
				roughness: 0.5,
				metalness: 0.0,
				emissive: 0xffffff,
				emissiveIntensity: 0.2,
			});
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(positionX, positionY, -50);
			return mesh;
		}
	
		function addLetters() {
			if (index < maxIndex) {
				const letter = text[index];
				
				// Xử lý xuống dòng
				if (letter === '\n') {
					currentLine++; // Tăng dòng
					currentX = xOffset; // Đặt lại vị trí X về đầu dòng
					index++; // Bỏ qua ký tự xuống dòng
					return addLetters(); // Gọi lại để xử lý ký tự tiếp theo
				}
	
				const positionY = yOffset - currentLine * lineHeight;
				const letterMesh = createLetterGeometry(letter, currentX, positionY);
	
				// Thêm chữ vào scene nếu không phải khoảng trắng
				if (letter !== ' ') {
					scene.add(letterMesh);
					letters.push(letterMesh);
				}
	
				currentX += 6; // Tăng vị trí X cho chữ tiếp theo
				index++; // Tăng index để xử lý chữ tiếp theo
			}
	
			if (index < maxIndex) {
				setTimeout(addLetters, 100); // Tiếp tục thêm chữ sau 100ms
			}
		}
		addLetters(); // Bắt đầu thêm chữ
	});
}

import {ParticleContext} from "./components/rtparticles2.js"

// Hàm hiển thị pháo hoa
function showFireworks() {
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
}

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
		let t = Math.random() * 2 * Math.PI; // Góc để tính toán vị trí
		let scale = 0.5; // Kích thước hình trái tim
		_p.set(
			scale * 16 * Math.pow(Math.sin(t), 3),
			scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
			Math.random() * 1 - 0.5 // Giá trị z ngẫu nhiên để tạo 3D
		);

		_p.applyQuaternion(camera.quaternion); // Đưa vào không gian camera
		n.position.copy(shell.position);
		n.position.add(_p);
		n.velocity.copy(_p).multiplyScalar(0.1); // Tốc độ di chuyển của tia
		n.velocity.add(shell.velocity); // Thêm vận tốc ban đầu
		n.life = Math.random() * 1.5 + 1.5; // Thời gian sống
		n.mass = 1.2;
		n.drag = 0.99;
		yield n.life * 1000;
	}
	
	thraxBomb = function*(n,shell){
		for(let i=0; i < 300; i++){
			let spark = n.sys.emit(meshSpark,shell)
			spark.color = n.color;
		}
	}

	thraxBomb = function* (n, shell) {
		for (let i = 0; i < 200; i++) {
			let spark = n.sys.emit(heartSpark, shell);
			spark.color = n.color;
		}
	};

	function* heartSpark(n, shell) {
		let t = Math.random() * 2 * Math.PI;
		let scale = 0.5;
		_p.set(
			scale * 16 * Math.pow(Math.sin(t), 3),
			scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
			Math.random() * 1 - 0.5
		);
	
		_p.applyQuaternion(camera.quaternion);
		n.position.copy(shell.position);
		n.position.add(_p);
		n.velocity.copy(_p).multiplyScalar(0.1);
		n.velocity.add(shell.velocity);
		n.life = Math.random() * 1.5 + 1.5;
		n.mass = 1.2;
		n.drag = 0.99;
		yield n.life * 1000;
	}
	

} );

createCake();

// Hàm xử lý logic khi xảy ra sự kiện
function handleInteraction() {
    if (messageBox) {
        const glitchDuration = 500;
        const glitchInterval = 50;
        let step = 0;

        const glitchEffect = setInterval(() => {
            if (step < glitchDuration / glitchInterval) {
                const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
                messageBox.material.color.set(randomColor);
                messageBox.material.opacity = Math.random();
                step++;
            } else {
                clearInterval(glitchEffect);
                scene.remove(messageBox);
                messageBox = null;

                // Kích hoạt hiệu ứng `thraxBomb` sau khi thổi nến
                const shell = { position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0) };
                const n = {
                    sys: {
                        emit: (func, shell) => {
                            flow.start(func(n, shell));
                        }
                    },
                    color: 0xff0000
                };
                flow.start(thraxBomb(n, shell));
            }
        }, glitchInterval);
    }

    addBirthdayText();
    showFireworks();
    extinguishFlames();
}

// Lắng nghe sự kiện click và touchstart
window.addEventListener('click', handleInteraction);
window.addEventListener('touchstart', handleInteraction);

// Xóa button chọn
const lilGuiElement = document.querySelector('.lil-gui');
if (lilGuiElement) {
  lilGuiElement.style.display = 'none';
}
