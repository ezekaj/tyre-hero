/**
 * Script to update all emergency pages with 3D background integration
 * Maintains emergency-first design while adding professional 3D workshop background
 */

const fs = require('fs');
const path = require('path');

const emergencyPages = [
    'maidenhead-emergency-ultra.html',
    'windsor-emergency-ultra.html'
];

const cssUpdates = `
        /* 3D Hero Background Container */
        #hero-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
        }

        /* Content overlay to ensure readability over 3D background */
        .content-overlay {
            position: relative;
            z-index: 1;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(2px);
            border-radius: 16px;
            padding: 20px;
            margin: 0 auto;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }`;

emergencyPages.forEach(filename => {
    try {
        console.log(`Updating ${filename}...`);
        
        let content = fs.readFileSync(filename, 'utf8');
        
        // Update body CSS to add position: relative
        content = content.replace(
            /body\s*\{([^}]+)overflow-x:\s*hidden;([^}]*)\}/,
            `body {$1overflow-x: hidden;
            position: relative;$2}`
        );
        
        // Add 3D background CSS
        content = content.replace(
            /(overflow-x: hidden;\s*position: relative;\s*\}\s*)(\s*\/\* Safety Alert \*\/)/,
            `$1${cssUpdates}

        $2`
        );
        
        // Add 3D background container and content overlay wrapper
        content = content.replace(
            /(<\/style>\s*<\/head>\s*<body>)/,
            `$1
    <!-- 3D Hero Background Container -->
    <div id="hero-background"></div>

    <!-- Content Overlay for Emergency Information -->
    <div class="content-overlay">`
        );
        
        // Close content overlay div before footer
        content = content.replace(
            /(<!-- Minimal Footer -->[\s\S]*?<\/div>)/,
            `$1

    </div> <!-- End content-overlay -->`
        );
        
        // Add 3D background script
        content = content.replace(
            /(<\/script>\s*<\/body>\s*<\/html>)/,
            `$1

    <!-- 3D Hero Background System - Emergency-Safe Progressive Enhancement -->
    <script src="3d-hero-background.js" defer></script>
</body>
</html>`
        );
        
        // Remove the original closing tags since we added them
        content = content.replace(/\s*<\/body>\s*<\/html>\s*$/, '');
        
        fs.writeFileSync(filename, content);
        console.log(`✅ ${filename} updated successfully`);
        
    } catch (error) {
        console.error(`❌ Error updating ${filename}:`, error.message);
    }
});

console.log('Emergency page updates complete!');