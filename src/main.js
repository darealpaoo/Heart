import Renderer from "./utils/renderer.js";
import startApp from './utils/app.js';

let renderer3 = new Renderer();
let {THREE, scene, camera, renderer, controls, gltfLoader, flow, raycasting, ground, buttons, vec3} = renderer3;

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
			depth: 1,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.3,
			bevelSegments: 5,
		});

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff),
            transparent: true,
            opacity: 1.0,
            roughness: 0.5,
            metalness: 0.0,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.2,
        });

        messageBox = new THREE.Mesh(geometry, material);
        messageBox.position.set(-50, 30, -50);
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
        transparent: true,
    });
    const flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
    flameMesh.position.set(position.x, position.y + 3, position.z);
    flameMesh.rotation.x = Math.PI / -180;

    (function animateFlame() {
        const scale = 1 + Math.random() * 0.1;
        flameMesh.scale.set(scale, scale, scale);
        requestAnimationFrame(animateFlame);
    })();

    flameMesh.material.opacity = 1;
    scene.add(flameMesh);
    return flameMesh;
}

let flames = [];

function createCake() {
    const cakeGroup = new THREE.Group();
    const baseGeometry = new THREE.CylinderGeometry(20, 20, 10, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = 5;
    cakeGroup.add(baseMesh);

    const topGeometry = new THREE.CylinderGeometry(21, 21, 2, 32);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = 11;
    cakeGroup.add(topMesh);

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
        const flameMesh = createFlame(candleMesh.position);
        flames.push(flameMesh);
    }

    cakeGroup.position.set(0, -2, 0);
    scene.add(cakeGroup);
}

function extinguishFlames() {
    flames.forEach(flame => {
        const fadeOut = setInterval(() => {
            if (flame.material.opacity > 0) {
                flame.material.opacity -= 0.05;
            } else {
                clearInterval(fadeOut);
                scene.remove(flame);
            }
        }, 100);
    });
}

function addBirthdayText() {
    let text = 'Chúc mừng sinh nhật Quân chan\nMong được đồng hành cùng cậu\nđến quãng đời còn lại';
    let letters = [];
    let index = 0;
    let maxIndex = text.length;
    let lineHeight = 10; 
    let xOffset = -80;   
    let yOffset = 50;    
    let currentLine = 0; 
    let currentX = xOffset; 
    const loader = new FontLoader();
    
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
                color: new THREE.Color(0xffffff),
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
                if (letter === '\n') {
                    currentLine++;
                    currentX = xOffset;
                    index++;
                    return addLetters();
                }

                const positionY = yOffset - currentLine * lineHeight;
                const letterMesh = createLetterGeometry(letter, currentX, positionY);
                if (letter !== ' ') {
                    scene.add(letterMesh);
                    letters.push(letterMesh);
                }
                currentX += 6;
                index++;
            }

            if (index < maxIndex) {
                setTimeout(addLetters, 100);
            }
        }
        addLetters();
    });
}

// Hàm hiển thị pháo hoa
function showFireworks() {
    let {abs, min, max, random} = Math;
    let rrng = (n = 0, p = 1) => (random() * (p - n)) + n;
    let irrng = (n = 0, p = 1) => ((random() * (p - n)) + n) | 0;
    let grav = -.0098;

    class sys {
        constructor() {
            this.nodes = [];
            this.now = performance.now() / 1000;
        }
        step() {
            let now = performance.now() / 1000;
            this.dt = now - this.now;
            this.now = now;
            this.ndt = this.dt / (1 / 60);
            let i = 0, w = 0;
            for (; i < this.nodes.length; i++) {
                let n = this.nodes[i];
                if (!n.step()) { this.nodes[w++] = n; }
            }
            this.nodes.length = w;
        }
        emit(fn, ctx) {
            let n = new sys.node(this);
            n.flow = flow.start(fn, n, ctx);
            n.flow.onDone = () => n.dead = true;
            n.velocity.randomDirection();
            n.velocity.x *= .1;
            n.velocity.z *= .1;
            n.velocity.y = abs(n.velocity.y);
            n.velocity.y *= .4;
            this.nodes.push(n);
            return n;
        }
    }

    let _p = vec3();
    let _n = vec3();

    sys.node = class {
        constructor(sys) {
            this.sys = sys;
            this.life = .2;
            this.spawntime = sys.now;
            this.mass = 1.;
            this.drag = 0;
            this.position = vec3();
            this.velocity = vec3();
            this.color = (Math.random() * (1 << 24)) | 0;
            this.prims = new Array(8);
            this.ptop = 0;
        }
        destroyPrim(p) {
            dd.pushtop(p);
            dd.moveto(0, 0, 0);
            dd.lineto(0, 0, 0);
            dd.poptop();
        }
        dispose() {
            let t = this.ptop;
            if (this.ptop >= this.prims.length) t = this.prims.length;
            for (let i = 0; i < t; i++)
                this.destroyPrim(this.prims[i]);
        }
        step() {
            dd.color = this.color;
            let age = min(1, (this.sys.now - this.spawntime) / this.life);
            if (this.ptop >= this.prims.length) {
                let p = this.prims[this.ptop % this.prims.length];
                dd.pushtop(p);
                dd.moveto(0, 0, 0);
                dd.lineto(0, 0, 0);
                dd.poptop();
            }
            this.prims[this.ptop % this.prims.length] = dd.top();
            this.ptop++;
            dd.moveto(this.position);
            _p.copy(this.velocity);
            _p.multiplyScalar(this.sys.ndt);
            this.position.add(_p);
            dd.lineto(this.position);
            this.velocity.y += grav * this.mass * this.sys.ndt;
            if (this.position.y < 0) {
                this.position.y = 0 - this.position.y;
                this.velocity.y *= -1.;
                this.velocity.multiplyScalar(.5);
            } else {
                if (this.drag)
                    this.velocity.multiplyScalar(this.drag);
            }
            for (let i = 0, t = min(this.prims.length, this.ptop); i < t; i++) {
                let id = (this.ptop + i) % this.prims.length;
                let p = this.prims[id];
                let brightness = (i / t) * (((1 - age) ** 2) * 2.0);
                dd.pushtop(p);
                dd.lineCol(dd._color, brightness);
                dd.poptop();
            }
            if (this.dead) {
                this.dispose();
                return true;
            }
        }
    }

    function* spark(n, shell) {
        n.position.copy(shell.position);
        n.velocity.randomDirection().multiplyScalar(.23 * shell.power);
        n.velocity.add(shell.velocity);
        n.life = rrng(.8, 1.);
        n.mass = rrng(0.5, 1.);
        n.drag = rrng(.95, .99);
        yield n.life * 1000;
    }

    function* shell(shell) {
        shell.velocity.y += .7;
        shell.velocity.x *= 1.5;
        shell.velocity.z *= 1.5;
        shell.power = rrng(1, 2);
        shell.life = 1.05 * shell.power;
        yield shell.life * 1000;
        shell.dead = true;
        for (let i = 0; i < 50; i++) {
            shell.sys.emit(spark, shell);
        }
    }

	function* launcher(launcher) {
		launcher.velocity.set(0, 0, 0);
		launcher.position.set(0, 0, 0);
		while (1) {
			yield 1000; // Giảm tần suất xuống 2 giây
			if (rrng() > .95) {
				yield 3000; // Thời gian chờ ngẫu nhiên
			}
			launcher.sys.emit(shell, launcher);
		}
	}

    let msys = new sys;
    msys.emit(launcher);

    flow.start(function* () {
        while (1) {
            msys.step();
            yield 0;
        }
    });
}

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { WebGLRenderer } from 'https://threejs.org/build/three.module.js';
import { Camera } from 'https://threejs.org/build/three.module.js';
import { Scene } from 'https://threejs.org/build/three.module.js';

const loader = new FontLoader();

let thraxBomb;
loader.load('Noto Sans_Regular.json', function (font) {
    let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#300' }));
    scene.add(mesh);
    let bnds = new THREE.Box3().setFromObject(mesh);
    bnds.getCenter(_p);
    mesh.geometry.translate(-_p.x, -_p.y, -_p.z);
    bnds.getSize(_p);
    let sc = 1 / _p.x;
    mesh.geometry.scale(sc, sc, sc);

    let mss = new MeshSurfaceSampler(mesh)
        .setWeightAttribute(null)
        .build();

    function* meshSpark(n, shell) {
        mss.sample(_p, _n);
        _p.applyQuaternion(camera.quaternion);
        n.position.copy(shell.position);
        n.position.add(_p);
        _p.multiplyScalar(1.5);
        n.velocity.copy(_p);
        n.velocity.add(shell.velocity);
        n.life = rrng(1.5, 3);
        n.mass = 1.2;
        n.drag = .99;
        yield n.life * 1000;
    }

    thraxBomb = function* (n, shell) {
        for (let i = 0; i < 200; i++) {
            const spark = n.sys.emit(meshSpark, shell);
            spark.color = n.color;
		}
	};
});

function createHeartFireworkShell() {
    // Tạo hình trái tim trong không gian 3D
    const heartShape = [];
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heartShape.push(new THREE.Vector3(x * 0.5, y * 0.5, 0));
    }

    function* heartSpark(n, shell) {
        const randomPoint = heartShape[Math.floor(Math.random() * heartShape.length)];
        _p.copy(randomPoint);
        _p.applyQuaternion(camera.quaternion); // Quay theo hướng camera
        n.position.copy(shell.position);
        n.position.add(_p);
        _p.multiplyScalar(2.0); // Tăng tốc độ
        n.velocity.copy(_p);
        n.velocity.add(shell.velocity);
        n.life = rrng(1.5, 3); // Thời gian sống của trái tim
        n.mass = 1.2;
        n.drag = 0.98;
        yield n.life * 1000;
    }

    function* heartShell(shell) {
        shell.velocity.y += 0.7; // Bắn lên trên
        shell.velocity.x *= 1.5; // Tăng tốc ngang
        shell.velocity.z *= 1.5;
        shell.power = rrng(1, 2);
        shell.life = 1.2 * shell.power; // Thời gian tồn tại của pháo
        yield shell.life * 1000;
        shell.dead = true;
        for (let i = 0; i < 300; i++) {
            shell.sys.emit(heartSpark, shell); // Tạo tia lửa trái tim
        }
    }

    return heartShell;
}

function launchHeartFireworks() {
    // Định nghĩa lại hàm rrng nếu chưa được định nghĩa
    let rrng = (n = 0, p = 1) => (Math.random() * (p - n)) + n;

    // Tạo hệ thống pháo hoa
    const fireworkSys = new sys();

    const shell = {
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(rrng(-0.5, 0.5), 1, rrng(-0.5, 0.5)),
        sys: fireworkSys,
    };

    const heartShell = createHeartFireworkShell();
    shell.sys.emit(heartShell, shell);
}

// Tích hợp vào hệ thống hiện tại
function handleHeartFireworks() {
    setInterval(() => {
        launchHeartFireworks();
    }, 1000); // Tạo pháo trái tim mỗi 3 giây
}

// Gọi hàm để bắt đầu bắn pháo trái tim
handleHeartFireworks();

createCake();

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

                const shell = {
                    position: new THREE.Vector3(0, 0, 0),
                    velocity: new THREE.Vector3(0, 1, 0)
                };
                const n = {
                    sys: {
                        emit: (func, shell) => {
                            flow.start(func(n, shell));
                        }
                    },
                    color: 0xff0000
                };
                flow.start(thraxBomb(n, shell));

                // Trigger heart fireworks automatically
                createHeartFireworks();
            }
        }, glitchInterval);
    }

    addBirthdayText();
    showFireworks();
    extinguishFlames();
}

window.addEventListener('click', handleInteraction);
window.addEventListener('touchstart', handleInteraction);
document.body.addEventListener('touchend', handleInteraction);

// Xóa button chọn
const lilGuiElement = document.querySelector('.lil-gui');
if (lilGuiElement) {
    lilGuiElement.style.display = 'none';
}