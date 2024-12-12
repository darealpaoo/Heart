import { CylinderGeometry, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import { CONSTANTS } from '../config/constants.js';

export class Flame {
    constructor(position) {
        this.mesh = this.createMesh(position);
        this.startAnimation();
    }

    createMesh(position) {
        const geometry = new CylinderGeometry(0.2, 1, 2, 16);
        const material = new MeshStandardMaterial({
            color: CONSTANTS.COLORS.FLAME,
            emissive: CONSTANTS.COLORS.FLAME,
            emissiveIntensity: 2,
            transparent: true,
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.copy(new Vector3(position.x, position.y + 5, position.z));
        mesh.rotation.x = Math.PI / -180;
        
        return mesh;
    }

    startAnimation() {
        const animate = () => {
            if (this.mesh.material.opacity <= 0) return;
            
            this.mesh.rotation.z = Math.sin(Date.now() * 0.01) * 0.1;
            
            const scaleY = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            const scaleXZ = 1 + Math.cos(Date.now() * 0.005) * 0.1;
            this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);
            
            this.mesh.material.emissiveIntensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    fadeOut() {
        const fadeInterval = setInterval(() => {
            if (this.mesh.material.opacity > 0) {
                this.mesh.material.opacity -= CONSTANTS.ANIMATION.FADE_STEP;
            } else {
                clearInterval(fadeInterval);
                cancelAnimationFrame(this.animationFrame);
                this.mesh.parent?.remove(this.mesh);
                this.dispose();
            }
        }, CONSTANTS.ANIMATION.FADE_INTERVAL);
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
} 