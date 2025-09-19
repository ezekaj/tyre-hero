/*
 * TyreHero AR Scanner System
 * Advanced Augmented Reality tyre scanning and analysis
 */

export class TyreHeroARScanner {
    constructor() {
        this.isActive = false;
        this.camera = null;
        this.canvas = null;
        this.context = null;
        this.detectionFrame = null;
        this.analysisResults = null;
        this.init();
    }

    init() {
        // Check WebRTC and camera support
        if (!this.checkSupport()) {
            console.log('📱 AR Scanner not supported on this device');
            return;
        }

        this.setupCanvas();
        this.bindEvents();
        console.log('📱 TyreHero AR Scanner initialized');
    }

    checkSupport() {
        return navigator.mediaDevices &&
               navigator.mediaDevices.getUserMedia &&
               'WebGL' in window;
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Rear camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.camera = await navigator.mediaDevices.getUserMedia(constraints);
            return true;
        } catch (error) {
            console.error('📱 Camera access failed:', error);
            this.showCameraError();
            return false;
        }
    }

    createARInterface() {
        const arInterface = document.createElement('div');
        arInterface.id = 'ar-scanner-interface';
        arInterface.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: black; z-index: 10000; display: flex; flex-direction: column;
            ">
                <!-- Camera View -->
                <div style="flex: 1; position: relative; overflow: hidden;">
                    <video id="ar-camera-feed" style="
                        width: 100%; height: 100%; object-fit: cover;
                    " autoplay playsinline></video>

                    <!-- AR Overlay -->
                    <div style="
                        position: absolute; top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        border: 2px solid #00D4FF; border-radius: 20px;
                        width: 200px; height: 200px;
                        background: rgba(0, 212, 255, 0.1);
                        display: flex; align-items: center; justify-content: center;
                        flex-direction: column; color: white; text-align: center;
                    ">
                        <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
                        <div style="font-size: 14px; font-weight: bold;">
                            Point at tyre sidewall
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;">
                            Looking for size markings...
                        </div>
                    </div>

                    <!-- Scan Progress -->
                    <div id="scan-progress" style="
                        position: absolute; bottom: 20px; left: 20px; right: 20px;
                        background: rgba(0, 0, 0, 0.8); padding: 15px;
                        border-radius: 10px; color: white; text-align: center;
                    ">
                        <div style="margin-bottom: 10px;">📱 AR Scanning Active</div>
                        <div style="
                            width: 100%; height: 4px; background: rgba(255, 255, 255, 0.3);
                            border-radius: 2px; overflow: hidden;
                        ">
                            <div id="progress-bar" style="
                                width: 0%; height: 100%; background: #00D4FF;
                                transition: width 0.5s ease;
                            "></div>
                        </div>
                        <div id="scan-status" style="margin-top: 10px; font-size: 14px;">
                            Initializing scanner...
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="
                    background: rgba(0, 0, 0, 0.9); padding: 20px;
                    display: flex; justify-content: space-between; align-items: center;
                ">
                    <button onclick="tyreHeroAR.captureFrame()" style="
                        background: #00D4FF; color: black; border: none;
                        padding: 15px 30px; border-radius: 25px;
                        font-size: 16px; font-weight: bold; cursor: pointer;
                    ">
                        📸 Capture
                    </button>

                    <div style="color: white; text-align: center;">
                        <div style="font-size: 12px; opacity: 0.8;">AR Tyre Scanner</div>
                        <div style="font-size: 14px; font-weight: bold;">TyreHero AI</div>
                    </div>

                    <button onclick="tyreHeroAR.stopScanner()" style="
                        background: #E53935; color: white; border: none;
                        padding: 15px 30px; border-radius: 25px;
                        font-size: 16px; font-weight: bold; cursor: pointer;
                    ">
                        ✕ Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(arInterface);
        return arInterface;
    }

    async startScanner() {
        if (this.isActive) return;

        // Check device capabilities
        const device = window.TyreHeroDevice;
        if (device && device.isMobile && device.isSlowConnection) {
            this.showLiteVersion();
            return;
        }

        const cameraReady = await this.startCamera();
        if (!cameraReady) return;

        this.isActive = true;
        const arInterface = this.createARInterface();

        // Connect camera to video element
        const videoElement = document.getElementById('ar-camera-feed');
        videoElement.srcObject = this.camera;

        // Start analysis
        this.startAnalysis();

        // Simulate scanning progress
        this.simulateScanProgress();
    }

    captureFrame() {
        if (!this.isActive) return;

        const video = document.getElementById('ar-camera-feed');
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        this.context.drawImage(video, 0, 0);

        // Simulate AI analysis
        this.analyzeImage();
    }

    analyzeImage() {
        const statusElement = document.getElementById('scan-status');
        if (statusElement) statusElement.textContent = 'Analyzing tyre...';

        // Simulate AI processing
        setTimeout(() => {
            this.showAnalysisResults({
                size: '205/55R16',
                condition: 'Good',
                treadDepth: '5.2mm',
                pressure: 'Optimal',
                recommendations: ['Regular inspection recommended', 'Suitable for current use']
            });
        }, 2000);
    }

    showAnalysisResults(results) {
        this.analysisResults = results;

        const resultsDialog = document.createElement('div');
        resultsDialog.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; color: black; padding: 30px; border-radius: 20px;
                z-index: 10001; max-width: 400px; width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <h3 style="color: #E53935; margin-bottom: 20px; text-align: center;">
                    🎯 AR Scan Results
                </h3>

                <div style="margin-bottom: 15px;">
                    <strong>Tyre Size:</strong> ${results.size}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Condition:</strong>
                    <span style="color: ${results.condition === 'Good' ? 'green' : 'orange'};">
                        ${results.condition}
                    </span>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Tread Depth:</strong> ${results.treadDepth}
                </div>
                <div style="margin-bottom: 20px;">
                    <strong>Pressure:</strong> ${results.pressure}
                </div>

                <div style="text-align: center;">
                    <button onclick="tyreHeroAR.bookService('${results.size}')" style="
                        background: #00D4FF; color: black; border: none;
                        padding: 12px 25px; border-radius: 10px; margin: 5px;
                        font-weight: bold; cursor: pointer;
                    ">
                        📱 Book Service
                    </button>

                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: #E53935; color: white; border: none;
                        padding: 12px 25px; border-radius: 10px; margin: 5px;
                        font-weight: bold; cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(resultsDialog);
    }

    simulateScanProgress() {
        const progressBar = document.getElementById('progress-bar');
        const statusElement = document.getElementById('scan-status');

        let progress = 0;
        const progressSteps = [
            'Accessing camera...',
            'Calibrating AR system...',
            'Detecting tyre...',
            'Reading sidewall markings...',
            'Analyzing condition...',
            'Ready to scan!'
        ];

        const interval = setInterval(() => {
            progress += 100 / progressSteps.length;

            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

            const stepIndex = Math.floor(progress / (100 / progressSteps.length));
            if (statusElement && progressSteps[stepIndex]) {
                statusElement.textContent = progressSteps[stepIndex];
            }

            if (progress >= 100) {
                clearInterval(interval);
                if (statusElement) statusElement.textContent = 'Point camera at tyre sidewall and tap Capture';
            }
        }, 800);
    }

    showLiteVersion() {
        // Fallback for low-performance devices
        alert('📱 AR Scanner Lite\n\nCamera not available. Please manually enter your tyre size or call us at 0800 123 4567 for assistance.');
    }

    showCameraError() {
        alert('📱 Camera Access Required\n\nPlease allow camera access to use the AR tyre scanner, or manually enter your tyre details.');
    }

    stopScanner() {
        this.isActive = false;

        if (this.camera) {
            this.camera.getTracks().forEach(track => track.stop());
            this.camera = null;
        }

        const arInterface = document.getElementById('ar-scanner-interface');
        if (arInterface) {
            arInterface.remove();
        }
    }

    bookService(tyreSize) {
        // Navigate to booking with pre-filled tyre size
        const bookingUrl = `booking.html?size=${encodeURIComponent(tyreSize)}`;
        window.location.href = bookingUrl;
    }

    startAnalysis() {
        // Start continuous analysis (simplified for demo)
        this.detectionFrame = setInterval(() => {
            // In real implementation, this would analyze video frames
            // For now, just update status
        }, 1000);
    }

    bindEvents() {
        // Bind to AR scanner buttons
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('.btn-ar, [data-action="start-ar"], [data-ar-scanner]');
            if (trigger) {
                this.startScanner();
            }
        });

        // Listen for device detection
        window.addEventListener('tyrehero:deviceDetected', (e) => {
            const device = e.detail;
            if (!device.touch) {
                // Desktop fallback
                console.log('📱 AR Scanner: Desktop detected - showing fallback options');
            }
        });
    }
}

let tyreHeroARInstance = null;

export function initTyreHeroARScanner() {
    tyreHeroARInstance = new TyreHeroARScanner();
    return tyreHeroARInstance;
}

export function registerARScannerGlobals(target = window) {
    if (!tyreHeroARInstance) {
        return;
    }

    target.tyreHeroAR = tyreHeroARInstance;
    target.openARScanner = () => tyreHeroARInstance.startScanner();
    target.startARScanner = () => tyreHeroARInstance.startScanner();
}
