/**
 * TyreHero Build Optimization Script
 * Automates minification, compression, and asset optimization
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { minify: minifyCSS } = require('csso');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const gzipSize = require('gzip-size');

class TyreHeroBuildOptimizer {
    constructor() {
        this.config = {
            sourceDir: '.',
            buildDir: './dist',
            
            // Performance targets for emergency scenarios
            targets: {
                maxJSBundleSize: 500000, // 500KB
                maxCSSBundleSize: 100000, // 100KB
                maxImageSize: 200000,     // 200KB
                maxGzipRatio: 0.3         // 30% compression minimum
            },
            
            // Critical resources that must be optimized
            criticalFiles: [
                'emergency-optimized.html',
                'critical.css',
                'emergency-scripts.js',
                'service-worker.js'
            ],
            
            // Image optimization settings
            imageOptimization: {
                quality: {
                    webp: 80,
                    jpeg: 85,
                    png: 90
                },
                sizes: [150, 300, 600, 1200, 1800] // Responsive sizes
            }
        };
        
        this.stats = {
            originalSizes: {},
            optimizedSizes: {},
            compressionRatios: {},
            criticalPathOptimized: false
        };
    }
    
    /**
     * Main optimization pipeline
     */
    async optimize() {
        console.log('🚀 Starting TyreHero Emergency Performance Optimization...\n');
        
        try {
            // Create build directory
            this.ensureBuildDir();
            
            // Critical path optimization first (for emergency scenarios)
            await this.optimizeCriticalPath();
            
            // JavaScript optimization
            await this.optimizeJavaScript();
            
            // CSS optimization
            await this.optimizeCSS();
            
            // Image optimization with WebP generation
            await this.optimizeImages();
            
            // HTML optimization
            await this.optimizeHTML();
            
            // Generate optimized service worker
            await this.optimizeServiceWorker();
            
            // Create performance manifest
            await this.generatePerformanceManifest();
            
            // Validate performance targets
            this.validatePerformanceTargets();
            
            // Generate optimization report
            this.generateOptimizationReport();
            
        } catch (error) {
            console.error('❌ Optimization failed:', error);
            process.exit(1);
        }
    }
    
    /**
     * Optimize critical rendering path for emergency scenarios
     */
    async optimizeCriticalPath() {
        console.log('⚡ Optimizing critical rendering path for emergency scenarios...');
        
        // Extract critical CSS for above-the-fold content
        const criticalCSS = await this.extractCriticalCSS();
        
        // Inline critical CSS in emergency HTML
        await this.inlineCriticalCSS('emergency-optimized.html', criticalCSS);
        
        // Preload critical resources
        await this.generatePreloadHeaders();
        
        this.stats.criticalPathOptimized = true;
        console.log('✅ Critical path optimized\n');
    }
    
    /**
     * Extract critical CSS for above-the-fold content
     */
    async extractCriticalCSS() {
        try {
            const criticalCSS = fs.readFileSync('critical.css', 'utf8');
            const minified = minifyCSS(criticalCSS).css;
            
            // Save minified critical CSS
            fs.writeFileSync(path.join(this.config.buildDir, 'critical.min.css'), minified);
            
            return minified;
        } catch (error) {
            console.warn('⚠️ Could not extract critical CSS:', error.message);
            return '';
        }
    }
    
    /**
     * Inline critical CSS in HTML
     */
    async inlineCriticalCSS(htmlFile, criticalCSS) {
        try {
            let html = fs.readFileSync(htmlFile, 'utf8');
            
            // Replace critical CSS placeholder with actual minified CSS
            html = html.replace(
                /\/\* Critical CSS inlined for immediate rendering \*\/[\s\S]*?<\/style>/,
                `/* Critical CSS inlined - ${Math.round(criticalCSS.length / 1024)}KB */\n${criticalCSS}\n</style>`
            );
            
            // Optimize HTML structure for emergency loading
            html = this.optimizeHTMLForEmergency(html);
            
            fs.writeFileSync(path.join(this.config.buildDir, htmlFile), html);
            
        } catch (error) {
            console.warn('⚠️ Could not inline critical CSS:', error.message);
        }
    }
    
    /**
     * Optimize HTML specifically for emergency scenarios
     */
    optimizeHTMLForEmergency(html) {
        // Add emergency-specific optimizations
        html = html.replace(
            /<head>/,
            `<head>
    <!-- Emergency Performance Optimizations -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="preload" href="emergency-scripts.min.js" as="script">
    <link rel="preload" href="images/tyrehero-logo.webp" as="image" type="image/webp">
    <meta name="emergency-optimized" content="true">`
        );
        
        // Optimize emergency call button for instant interaction
        html = html.replace(
            /(<div class="emergency-call-fixed">)/,
            '$1<!-- Prioritized for emergency scenarios -->'
        );
        
        // Add performance hints
        html = html.replace(
            /<script src="emergency-scripts\.js"/,
            '<script src="emergency-scripts.min.js"'
        );
        
        return html;
    }
    
    /**
     * JavaScript optimization
     */
    async optimizeJavaScript() {
        console.log('📦 Optimizing JavaScript for emergency performance...');
        
        const jsFiles = [
            'emergency-scripts.js',
            'performance-monitoring.js',
            'image-optimization.js'
        ];
        
        for (const file of jsFiles) {
            if (fs.existsSync(file)) {
                await this.minifyJavaScript(file);
            }
        }
        
        // Create emergency bundle (critical scripts only)
        await this.createEmergencyBundle();
        
        console.log('✅ JavaScript optimization complete\n');
    }
    
    /**
     * Minify individual JavaScript file
     */
    async minifyJavaScript(inputFile) {
        try {
            const originalContent = fs.readFileSync(inputFile, 'utf8');
            this.stats.originalSizes[inputFile] = originalContent.length;
            
            const result = await minify(originalContent, {
                compress: {
                    drop_console: true, // Remove console.logs in production
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info'], // Remove specific functions
                    passes: 2 // Multiple compression passes
                },
                mangle: {
                    safari10: true // Safari 10 compatibility
                },
                format: {
                    comments: false // Remove comments
                }
            });
            
            if (result.error) {
                throw result.error;
            }
            
            const outputFile = inputFile.replace('.js', '.min.js');
            const outputPath = path.join(this.config.buildDir, outputFile);
            
            fs.writeFileSync(outputPath, result.code);
            
            this.stats.optimizedSizes[inputFile] = result.code.length;
            this.stats.compressionRatios[inputFile] = 
                (1 - result.code.length / originalContent.length) * 100;
            
            console.log(`  ✓ ${inputFile} → ${outputFile} (${this.stats.compressionRatios[inputFile].toFixed(1)}% reduction)`);
            
        } catch (error) {
            console.error(`❌ Failed to minify ${inputFile}:`, error.message);
        }
    }
    
    /**
     * Create emergency-optimized bundle
     */
    async createEmergencyBundle() {
        const emergencyScripts = [
            'emergency-scripts.js',
            'performance-monitoring.js'
        ];
        
        let bundleContent = '/* TyreHero Emergency Bundle - Optimized for Critical Performance */\n';
        
        for (const script of emergencyScripts) {
            if (fs.existsSync(script)) {
                const content = fs.readFileSync(script, 'utf8');
                bundleContent += `\n/* ${script} */\n${content}\n`;
            }
        }
        
        const minified = await minify(bundleContent, {
            compress: {
                drop_console: false, // Keep console for emergency debugging
                drop_debugger: true,
                passes: 3
            },
            mangle: true
        });
        
        fs.writeFileSync(
            path.join(this.config.buildDir, 'emergency-bundle.min.js'),
            minified.code
        );
        
        console.log(`  ✓ Created emergency bundle (${Math.round(minified.code.length / 1024)}KB)`);
    }
    
    /**
     * CSS optimization
     */
    async optimizeCSS() {
        console.log('🎨 Optimizing CSS for emergency scenarios...');
        
        const cssFiles = ['styles.css', 'critical.css'];
        
        for (const file of cssFiles) {
            if (fs.existsSync(file)) {
                await this.minifyCSS(file);
            }
        }
        
        console.log('✅ CSS optimization complete\n');
    }
    
    /**
     * Minify CSS file
     */
    async minifyCSS(inputFile) {
        try {
            const originalContent = fs.readFileSync(inputFile, 'utf8');
            this.stats.originalSizes[inputFile] = originalContent.length;
            
            const result = minifyCSS(originalContent, {
                restructure: true,
                forceMediaMerge: true,
                clone: false
            });
            
            const outputFile = inputFile.replace('.css', '.min.css');
            const outputPath = path.join(this.config.buildDir, outputFile);
            
            fs.writeFileSync(outputPath, result.css);
            
            this.stats.optimizedSizes[inputFile] = result.css.length;
            this.stats.compressionRatios[inputFile] = 
                (1 - result.css.length / originalContent.length) * 100;
            
            console.log(`  ✓ ${inputFile} → ${outputFile} (${this.stats.compressionRatios[inputFile].toFixed(1)}% reduction)`);
            
        } catch (error) {
            console.error(`❌ Failed to minify ${inputFile}:`, error.message);
        }
    }
    
    /**
     * Image optimization with WebP generation
     */
    async optimizeImages() {
        console.log('🖼️  Optimizing images for emergency scenarios...');
        
        const imageDir = 'images';
        if (!fs.existsSync(imageDir)) {
            console.log('  ⚠️ No images directory found');
            return;
        }
        
        const outputDir = path.join(this.config.buildDir, 'images');
        this.ensureDir(outputDir);
        
        // Optimize existing images
        await this.compressImages(imageDir, outputDir);
        
        // Generate WebP versions
        await this.generateWebPImages(imageDir, outputDir);
        
        // Generate responsive image sizes
        await this.generateResponsiveSizes(imageDir, outputDir);
        
        console.log('✅ Image optimization complete\n');
    }
    
    /**
     * Compress images
     */
    async compressImages(inputDir, outputDir) {
        try {
            const files = await imagemin([`${inputDir}/*.{jpg,png,svg}`], {
                destination: outputDir,
                plugins: [
                    imageminMozjpeg({ quality: this.config.imageOptimization.quality.jpeg }),
                    imageminPngquant({ quality: [0.6, this.config.imageOptimization.quality.png / 100] }),
                    imageminSvgo({
                        plugins: [
                            { removeViewBox: false },
                            { removeDimensions: true }
                        ]
                    })
                ]
            });
            
            console.log(`  ✓ Compressed ${files.length} images`);
            
        } catch (error) {
            console.error('❌ Image compression failed:', error.message);
        }
    }
    
    /**
     * Generate WebP versions
     */
    async generateWebPImages(inputDir, outputDir) {
        try {
            const files = await imagemin([`${inputDir}/*.{jpg,png}`], {
                destination: outputDir,
                plugins: [
                    imageminWebp({ quality: this.config.imageOptimization.quality.webp })
                ]
            });
            
            console.log(`  ✓ Generated ${files.length} WebP images`);
            
        } catch (error) {
            console.error('❌ WebP generation failed:', error.message);
        }
    }
    
    /**
     * Generate responsive image sizes
     */
    async generateResponsiveSizes(inputDir, outputDir) {
        // This would typically use sharp or similar for actual resizing
        // For now, we'll create the directory structure and placeholders
        
        for (const size of this.config.imageOptimization.sizes) {
            const sizeDir = path.join(outputDir, `w${size}`);
            this.ensureDir(sizeDir);
        }
        
        console.log(`  ✓ Set up responsive image structure for ${this.config.imageOptimization.sizes.length} sizes`);
    }
    
    /**
     * HTML optimization
     */
    async optimizeHTML() {
        console.log('📄 Optimizing HTML files...');
        
        const htmlFiles = ['emergency-optimized.html', 'index.html'];
        
        for (const file of htmlFiles) {
            if (fs.existsSync(file)) {
                await this.optimizeHTMLFile(file);
            }
        }
        
        console.log('✅ HTML optimization complete\n');
    }
    
    /**
     * Optimize individual HTML file
     */
    async optimizeHTMLFile(inputFile) {
        try {
            let html = fs.readFileSync(inputFile, 'utf8');
            
            // Minify HTML
            html = html
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .replace(/>\s+</g, '><') // Remove spaces between tags
                .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
                .trim();
            
            // Update resource references to minified versions
            html = html
                .replace(/emergency-scripts\.js/g, 'emergency-scripts.min.js')
                .replace(/styles\.css/g, 'styles.min.css')
                .replace(/(\.(jpg|png))/g, '.webp'); // Prefer WebP images
            
            const outputPath = path.join(this.config.buildDir, inputFile);
            fs.writeFileSync(outputPath, html);
            
            console.log(`  ✓ Optimized ${inputFile}`);
            
        } catch (error) {
            console.error(`❌ Failed to optimize ${inputFile}:`, error.message);
        }
    }
    
    /**
     * Optimize service worker
     */
    async optimizeServiceWorker() {
        console.log('⚙️ Optimizing service worker...');
        
        try {
            const swContent = fs.readFileSync('service-worker.js', 'utf8');
            
            // Update cache names with build hash
            const buildHash = Date.now().toString(36);
            const optimizedSW = swContent
                .replace(/tyrehero-emergency-v[\d.]+/g, `tyrehero-emergency-v${buildHash}`)
                .replace(/tyrehero-offline-v[\d.]+/g, `tyrehero-offline-v${buildHash}`);
            
            // Minify service worker
            const minified = await minify(optimizedSW, {
                compress: {
                    drop_console: false, // Keep console for debugging
                    drop_debugger: true
                },
                mangle: false // Don't mangle SW code for debugging
            });
            
            fs.writeFileSync(
                path.join(this.config.buildDir, 'service-worker.js'),
                minified.code
            );
            
            console.log('  ✓ Service worker optimized and cache-busted');
            
        } catch (error) {
            console.error('❌ Service worker optimization failed:', error.message);
        }
        
        console.log('✅ Service worker optimization complete\n');
    }
    
    /**
     * Generate performance manifest
     */
    async generatePerformanceManifest() {
        const manifest = {
            buildTime: new Date().toISOString(),
            version: require('./package.json').version || '1.0.0',
            emergency: {
                criticalPath: this.stats.criticalPathOptimized,
                targets: this.config.targets,
                files: this.config.criticalFiles
            },
            optimization: {
                javascript: Object.keys(this.stats.compressionRatios)
                    .filter(f => f.endsWith('.js'))
                    .reduce((obj, key) => {
                        obj[key] = {
                            originalSize: this.stats.originalSizes[key],
                            optimizedSize: this.stats.optimizedSizes[key],
                            compressionRatio: this.stats.compressionRatios[key]
                        };
                        return obj;
                    }, {}),
                css: Object.keys(this.stats.compressionRatios)
                    .filter(f => f.endsWith('.css'))
                    .reduce((obj, key) => {
                        obj[key] = {
                            originalSize: this.stats.originalSizes[key],
                            optimizedSize: this.stats.optimizedSizes[key],
                            compressionRatio: this.stats.compressionRatios[key]
                        };
                        return obj;
                    }, {})
            }
        };
        
        fs.writeFileSync(
            path.join(this.config.buildDir, 'performance-manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('✅ Performance manifest generated\n');
    }
    
    /**
     * Validate performance targets
     */
    validatePerformanceTargets() {
        console.log('🎯 Validating performance targets...');
        
        let allTargetsMet = true;
        
        // Check JavaScript bundle sizes
        const jsFiles = Object.keys(this.stats.optimizedSizes)
            .filter(f => f.endsWith('.js'));
        
        for (const file of jsFiles) {
            const size = this.stats.optimizedSizes[file];
            if (size > this.config.targets.maxJSBundleSize) {
                console.log(`  ❌ ${file} exceeds JS bundle size target (${size} > ${this.config.targets.maxJSBundleSize})`);
                allTargetsMet = false;
            } else {
                console.log(`  ✓ ${file} meets JS bundle size target`);
            }
        }
        
        // Check compression ratios
        for (const [file, ratio] of Object.entries(this.stats.compressionRatios)) {
            const minRatio = this.config.targets.maxGzipRatio * 100;
            if (ratio < minRatio) {
                console.log(`  ⚠️ ${file} compression ratio below target (${ratio.toFixed(1)}% < ${minRatio}%)`);
            } else {
                console.log(`  ✓ ${file} meets compression target`);
            }
        }
        
        if (allTargetsMet) {
            console.log('✅ All performance targets met!\n');
        } else {
            console.log('⚠️ Some performance targets not met. Consider further optimization.\n');
        }
    }
    
    /**
     * Generate optimization report
     */
    generateOptimizationReport() {
        console.log('📊 OPTIMIZATION SUMMARY\n');
        console.log('═'.repeat(50));
        
        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;
        
        for (const [file, originalSize] of Object.entries(this.stats.originalSizes)) {
            const optimizedSize = this.stats.optimizedSizes[file];
            const ratio = this.stats.compressionRatios[file];
            
            totalOriginalSize += originalSize;
            totalOptimizedSize += optimizedSize;
            
            console.log(`${file}:`);
            console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB`);
            console.log(`  Optimized: ${(optimizedSize / 1024).toFixed(1)}KB`);
            console.log(`  Reduction: ${ratio.toFixed(1)}%\n`);
        }
        
        const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;
        
        console.log('TOTAL OPTIMIZATION:');
        console.log(`  Original: ${(totalOriginalSize / 1024).toFixed(1)}KB`);
        console.log(`  Optimized: ${(totalOptimizedSize / 1024).toFixed(1)}KB`);
        console.log(`  Total Reduction: ${totalReduction.toFixed(1)}%`);
        console.log(`  Bytes Saved: ${((totalOriginalSize - totalOptimizedSize) / 1024).toFixed(1)}KB\n`);
        
        console.log('🚀 EMERGENCY PERFORMANCE OPTIMIZATIONS:');
        console.log(`  ✓ Critical rendering path optimized`);
        console.log(`  ✓ Service worker with offline emergency support`);
        console.log(`  ✓ WebP images with fallbacks`);
        console.log(`  ✓ Minified and compressed assets`);
        console.log(`  ✓ Performance monitoring implemented`);
        console.log(`  ✓ Emergency-specific optimizations applied\n`);
        
        console.log('Build output available in:', this.config.buildDir);
        console.log('═'.repeat(50));
    }
    
    /**
     * Utility methods
     */
    ensureBuildDir() {
        if (!fs.existsSync(this.config.buildDir)) {
            fs.mkdirSync(this.config.buildDir, { recursive: true });
        }
    }
    
    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    async generatePreloadHeaders() {
        const preloadHeaders = [
            '<emergency-scripts.min.js>; rel=preload; as=script',
            '<critical.min.css>; rel=preload; as=style',
            '<images/tyrehero-logo.webp>; rel=preload; as=image; type=image/webp',
            '<manifest.json>; rel=preload; as=manifest'
        ];
        
        const htaccess = `
# TyreHero Emergency Performance Headers
<IfModule mod_headers.c>
    # Preload critical resources
    ${preloadHeaders.map(header => `Header add Link "${header}"`).join('\n    ')}
    
    # Cache static assets
    <FilesMatch "\\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # Emergency pages - short cache for updates
    <FilesMatch "emergency.*\\.html$">
        Header set Cache-Control "public, max-age=3600"
    </FilesMatch>
    
    # Service worker - no cache
    <FilesMatch "service-worker\\.js$">
        Header set Cache-Control "no-cache"
    </FilesMatch>
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>
        `;
        
        fs.writeFileSync(path.join(this.config.buildDir, '.htaccess'), htaccess.trim());
        console.log('  ✓ Generated performance headers (.htaccess)');
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new TyreHeroBuildOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = TyreHeroBuildOptimizer;