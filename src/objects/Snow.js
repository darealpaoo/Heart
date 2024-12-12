import * as THREE from 'three';

export class Snow {
    constructor(scene) {
        this.scene = scene;
        this.snowflakes = this.createSnow();
    }

    createSnow() {
        const snowCount = 100; // Số lượng tuyết
        const snowGeometry = new THREE.BufferGeometry();
        const snowVertices = new Float32Array(snowCount * 3);

        for (let i = 0; i < snowCount; i++) {
            // Tạo các điểm tuyết ngẫu nhiên
            snowVertices[i * 3] = (Math.random() - 0.5) * 200; // X
            snowVertices[i * 3 + 1] = Math.random() * 200; // Y
            snowVertices[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z
        }

        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowVertices, 3));

        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const snowflakes = new THREE.Points(snowGeometry, snowMaterial);
        this.scene.add(snowflakes);
        return snowflakes;
    }

    updateSnow() {
        const positions = this.snowflakes.geometry.attributes.position.array;

        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.5; // Tăng tốc độ rơi tuyết

            // Reset vị trí tuyết khi rơi xuống
            if (positions[i] < -100) { // Thay đổi điều kiện để reset
                positions[i] = Math.random() * 200; // Reset chiều cao
                positions[i - 1] = (Math.random() - 0.5) * 200; // Reset vị trí X
                positions[i - 2] = (Math.random() - 0.5) * 200; // Reset vị trí Z
            }
        }

        this.snowflakes.geometry.attributes.position.needsUpdate = true; // Cập nhật vị trí
    }
} 