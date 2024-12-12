import { Vector3 } from 'three';

const { abs, min, max, random, PI, sin, cos } = Math;
const rrng = (n=0, p=1) => (random()*(p-n))+n;
const irrng = (n=0, p=1) => ((random()*(p-n))+n)|0;
const GRAVITY = -0.0098;

export class FireworkSystem {
    constructor(renderer3) {
        this.renderer3 = renderer3;
        this.scene = renderer3.scene;
        this.dd = renderer3.dd;
        this.flow = renderer3.flow;
        this.vec3 = renderer3.vec3;
        this.nodes = [];
        this.isActive = false;
        this.now = performance.now()/1000;
    }

    start() {
        console.log("Fireworks executed!");
        this.isActive = true;
        this.emit(this.launcher.bind(this));
        this.startAnimation();
    }

    startAnimation() {
        this.flow.start(function*() {
            while(this.isActive) {
                this.step();
                yield 0;
            }
        }.bind(this));
    }

    step() {
        let now = performance.now()/1000;
        this.dt = now - this.now;
        this.now = now;
        this.ndt = this.dt/(1/60);
        
        let i=0, w=0;
        for(; i<this.nodes.length; i++) {
            let n = this.nodes[i];
            if(!n.step()) {
                this.nodes[w++] = n;
            }
        }
        this.nodes.length = w;
    }

    emit(fn, ctx) {
        let n = new FireworkNode(this);
        n.flow = this.flow.start(fn, n, ctx);
        n.flow.onDone = () => n.dead = true;
        n.velocity.randomDirection();
        n.velocity.x *= 0.1;
        n.velocity.z *= 0.1;
        n.velocity.y = abs(n.velocity.y);
        n.velocity.y *= 0.4;
        this.nodes.push(n);
        return n;
    }

    *heartSpark(n, shell) {
        const t = random() * 2 * PI;
        const x = 16 * sin(t) * sin(t) * sin(t);
        const y = 13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t);
        
        n.position.copy(shell.position);
        const scale = 0.1;
        n.velocity.set(x * scale, y * scale, 0);
        n.velocity.multiplyScalar(0.2);
        n.velocity.add(shell.velocity);
        
        n.life = rrng(1.2, 1.5);
        n.mass = rrng(0.5, 1);
        n.drag = rrng(0.98, 0.99);
        n.color = 0xFF69B4;
        yield n.life * 1000;
    }

    *heartShell(shell) {
        shell.velocity.y += 0.7;
        shell.velocity.x *= 1.5;
        shell.velocity.z *= 1.5;
        shell.power = rrng(1, 2);
        shell.life = 1.05 * shell.power;
        yield shell.life * 1000;
        shell.dead = true;

        for(let i = 0; i < 100; i++) {
            this.emit(this.heartSpark.bind(this), shell);
        }
    }

    *launcher() {
        while(this.isActive) {
            yield irrng(10, 30);
            if(rrng() > 0.95) yield 3000;
            
            if(random() > 0.5) {
                this.emit(this.shell.bind(this));
            } else {
                this.emit(this.heartShell.bind(this));
            }
        }
    }

    *shell(shell) {
        shell.velocity.y += 0.7;
        shell.velocity.x *= 1.5;
        shell.velocity.z *= 1.5;
        shell.power = rrng(1, 2);
        shell.life = 1.05 * shell.power;
        yield shell.life * 1000;
        shell.dead = true;

        for(let i = 0; i < 50; i++) {
            const spark = this.emit(this.spark.bind(this), shell);
            spark.color = (random() > 0.5) ? 0xFFD700 : 0x00FF00;
        }
    }

    *spark(n, shell) {
        n.position.copy(shell.position);
        n.velocity.randomDirection().multiplyScalar(0.23 * shell.power);
        n.velocity.add(shell.velocity);
        n.life = rrng(0.8, 1);
        n.mass = rrng(0.5, 1);
        n.drag = rrng(0.95, 0.99);
        yield n.life * 1000;
    }
}

class FireworkNode {
    constructor(sys) {
        this.sys = sys;
        this.dd = sys.dd;
        this.life = 0.2;
        this.spawntime = sys.now;
        this.mass = 1.0;
        this.drag = 0;
        this.position = new Vector3();
        this.velocity = new Vector3();
        this.color = (Math.random()*(1<<24))|0;
        this.prims = new Array(8);
        this.ptop = 0;
    }

    destroyPrim(p) {
        this.dd.pushtop(p);
        this.dd.moveto(0,0,0);
        this.dd.lineto(0,0,0);
        this.dd.poptop();
    }

    dispose() {
        let t = this.ptop;
        if(this.ptop >= this.prims.length) t = this.prims.length;
        for(let i = 0; i < t; i++) {
            this.destroyPrim(this.prims[i]);
        }
    }

    step() {
        this.dd.color = this.color;
        let age = min(1, (this.sys.now-this.spawntime)/this.life);

        if(this.ptop >= this.prims.length) {
            let p = this.prims[this.ptop%this.prims.length];
            this.dd.pushtop(p);
            this.dd.moveto(0,0,0);
            this.dd.lineto(0,0,0);
            this.dd.poptop();
        }

        this.prims[this.ptop%this.prims.length] = this.dd.top();
        this.ptop++;
        this.dd.moveto(this.position);
        
        let _p = this.velocity.clone();
        _p.multiplyScalar(this.sys.ndt);
        this.position.add(_p);
        
        this.dd.lineto(this.position);
        this.velocity.y += GRAVITY * this.mass * this.sys.ndt;
        
        if(this.position.y < 0) {
            this.position.y = 0 - this.position.y;
            this.velocity.y *= -1;
            this.velocity.multiplyScalar(0.5);
        } else if(this.drag) {
            this.velocity.multiplyScalar(this.drag);
        }

        for(let i = 0, t = min(this.prims.length, this.ptop); i < t; i++) {
            let id = (this.ptop+i)%this.prims.length;
            let p = this.prims[id];
            let brightness = (i/t)*(((1-age)**2)*2.0);
            this.dd.pushtop(p);
            this.dd.lineCol(this.dd._color, brightness);
            this.dd.poptop();
        }

        if(this.dead) {
            this.dispose();
            return true;
        }
    }
} 