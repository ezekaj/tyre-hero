/**
 * Mobile Debug Console for Emergency Tyre Service
 * Real-device testing and debugging tools for mobile hero backgrounds
 *
 * Helps debug mobile-specific issues that don't appear in desktop dev tools
 */

class MobileDebugConsole {
    constructor(options = {}) {
        this.options = {
            enabled: true,
            position: 'bottom-right',
            showPerformance: true,
            showDevice: true,
            showTouch: true,
            showViewport: true,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            maxLogs: 100,
            ...options
        };

        this.logs = [];
        this.performanceData = {
            frameDrops: 0,
            averageFPS: 60,
            memoryUsage: 0,
            batteryLevel: 1,
            networkSpeed: 'unknown'
        };

        this.deviceData = {
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio || 1,
            touch: 'ontouchstart' in window,
            orientation: screen.orientation?.type || 'unknown',
            battery: null,
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown',
            connection: navigator.connection?.effectiveType || 'unknown'
        };

        this.touchData = {
            touches: [],
            lastTouch: null,
            touchStart: null,
            gestures: []
        };

        this.viewportData = {
            width: window.innerWidth,
            height: window.innerHeight,
            safeAreaTop: 0,
            safeAreaBottom: 0,
            safeAreaLeft: 0,
            safeAreaRight: 0
        };

        if (this.options.enabled) {
            this.init();
        }
    }

    init() {
        this.createDebugConsole();
        this.setupEventListeners();
        this.startPerformanceMonitoring();
        this.detectDeviceCapabilities();
        this.setupKeyboardShortcuts();
        this.addConsoleStyles();

        this.log('Mobile Debug Console initialized', 'info');
        this.log(`Device: ${this.getDeviceType()}`, 'info');
        this.log(`Viewport: ${this.deviceData.viewportSize}`, 'info');
    }

    createDebugConsole() {
        this.console = document.createElement('div');
        this.console.id = 'mobile-debug-console';
        this.console.className = 'mobile-debug-console';

        this.console.innerHTML = `
            <div class="debug-header">
                <span class="debug-title">📱 Mobile Debug</span>
                <div class="debug-controls">
                    <button class="debug-btn" data-action="clear">🗑️</button>
                    <button class="debug-btn" data-action="export">💾</button>
                    <button class="debug-btn" data-action="toggle">👁️</button>
                    <button class="debug-btn" data-action="close">❌</button>
                </div>
            </div>

            <div class="debug-tabs">
                <button class="debug-tab active" data-tab="logs">Logs</button>
                <button class="debug-tab" data-tab="device">Device</button>
                <button class="debug-tab" data-tab="performance">Performance</button>
                <button class="debug-tab" data-tab="touch">Touch</button>
                <button class="debug-tab" data-tab="viewport">Viewport</button>
            </div>

            <div class="debug-content">
                <div class="debug-panel active" data-panel="logs">
                    <div class="debug-logs"></div>
                </div>

                <div class="debug-panel" data-panel="device">
                    <div class="debug-device-info"></div>
                </div>

                <div class="debug-panel" data-panel="performance">
                    <div class="debug-performance-info"></div>
                </div>

                <div class="debug-panel" data-panel="touch">
                    <div class="debug-touch-info"></div>
                    <canvas class="touch-visualizer" width="200" height="150"></canvas>
                </div>

                <div class="debug-panel" data-panel="viewport">
                    <div class="debug-viewport-info"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.console);
        this.setupConsoleInteractions();
    }

    setupConsoleInteractions() {
        // Tab switching
        this.console.addEventListener('click', (e) => {
            if (e.target.classList.contains('debug-tab')) {
                this.switchTab(e.target.dataset.tab);
            }

            if (e.target.classList.contains('debug-btn')) {
                this.handleAction(e.target.dataset.action);
            }
        });

        // Make draggable on mobile
        this.makeDraggable(this.console);
    }

    switchTab(tabName) {
        // Update active tab
        this.console.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update active panel
        this.console.querySelectorAll('.debug-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabName);
        });

        // Update panel content
        this.updatePanelContent(tabName);
    }

    updatePanelContent(panelName) {
        switch (panelName) {
            case 'device':
                this.updateDevicePanel();
                break;
            case 'performance':
                this.updatePerformancePanel();
                break;
            case 'touch':
                this.updateTouchPanel();
                break;
            case 'viewport':
                this.updateViewportPanel();
                break;
        }
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clearLogs();
                break;
            case 'export':
                this.exportLogs();
                break;
            case 'toggle':
                this.toggleVisibility();
                break;
            case 'close':
                this.hide();
                break;
        }
    }

    log(message, level = 'info', data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            level,
            data,
            id: Date.now() + Math.random()
        };

        this.logs.push(logEntry);

        // Limit log history
        if (this.logs.length > this.options.maxLogs) {
            this.logs.shift();
        }

        // Update logs panel if visible
        const logsPanel = this.console?.querySelector('.debug-logs');
        if (logsPanel) {
            this.updateLogsPanel();
        }

        // Console output for debugging
        console[level](message, data);
    }

    updateLogsPanel() {
        const logsPanel = this.console.querySelector('.debug-logs');
        if (!logsPanel) return;

        logsPanel.innerHTML = this.logs.map(log => `
            <div class="debug-log-entry ${log.level}">
                <span class="log-time">${log.timestamp}</span>
                <span class="log-level">${log.level.toUpperCase()}</span>
                <span class="log-message">${log.message}</span>
                ${log.data ? `<pre class="log-data">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
            </div>
        `).join('');

        // Auto-scroll to bottom
        logsPanel.scrollTop = logsPanel.scrollHeight;
    }

    setupEventListeners() {
        // Touch events for touch panel
        document.addEventListener('touchstart', (e) => this.trackTouch(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.trackTouch(e), { passive: true });
        document.addEventListener('touchend', (e) => this.trackTouch(e), { passive: true });

        // Viewport changes
        window.addEventListener('resize', () => this.trackViewportChange());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.trackViewportChange(), 100);
        });

        // Network changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.deviceData.connection = navigator.connection.effectiveType;
                this.log(`Network changed to: ${this.deviceData.connection}`, 'info');
            });
        }

        // Battery changes
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.deviceData.battery = battery;
                battery.addEventListener('levelchange', () => {
                    this.performanceData.batteryLevel = battery.level;
                    this.log(`Battery level: ${Math.round(battery.level * 100)}%`, 'info');
                });
            });
        }

        // Page visibility for performance monitoring
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.log('Page hidden', 'debug');
            } else {
                this.log('Page visible', 'debug');
            }
        });
    }

    trackTouch(e) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;

        const touchData = {
            type: e.type,
            timestamp: Date.now(),
            x: touch.clientX,
            y: touch.clientY,
            pressure: touch.force || 0,
            target: e.target.tagName || 'unknown'
        };

        this.touchData.touches.push(touchData);
        this.touchData.lastTouch = touchData;

        // Limit touch history
        if (this.touchData.touches.length > 50) {
            this.touchData.touches.shift();
        }

        // Detect gestures
        this.detectGestures(touchData);

        // Update touch visualizer
        this.updateTouchVisualizer();
    }

    detectGestures(touchData) {
        if (touchData.type === 'touchstart') {
            this.touchData.touchStart = touchData;
        } else if (touchData.type === 'touchend' && this.touchData.touchStart) {
            const duration = touchData.timestamp - this.touchData.touchStart.timestamp;
            const deltaX = touchData.x - this.touchData.touchStart.x;
            const deltaY = touchData.y - this.touchData.touchStart.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            let gesture = 'tap';
            if (duration > 500) gesture = 'long-press';
            if (distance > 30) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    gesture = deltaX > 0 ? 'swipe-right' : 'swipe-left';
                } else {
                    gesture = deltaY > 0 ? 'swipe-down' : 'swipe-up';
                }
            }

            this.touchData.gestures.push({
                gesture,
                duration,
                distance,
                timestamp: touchData.timestamp
            });

            this.log(`Gesture: ${gesture} (${duration}ms, ${Math.round(distance)}px)`, 'debug');
        }
    }

    trackViewportChange() {
        const oldViewport = { ...this.viewportData };

        this.viewportData = {
            width: window.innerWidth,
            height: window.innerHeight,
            safeAreaTop: this.getSafeAreaInset('top'),
            safeAreaBottom: this.getSafeAreaInset('bottom'),
            safeAreaLeft: this.getSafeAreaInset('left'),
            safeAreaRight: this.getSafeAreaInset('right')
        };

        if (oldViewport.width !== this.viewportData.width ||
            oldViewport.height !== this.viewportData.height) {
            this.log(`Viewport changed: ${this.viewportData.width}x${this.viewportData.height}`, 'info');
        }
    }

    getSafeAreaInset(side) {
        const computed = getComputedStyle(document.documentElement);
        const value = computed.getPropertyValue(`env(safe-area-inset-${side})`);
        return parseInt(value) || 0;
    }

    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = [];

        const measurePerformance = (currentTime) => {
            frameCount++;
            const delta = currentTime - lastTime;

            if (delta >= 1000) { // Every second
                const currentFPS = Math.round((frameCount * 1000) / delta);
                fps.push(currentFPS);

                if (fps.length > 10) fps.shift(); // Keep last 10 readings

                this.performanceData.averageFPS = Math.round(
                    fps.reduce((a, b) => a + b, 0) / fps.length
                );

                if (currentFPS < 30) {
                    this.performanceData.frameDrops++;
                    this.log(`Low FPS detected: ${currentFPS}`, 'warn');
                }

                frameCount = 0;
                lastTime = currentTime;

                // Update memory usage if available
                if (performance.memory) {
                    this.performanceData.memoryUsage = Math.round(
                        performance.memory.usedJSHeapSize / 1024 / 1024
                    );
                }
            }

            requestAnimationFrame(measurePerformance);
        };

        requestAnimationFrame(measurePerformance);
    }

    detectDeviceCapabilities() {
        // More detailed device detection
        this.deviceData.capabilities = {
            webgl: this.detectWebGL(),
            webgl2: this.detectWebGL2(),
            webgpu: this.detectWebGPU(),
            serviceWorker: 'serviceWorker' in navigator,
            webAssembly: typeof WebAssembly === 'object',
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            customElements: 'customElements' in window,
            webComponents: 'customElements' in window && 'attachShadow' in Element.prototype,
            css3d: this.detectCSS3D(),
            cssGrid: CSS.supports('display', 'grid'),
            cssCustomProps: CSS.supports('--custom', 'property'),
            passiveEvents: this.detectPassiveEvents()
        };

        this.log('Device capabilities detected', 'info', this.deviceData.capabilities);
    }

    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    detectWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }

    async detectWebGPU() {
        if (!navigator.gpu) return false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch (e) {
            return false;
        }
    }

    detectCSS3D() {
        const div = document.createElement('div');
        div.style.transform = 'translate3d(0,0,0)';
        return div.style.transform !== '';
    }

    detectPassiveEvents() {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassive;
    }

    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (/ipad/.test(ua)) return 'iPad';
        if (/iphone/.test(ua)) return 'iPhone';
        if (/android/.test(ua)) {
            if (/tablet/.test(ua)) return 'Android Tablet';
            return 'Android Phone';
        }
        if (/windows phone/.test(ua)) return 'Windows Phone';
        if (/mobile/.test(ua)) return 'Mobile Device';
        return 'Desktop/Unknown';
    }

    updateDevicePanel() {
        const panel = this.console.querySelector('.debug-device-info');
        if (!panel) return;

        panel.innerHTML = `
            <div class="info-section">
                <h4>Device Information</h4>
                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${this.getDeviceType()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Screen:</span>
                        <span class="info-value">${this.deviceData.screenSize}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Viewport:</span>
                        <span class="info-value">${this.deviceData.viewportSize}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Pixel Ratio:</span>
                        <span class="info-value">${this.deviceData.pixelRatio}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Touch:</span>
                        <span class="info-value">${this.deviceData.touch ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Memory:</span>
                        <span class="info-value">${this.deviceData.memory} GB</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CPU Cores:</span>
                        <span class="info-value">${this.deviceData.cores}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Connection:</span>
                        <span class="info-value">${this.deviceData.connection}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Orientation:</span>
                        <span class="info-value">${this.deviceData.orientation}</span>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h4>Browser Capabilities</h4>
                <div class="capabilities-grid">
                    ${Object.entries(this.deviceData.capabilities || {}).map(([key, value]) => `
                        <div class="capability-item ${value ? 'supported' : 'not-supported'}">
                            <span class="capability-name">${key}</span>
                            <span class="capability-status">${value ? '✓' : '✗'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updatePerformancePanel() {
        const panel = this.console.querySelector('.debug-performance-info');
        if (!panel) return;

        panel.innerHTML = `
            <div class="performance-metrics">
                <div class="metric">
                    <span class="metric-label">Average FPS</span>
                    <span class="metric-value ${this.performanceData.averageFPS < 30 ? 'warn' : 'good'}">${this.performanceData.averageFPS}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Frame Drops</span>
                    <span class="metric-value ${this.performanceData.frameDrops > 5 ? 'warn' : 'good'}">${this.performanceData.frameDrops}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Memory Usage</span>
                    <span class="metric-value">${this.performanceData.memoryUsage} MB</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Battery Level</span>
                    <span class="metric-value">${Math.round(this.performanceData.batteryLevel * 100)}%</span>
                </div>
            </div>

            <div class="performance-actions">
                <button onclick="window.mobileDebugConsole.testHeroBackground()">Test Hero Background</button>
                <button onclick="window.mobileDebugConsole.stressTest()">Stress Test</button>
                <button onclick="gc && gc()">Force GC</button>
            </div>
        `;
    }

    updateTouchPanel() {
        const panel = this.console.querySelector('.debug-touch-info');
        if (!panel) return;

        const recentTouches = this.touchData.touches.slice(-10);
        const recentGestures = this.touchData.gestures.slice(-5);

        panel.innerHTML = `
            <div class="touch-stats">
                <div class="stat">Total Touches: ${this.touchData.touches.length}</div>
                <div class="stat">Gestures: ${this.touchData.gestures.length}</div>
                ${this.touchData.lastTouch ? `
                    <div class="stat">Last Touch: ${this.touchData.lastTouch.x}, ${this.touchData.lastTouch.y}</div>
                ` : ''}
            </div>

            <div class="recent-gestures">
                <h5>Recent Gestures:</h5>
                ${recentGestures.map(g => `
                    <div class="gesture-item">${g.gesture} (${g.duration}ms)</div>
                `).join('')}
            </div>
        `;
    }

    updateTouchVisualizer() {
        const canvas = this.console.querySelector('.touch-visualizer');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw recent touches as a heatmap
        const recentTouches = this.touchData.touches.slice(-20);
        const scaleX = canvas.width / window.innerWidth;
        const scaleY = canvas.height / window.innerHeight;

        recentTouches.forEach((touch, index) => {
            const opacity = (index + 1) / recentTouches.length;
            const size = touch.pressure ? 5 + touch.pressure * 10 : 5;

            ctx.beginPath();
            ctx.arc(touch.x * scaleX, touch.y * scaleY, size, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(255, 100, 100, ${opacity})`;
            ctx.fill();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D to toggle debug console
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                e.preventDefault();
                this.toggle();
            }

            // Ctrl+Shift+C to clear logs
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
                e.preventDefault();
                this.clearLogs();
            }
        });
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, elementX, elementY;

        const header = element.querySelector('.debug-header');

        header.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;

            const rect = element.getBoundingClientRect();
            elementX = rect.left;
            elementY = rect.top;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            element.style.left = `${elementX + deltaX}px`;
            element.style.top = `${elementY + deltaY}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Test methods
    testHeroBackground() {
        this.log('Testing hero background performance...', 'info');

        // Simulate heavy load
        const startTime = performance.now();
        let iterations = 0;

        const testFrame = () => {
            iterations++;

            // Simulate complex calculations
            for (let i = 0; i < 1000; i++) {
                Math.sin(i * Math.PI / 180);
            }

            if (iterations < 60) { // Test for 1 second at 60fps
                requestAnimationFrame(testFrame);
            } else {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const fps = Math.round(60000 / duration);

                this.log(`Background test completed: ${fps} FPS`, fps < 30 ? 'warn' : 'info');
            }
        };

        requestAnimationFrame(testFrame);
    }

    stressTest() {
        this.log('Starting stress test...', 'warn');

        // Create many DOM elements to stress test
        const container = document.createElement('div');
        container.style.cssText = 'position: fixed; top: -9999px; left: -9999px;';

        for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div');
            div.style.cssText = `
                width: 10px; height: 10px; background: red;
                transform: rotate(${i}deg) scale(${Math.random()});
                position: absolute; top: ${i}px; left: ${i}px;
            `;
            container.appendChild(div);
        }

        document.body.appendChild(container);

        setTimeout(() => {
            container.remove();
            this.log('Stress test completed', 'info');
        }, 3000);
    }

    // Public API
    show() {
        this.console.style.display = 'block';
        this.console.style.opacity = '1';
    }

    hide() {
        this.console.style.opacity = '0';
        setTimeout(() => {
            this.console.style.display = 'none';
        }, 300);
    }

    toggle() {
        if (this.console.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    toggleVisibility() {
        this.console.classList.toggle('minimized');
    }

    clearLogs() {
        this.logs = [];
        this.updateLogsPanel();
        this.log('Logs cleared', 'info');
    }

    exportLogs() {
        const exportData = {
            timestamp: new Date().toISOString(),
            device: this.deviceData,
            performance: this.performanceData,
            viewport: this.viewportData,
            logs: this.logs
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `mobile-debug-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.log('Debug data exported', 'info');
    }

    addConsoleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-debug-console {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                max-height: 400px;
                background: rgba(0, 0, 0, 0.95);
                color: white;
                font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                font-size: 12px;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 999999;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .mobile-debug-console.minimized {
                height: 40px;
                overflow: hidden;
            }

            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px 8px 0 0;
                cursor: move;
                user-select: none;
            }

            .debug-title {
                font-weight: bold;
                font-size: 14px;
            }

            .debug-controls {
                display: flex;
                gap: 4px;
            }

            .debug-btn {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 4px 6px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
            }

            .debug-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .debug-tabs {
                display: flex;
                background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .debug-tab {
                flex: 1;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                padding: 8px 4px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
            }

            .debug-tab.active {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }

            .debug-content {
                max-height: 300px;
                overflow-y: auto;
                padding: 12px;
            }

            .debug-panel {
                display: none;
            }

            .debug-panel.active {
                display: block;
            }

            .debug-logs {
                max-height: 200px;
                overflow-y: auto;
            }

            .debug-log-entry {
                margin-bottom: 4px;
                font-size: 11px;
                line-height: 1.3;
                border-left: 2px solid transparent;
                padding-left: 6px;
            }

            .debug-log-entry.info { border-left-color: #3B82F6; }
            .debug-log-entry.warn { border-left-color: #F59E0B; }
            .debug-log-entry.error { border-left-color: #DC2626; }
            .debug-log-entry.debug { border-left-color: #6B7280; }

            .log-time {
                color: rgba(255, 255, 255, 0.5);
                margin-right: 8px;
            }

            .log-level {
                color: rgba(255, 255, 255, 0.7);
                margin-right: 8px;
                font-weight: bold;
                font-size: 10px;
            }

            .log-data {
                margin-top: 4px;
                padding: 4px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 2px;
                font-size: 10px;
                overflow-x: auto;
            }

            .info-section {
                margin-bottom: 16px;
            }

            .info-section h4 {
                margin-bottom: 8px;
                color: #F59E0B;
                font-size: 12px;
            }

            .info-grid {
                display: grid;
                gap: 4px;
            }

            .info-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                font-size: 11px;
            }

            .info-label {
                color: rgba(255, 255, 255, 0.7);
            }

            .info-value {
                color: white;
                text-align: right;
            }

            .capabilities-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px;
            }

            .capability-item {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 2px;
            }

            .capability-item.supported {
                background: rgba(34, 197, 94, 0.2);
                color: #4ADE80;
            }

            .capability-item.not-supported {
                background: rgba(239, 68, 68, 0.2);
                color: #F87171;
            }

            .performance-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }

            .metric {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }

            .metric-label {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 4px;
            }

            .metric-value {
                font-weight: bold;
                font-size: 14px;
            }

            .metric-value.good { color: #4ADE80; }
            .metric-value.warn { color: #F59E0B; }

            .performance-actions {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .performance-actions button {
                background: rgba(59, 130, 246, 0.2);
                border: 1px solid #3B82F6;
                color: #60A5FA;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                flex: 1;
                min-width: 60px;
            }

            .touch-visualizer {
                width: 100%;
                height: 120px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                margin-top: 8px;
            }

            .touch-stats {
                margin-bottom: 8px;
            }

            .stat {
                font-size: 11px;
                margin-bottom: 2px;
                color: rgba(255, 255, 255, 0.8);
            }

            .recent-gestures h5 {
                font-size: 11px;
                margin-bottom: 4px;
                color: #F59E0B;
            }

            .gesture-item {
                font-size: 10px;
                padding: 2px 4px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 2px;
                margin-bottom: 2px;
            }

            /* Mobile responsive adjustments */
            @media (max-width: 480px) {
                .mobile-debug-console {
                    width: calc(100vw - 40px);
                    max-width: 350px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize debug console for mobile debugging
if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.location.search.includes('debug=mobile')) {

    document.addEventListener('DOMContentLoaded', () => {
        window.mobileDebugConsole = new MobileDebugConsole({
            enabled: true,
            showPerformance: true,
            showDevice: true,
            showTouch: true,
            showViewport: true
        });
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileDebugConsole;
}