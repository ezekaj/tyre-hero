/**
 * TyreHero Interactive 3D Tyre Specification Viewer
 * Advanced Three.js implementation with mobile optimization
 */

class TyreViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            modelPath: 'assets/models/tyre-specs.glb',
            enableControls: true,
            enableHotspots: true,
            autoRotate: false,
            ...options
        };

        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Interactive elements
        this.hotspots = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isInteracting = false;

        // Performance monitoring
        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };

        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTouch = 'ontouchstart' in window;

        // State management
        this.isLoaded = false;
        this.isError = false;
        this.currentSpecView = 'overview';

        this.init();
    }

    async init() {
        try {
            this.showLoadingState();
            await this.setupScene();
            await this.loadModel();
            this.setupControls();
            this.setupHotspots();
            this.setupEventListeners();
            this.setupPerformanceMonitoring();
            this.animate();
            this.hideLoadingState();
            this.isLoaded = true;
            this.onReady();
        } catch (error) {
            console.error('TyreViewer initialization failed:', error);
            this.showErrorState(error);
            this.isError = true;
        }
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // Camera setup - optimized for tyre viewing
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(5, 2, 5);

        // Renderer setup with mobile optimization
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile, // Disable antialiasing on mobile for performance
            alpha: true,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.shadowMap.enabled = !this.isMobile;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.container.appendChild(this.renderer.domElement);

        // Lighting setup
        this.setupLighting();
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = !this.isMobile;
        directionalLight.shadow.mapSize.width = this.isMobile ? 512 : 2048;
        directionalLight.shadow.mapSize.height = this.isMobile ? 512 : 2048;
        this.scene.add(directionalLight);

        // Fill light for better material visibility
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Rim light for definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, -5, 10);
        this.scene.add(rimLight);
    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            
            // Add progress callback
            loader.load(
                this.options.modelPath,
                (gltf) => {
                    this.model = gltf.scene;
                    
                    // Scale and position the model
                    this.model.scale.setScalar(1.5);
                    this.model.position.set(0, -0.5, 0);
                    
                    // Enable shadows if supported
                    if (!this.isMobile) {
                        this.model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                    }

                    // Setup animations if available
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model);
                        this.setupAnimations(gltf.animations);
                    }

                    this.scene.add(this.model);
                    resolve(gltf);
                },
                (progress) => {
                    const percentage = (progress.loaded / progress.total) * 100;
                    this.updateLoadingProgress(percentage);
                },
                (error) => {
                    reject(new Error(`Failed to load 3D model: ${error.message}`));
                }
            );
        });
    }

    setupControls() {
        if (!this.options.enableControls) return;

        // Use OrbitControls for both desktop and mobile
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = false;
        
        // Set limits
        this.controls.minDistance = 2;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI * 0.8;
        this.controls.minPolarAngle = Math.PI * 0.1;

        // Auto-rotate configuration
        this.controls.autoRotate = this.options.autoRotate;
        this.controls.autoRotateSpeed = 1.0;

        // Mobile-specific optimizations
        if (this.isMobile) {
            this.controls.rotateSpeed = 0.5;
            this.controls.zoomSpeed = 0.8;
            this.controls.enableDamping = false; // Disable for better mobile performance
        }
    }

    setupHotspots() {
        if (!this.options.enableHotspots) return;

        // Define tyre specification hotspots
        const hotspotsData = [
            {
                id: 'sidewall',
                position: new THREE.Vector3(-1.2, 0, 0),
                title: 'Sidewall Information',
                description: 'Brand, size, and speed rating information',
                specs: ['Size: 225/45R17', 'Speed Rating: W (270 km/h)', 'Load Index: 94']
            },
            {
                id: 'tread',
                position: new THREE.Vector3(0, 0.8, 0),
                title: 'Tread Pattern',
                description: 'Advanced grip technology for all weather conditions',
                specs: ['Asymmetric Pattern', 'Wet Weather Performance', '3D Sipes Technology']
            },
            {
                id: 'shoulder',
                position: new THREE.Vector3(0.8, 0.3, 0.8),
                title: 'Shoulder Design',
                description: 'Optimized for cornering stability and handling',
                specs: ['Reinforced Construction', 'Heat Dissipation', 'Cornering Stability']
            }
        ];

        hotspotsData.forEach(data => {
            const hotspot = this.createHotspot(data);
            this.hotspots.push(hotspot);
            this.scene.add(hotspot.mesh);
        });
    }

    createHotspot(data) {
        // Create hotspot geometry
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(data.position);
        mesh.userData = data;

        // Add pulsing animation
        const pulseGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.3
        });
        const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        mesh.add(pulseMesh);

        return {
            mesh,
            data,
            pulseMesh,
            isVisible: true
        };
    }

    setupEventListeners() {
        // Resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Mouse/touch interaction handlers
        if (this.isTouch) {
            this.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
            this.renderer.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        } else {
            this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        }

        // Keyboard controls for accessibility
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    setupPerformanceMonitoring() {
        this.performanceMonitor = {
            lastTime: performance.now(),
            frameCount: 0,
            
            update: () => {
                const now = performance.now();
                this.performanceMetrics.frameTime = now - this.performanceMonitor.lastTime;
                this.performanceMonitor.frameCount++;
                
                if (this.performanceMonitor.frameCount % 60 === 0) {
                    this.performanceMetrics.fps = Math.round(1000 / this.performanceMetrics.frameTime);
                    this.optimizePerformance();
                }
                
                this.performanceMonitor.lastTime = now;
            }
        };
    }

    optimizePerformance() {
        const fps = this.performanceMetrics.fps;
        
        // Dynamic quality adjustment based on performance
        if (fps < 30 && this.renderer.getPixelRatio() > 1) {
            this.renderer.setPixelRatio(1);
            console.log('Performance optimization: Reduced pixel ratio');
        }
        
        if (fps < 20) {
            // Disable shadows completely on very low-end devices
            this.renderer.shadowMap.enabled = false;
            console.log('Performance optimization: Disabled shadows');
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update performance monitoring
        this.performanceMonitor.update();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update animations
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }

        // Update hotspot animations
        this.updateHotspots();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    updateHotspots() {
        const time = this.clock.getElapsedTime();
        
        this.hotspots.forEach(hotspot => {
            if (hotspot.isVisible) {
                // Pulsing animation
                const scale = 1 + Math.sin(time * 3) * 0.2;
                hotspot.pulseMesh.scale.setScalar(scale);
                
                // Opacity animation
                hotspot.pulseMaterial.opacity = 0.3 + Math.sin(time * 3) * 0.1;
            }
        });
    }

    // Event Handlers
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onMouseDown(event) {
        this.isInteracting = true;
        this.updateMousePosition(event);
        this.checkHotspotIntersection();
    }

    onMouseUp() {
        this.isInteracting = false;
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
        if (!this.isInteracting) {
            this.checkHotspotHover();
        }
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isInteracting = true;
            this.updateTouchPosition(event.touches[0]);
            this.checkHotspotIntersection();
        }
    }

    onTouchEnd() {
        this.isInteracting = false;
    }

    onKeyDown(event) {
        // Accessibility: Keyboard navigation
        switch(event.key) {
            case 'ArrowLeft':
                this.rotateModel(-0.1, 0);
                break;
            case 'ArrowRight':
                this.rotateModel(0.1, 0);
                break;
            case 'ArrowUp':
                this.rotateModel(0, 0.1);
                break;
            case 'ArrowDown':
                this.rotateModel(0, -0.1);
                break;
            case ' ':
                event.preventDefault();
                this.cycleHotspots();
                break;
        }
    }

    updateMousePosition(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    updateTouchPosition(touch) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    }

    checkHotspotIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const hotspotMeshes = this.hotspots.map(h => h.mesh);
        const intersects = this.raycaster.intersectObjects(hotspotMeshes);
        
        if (intersects.length > 0) {
            const hotspot = this.hotspots.find(h => h.mesh === intersects[0].object);
            if (hotspot) {
                this.showSpecificationPanel(hotspot.data);
                this.trackInteraction('hotspot_click', hotspot.data.id);
            }
        }
    }

    checkHotspotHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const hotspotMeshes = this.hotspots.map(h => h.mesh);
        const intersects = this.raycaster.intersectObjects(hotspotMeshes);
        
        // Reset all hotspots
        this.hotspots.forEach(hotspot => {
            hotspot.mesh.material.opacity = 0.8;
            hotspot.mesh.scale.setScalar(1);
        });
        
        // Highlight hovered hotspot
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            mesh.material.opacity = 1;
            mesh.scale.setScalar(1.2);
            this.container.style.cursor = 'pointer';
        } else {
            this.container.style.cursor = 'grab';
        }
    }

    // UI Methods
    showLoadingState() {
        const loadingHTML = `
            <div id="tyre-viewer-loading" class="tyre-viewer-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading 3D Tyre Model...</div>
                <div class="loading-progress">
                    <div class="progress-bar" id="loading-progress-bar"></div>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', loadingHTML);
    }

    updateLoadingProgress(percentage) {
        const progressBar = document.getElementById('loading-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    hideLoadingState() {
        const loading = document.getElementById('tyre-viewer-loading');
        if (loading) {
            loading.remove();
        }
    }

    showErrorState(error) {
        const errorHTML = `
            <div id="tyre-viewer-error" class="tyre-viewer-overlay">
                <div class="error-icon">⚠️</div>
                <div class="error-title">3D Viewer Unavailable</div>
                <div class="error-message">Unable to load 3D tyre model. Please check your connection and try again.</div>
                <button onclick="window.location.reload()" class="retry-button">Retry</button>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', errorHTML);
    }

    showSpecificationPanel(data) {
        // Remove existing panel
        this.hideSpecificationPanel();
        
        const panelHTML = `
            <div id="spec-panel" class="specification-panel">
                <div class="spec-header">
                    <h3>${data.title}</h3>
                    <button class="close-btn" onclick="tyreViewer.hideSpecificationPanel()">×</button>
                </div>
                <div class="spec-content">
                    <p class="spec-description">${data.description}</p>
                    <ul class="spec-list">
                        ${data.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                    <div class="spec-actions">
                        <button class="get-quote-btn" onclick="tyreViewer.requestQuote('${data.id}')">
                            Get Quote for This Specification
                        </button>
                        <button class="learn-more-btn" onclick="tyreViewer.learnMore('${data.id}')">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', panelHTML);
        
        // Animate panel in
        setTimeout(() => {
            const panel = document.getElementById('spec-panel');
            if (panel) panel.classList.add('visible');
        }, 10);
    }

    hideSpecificationPanel() {
        const panel = document.getElementById('spec-panel');
        if (panel) {
            panel.remove();
        }
    }

    // Business Integration Methods
    requestQuote(specId) {
        this.trackInteraction('quote_request', specId);
        
        // Integrate with existing booking flow
        if (typeof window.openBookingFlow === 'function') {
            window.openBookingFlow({
                source: '3d_viewer',
                specification: specId,
                category: 'tyre_specs'
            });
        } else {
            // Fallback: redirect to contact form
            window.location.href = `#contact?spec=${specId}`;
        }
    }

    learnMore(specId) {
        this.trackInteraction('learn_more', specId);
        
        // Show educational content
        const educationalContent = this.getEducationalContent(specId);
        this.showEducationalModal(educationalContent);
    }

    getEducationalContent(specId) {
        const content = {
            sidewall: {
                title: 'Understanding Tyre Sidewall Information',
                content: `
                    <h4>Size Marking (225/45R17)</h4>
                    <p><strong>225</strong> - Tyre width in millimeters</p>
                    <p><strong>45</strong> - Aspect ratio (sidewall height as % of width)</p>
                    <p><strong>R</strong> - Radial construction</p>
                    <p><strong>17</strong> - Wheel diameter in inches</p>
                    
                    <h4>Speed Rating</h4>
                    <p>W-rated tyres are tested up to 270 km/h, providing excellent high-speed stability and safety.</p>
                `
            },
            tread: {
                title: 'Advanced Tread Pattern Technology',
                content: `
                    <h4>Asymmetric Design</h4>
                    <p>Different patterns on inner and outer sections optimize performance for various driving conditions.</p>
                    
                    <h4>3D Sipes</h4>
                    <p>Microscopic cuts in the tread blocks improve grip on wet and icy surfaces.</p>
                    
                    <h4>Performance Benefits</h4>
                    <ul>
                        <li>Superior wet weather braking</li>
                        <li>Enhanced cornering stability</li>
                        <li>Reduced road noise</li>
                    </ul>
                `
            },
            shoulder: {
                title: 'Shoulder Construction & Performance',
                content: `
                    <h4>Reinforced Structure</h4>
                    <p>High-strength materials resist deformation during aggressive cornering.</p>
                    
                    <h4>Heat Management</h4>
                    <p>Advanced compounds dissipate heat effectively, extending tyre life.</p>
                    
                    <h4>Handling Benefits</h4>
                    <ul>
                        <li>Precise steering response</li>
                        <li>Consistent performance at speed</li>
                        <li>Improved fuel efficiency</li>
                    </ul>
                `
            }
        };
        
        return content[specId] || content.sidewall;
    }

    showEducationalModal(content) {
        const modalHTML = `
            <div id="education-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${content.title}</h2>
                        <button class="close-btn" onclick="tyreViewer.closeEducationalModal()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content.content}
                        <div class="modal-actions">
                            <button class="primary-btn" onclick="tyreViewer.requestQuote('education')">
                                Get Professional Advice
                            </button>
                            <button class="secondary-btn" onclick="tyreViewer.closeEducationalModal()">
                                Continue Exploring
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeEducationalModal() {
        const modal = document.getElementById('education-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // Utility Methods
    rotateModel(deltaX, deltaY) {
        if (this.model) {
            this.model.rotation.y += deltaX;
            this.model.rotation.x += deltaY;
        }
    }

    cycleHotspots() {
        const currentIndex = this.hotspots.findIndex(h => h.isActive);
        const nextIndex = (currentIndex + 1) % this.hotspots.length;
        
        // Reset all hotspots
        this.hotspots.forEach(h => h.isActive = false);
        
        // Activate next hotspot
        this.hotspots[nextIndex].isActive = true;
        this.showSpecificationPanel(this.hotspots[nextIndex].data);
    }

    trackInteraction(action, detail) {
        // Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: '3d_tyre_viewer',
                event_label: detail,
                custom_map: { 'custom_dimension_1': this.isMobile ? 'mobile' : 'desktop' }
            });
        }
        
        // Custom analytics
        if (window.tyreHeroAnalytics) {
            window.tyreHeroAnalytics.track('3d_viewer_interaction', {
                action,
                detail,
                device: this.isMobile ? 'mobile' : 'desktop',
                timestamp: Date.now()
            });
        }
    }

    // Accessibility Methods
    setupAccessibility() {
        // Add ARIA labels and roles
        this.renderer.domElement.setAttribute('role', 'img');
        this.renderer.domElement.setAttribute('aria-label', '3D interactive tyre model');
        this.renderer.domElement.setAttribute('tabindex', '0');
        
        // Add keyboard navigation instructions
        const instructionsHTML = `
            <div class="viewer-instructions" id="viewer-instructions">
                <p>Use arrow keys to rotate model, spacebar to cycle through specifications</p>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', instructionsHTML);
    }

    // Public API Methods
    setSpecificationView(viewType) {
        this.currentSpecView = viewType;
        
        switch(viewType) {
            case 'overview':
                this.camera.position.set(5, 2, 5);
                break;
            case 'sidewall':
                this.camera.position.set(-3, 0, 1);
                break;
            case 'tread':
                this.camera.position.set(0, 5, 0);
                break;
        }
        
        this.controls.update();
    }

    toggleAutoRotate() {
        if (this.controls) {
            this.controls.autoRotate = !this.controls.autoRotate;
        }
    }

    resetView() {
        this.camera.position.set(5, 2, 5);
        this.controls.reset();
        this.hideSpecificationPanel();
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    // Callbacks
    onReady() {
        // Dispatch custom event
        const event = new CustomEvent('tyreViewerReady', {
            detail: { viewer: this }
        });
        document.dispatchEvent(event);
        
        // Setup accessibility after everything is loaded
        this.setupAccessibility();
    }

    // Cleanup
    destroy() {
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Global instance for easy access
window.TyreViewer = TyreViewer;

// Auto-initialization if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tyre-viewer-container');
    if (container) {
        window.tyreViewer = new TyreViewer('tyre-viewer-container', {
            autoRotate: true,
            enableHotspots: true
        });
    }
});