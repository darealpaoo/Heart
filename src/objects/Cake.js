import * as THREE from 'three';
import { Group, CylinderGeometry, MeshStandardMaterial, Mesh, SphereGeometry, ConeGeometry } from 'three';
import { CONSTANTS } from '../config/constants.js';
import { Flame } from './Flame.js';

export class Cake {
    constructor(scene) {
        this.scene = scene;
        this.group = new Group();
        this.flames = [];
        this.init();
    }

    init() {
        this.createBase();
        this.createFrosting();
        this.createTop();
        this.createHeartFrosting();
        this.createDecorations();
        this.createCandles();
        this.group.position.set(0, -2, 0);
    }

    createBase() {
        const geometry = new CylinderGeometry(
            CONSTANTS.CAKE.BASE_RADIUS,
            CONSTANTS.CAKE.BASE_RADIUS,
            CONSTANTS.CAKE.BASE_HEIGHT,
            32
        );
        const material = new MeshStandardMaterial({ color: CONSTANTS.COLORS.CAKE_BASE });
        const base = new Mesh(geometry, material);
        base.position.y = 5;
        this.group.add(base);
    }

    createFrosting() {
        const geometry = new CylinderGeometry(
            CONSTANTS.CAKE.TOP_RADIUS,
            CONSTANTS.CAKE.TOP_RADIUS,
            2,
            32
        );
        const material = new MeshStandardMaterial({ color: CONSTANTS.COLORS.CAKE_TOP });
        const frosting = new Mesh(geometry, material);
        frosting.position.y = 11;
        this.group.add(frosting);
    }

    createTop() {
        const geometry = new CylinderGeometry(
            CONSTANTS.CAKE.TOP_RADIUS,
            CONSTANTS.CAKE.TOP_RADIUS,
            1,
            32
        );
        const material = new MeshStandardMaterial({ color: CONSTANTS.COLORS.CAKE_TOP });
        const top = new Mesh(geometry, material);
        top.position.y = 12;
        this.group.add(top);
    }

    createHeartFrosting() {
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(1, 1, 1, 2, 0, 2);
        heartShape.bezierCurveTo(-1, 2, -1, 1, 0, 0);

        const extrudeSettings = {
            depth: 0.5,
            bevelEnabled: false,
            steps: 1
        };

        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const material = new MeshStandardMaterial({ color: 0xFF3030 });
        const heartFrosting = new Mesh(geometry, material);

        heartFrosting.position.set(2, 11, 0);
        heartFrosting.rotation.z = Math.PI;

        this.group.add(heartFrosting);
    }

    createDecorations() {
        for (let i = 0; i < 20; i++) {
            const chipGeometry = new SphereGeometry(0.3, 8, 8);
            const chipMaterial = new MeshStandardMaterial({ 
                color: 0x3C2A21,
                roughness: 0.2,
                metalness: 0.3
            });
            const chip = new Mesh(chipGeometry, chipMaterial);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (CONSTANTS.CAKE.BASE_RADIUS - 2);
            
            chip.position.x = Math.cos(angle) * radius;
            chip.position.z = Math.sin(angle) * radius;
            chip.position.y = 9.1;
            chip.rotation.x = Math.random() * Math.PI;
            chip.rotation.z = Math.random() * Math.PI;
            
            this.group.add(chip);
        }

        this.addStrawberries();
    }

    addStrawberries() {
        const strawberryCount = 5;
        
        const baseY = 12;
        const radius = 15;

        for (let i = 0; i < strawberryCount; i++) {
            const strawberryGroup = new Group();
            
            const berryGeometry = new SphereGeometry(1, 16, 16);
            const berryMaterial = new MeshStandardMaterial({ 
                color: 0xFF3030,
                roughness: 0.3,
                metalness: 0.1
            });
            const berry = new Mesh(berryGeometry, berryMaterial);
            berry.scale.set(1.5, 1.5, 1.5);
            strawberryGroup.add(berry);
            
            const leafGeometry = new ConeGeometry(0.5, 1, 4);
            const leafMaterial = new MeshStandardMaterial({ 
                color: 0x228B22,
                roughness: 0.4,
                metalness: 0.1
            });
            const leaf = new Mesh(leafGeometry, leafMaterial);
            leaf.rotation.x = Math.PI / 2;
            leaf.position.y = 1;
            leaf.scale.set(0.8, 0.8, 0.8);
            strawberryGroup.add(leaf);
            
            const angle = (i / strawberryCount) * Math.PI * 2;
            
            strawberryGroup.position.x = Math.cos(angle) * radius;
            strawberryGroup.position.z = Math.sin(angle) * radius;
            strawberryGroup.position.y = baseY;
            
            strawberryGroup.rotation.x = Math.random() * Math.PI * 0.2;
            strawberryGroup.rotation.y = angle;
            strawberryGroup.rotation.z = Math.random() * Math.PI * 0.2;
            
            this.group.add(strawberryGroup);
            
            console.log(`Strawberry ${i} added at:`, strawberryGroup.position);
        }
    }

    createCandles() {
        const geometry = new CylinderGeometry(0.6, 0.6, 8, 16);
        const material = new MeshStandardMaterial({ color: CONSTANTS.COLORS.CANDLE });

        for (let i = 0; i < CONSTANTS.CAKE.CANDLES; i++) {
            const angle = (i / CONSTANTS.CAKE.CANDLES) * Math.PI * 2;
            const position = {
                x: Math.cos(angle) * 10,
                y: 16,
                z: Math.sin(angle) * 10
            };

            const candle = new Mesh(geometry, material);
            candle.position.set(position.x, position.y, position.z);
            this.group.add(candle);
            
            const flame = new Flame(position);
            this.flames.push(flame);
            this.group.add(flame.mesh);
        }
    }

    async extinguishFlames() {
        return new Promise(resolve => {
            console.log("Starting to extinguish flames...");
            
            const duration = 1000;
            const startTime = performance.now();
            
            const animate = () => {
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.flames.forEach(flame => {
                    if (flame.mesh) {
                        flame.mesh.material.opacity = 1 - progress;
                        flame.mesh.scale.set(
                            1 - progress * 0.5,
                            1 - progress,
                            1 - progress * 0.5
                        );
                    }
                    if (flame.light) {
                        flame.light.intensity = 1 - progress;
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.flames.forEach(flame => {
                        if (flame.mesh) flame.mesh.visible = false;
                        if (flame.light) flame.light.visible = false;
                    });
                    console.log("All flames extinguished");
                    resolve();
                }
            };

            animate();
        });
    }
} 