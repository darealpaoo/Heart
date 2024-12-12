import * as THREE from 'three';
import Renderer from "./utils/renderer.js";
import startApp from './utils/app.js';
import { Cake } from './objects/Cake.js';
import { Text3D } from './objects/Text3D.js';
import { FireworkSystem } from './objects/FireworkSystem.js';
import { Snow } from './objects/Snow.js';

class BirthdayScene {
    constructor() {
        this.isFirstClick = true;
        this.init();
    }

    async init() {
        try {
            console.log("Initializing BirthdayScene...");
            this.renderer3 = new Renderer();
            this.setupScene();
            await this.setupApp();
            await this.setupObjects();
            this.setupEventListeners();
            this.renderer3.start();
            console.log("Initialization complete!");
        } catch (error) {
            console.error("Error during initialization:", error);
        }
    }

    setupScene() {
        const { camera } = this.renderer3;
        camera.position.set(0.00, 50, 50.00);
        this.removeLilGui();
    }

    async setupApp() {
        await startApp({ renderer3: this.renderer3 });
    }

    async setupObjects() {
        try {
            console.log("Setting up objects...");
            this.text3D = new Text3D(this.renderer3.scene);
            this.cake = new Cake(this.renderer3.scene);
            this.renderer3.scene.add(this.cake.group);
            this.fireworks = new FireworkSystem(this.renderer3);
            this.snow = new Snow(this.renderer3.scene);
            
            await this.createInitialMessage();
            console.log("Objects setup complete!");
        } catch (error) {
            console.error("Error setting up objects:", error);
        }
    }

    async createInitialMessage() {
        console.log("Creating initial message...");
        this.messageBox = await this.text3D.createMessageBox(true);
    }

    setupEventListeners() {
        const handleInteraction = async (e) => {
            e.preventDefault();
            if (this.isFirstClick) {
                await this.handleInteraction();
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        console.log("Event listeners set up!");
    }

    async handleInteraction() {
        try {
            if (this.isFirstClick && this.messageBox) {
                this.isFirstClick = false;
                console.log("Starting animation sequence...");
                
                // 1. Fade out text chào mừng
                await this.text3D.glitchEffect(this.messageBox);
                
                // 2. Thổi tắt nến
                console.log("Extinguishing candles...");
                await this.cake.extinguishFlames();
                
                // 3. Đợi một chút để tạo khoảng dừng tự nhiên
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 4. Hiển thị text chúc mừng sinh nhật
                console.log("Creating birthday message...");
                this.messageBox = await this.text3D.createMessageBox(false);
                
                // 5. Đợi text hiện ra hoàn toàn
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 6. Bắt đầu pháo hoa
                console.log("Starting fireworks...");
                this.fireworks.start();
            }
        } catch (error) {
            console.error("Error in handleInteraction:", error);
        }
    }

    removeLilGui() {
        const lilGuiElement = document.querySelector('.lil-gui');
        if (lilGuiElement) {
            lilGuiElement.style.display = 'none';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.snow.updateSnow();
    }
}

// Khởi động ứng dụng
console.log("Starting application...");
window.birthdayScene = new BirthdayScene(); // Lưu instance vào window để debug
