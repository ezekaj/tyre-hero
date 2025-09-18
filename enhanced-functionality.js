/**
 * TyreHero Enhanced Functionality
 * Next-Generation Mobile Tyre Service JavaScript
 */

class TyreHeroEnhanced {
    constructor() {
        this.arScanner = null;
        this.panicModeActive = false;
        this.emergencyPanelOpen = false;
        this.currentTab = 'ar';

        this.init();
    }

    init() {
        this.initTabSwitching();
        this.initLiveStats();
        this.initTypingEffect();
        this.initAnimations();
        this.initEmergencyFeatures();
    }








    // ===== Tab Switching System =====
    initTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.search-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.search-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.querySelector(`[data-content="${tabId}"]`).classList.add('active');

        this.currentTab = tabId;
    }

    // ===== Live Stats System =====
    initLiveStats() {
        this.updateLiveStats();

        // Update stats every 30 seconds
        setInterval(() => {
            this.updateLiveStats();
        }, 30000);
    }

    updateLiveStats() {
        // Simulate real-time data updates
        const responseTime = document.getElementById('avg-response');
        const activeTechnicians = document.getElementById('active-technicians');
        const jobsToday = document.getElementById('jobs-today');

        if (responseTime) {
            const currentTime = parseInt(responseTime.textContent);
            const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5 minutes
            const newTime = Math.max(30, Math.min(90, currentTime + variation));
            responseTime.textContent = newTime;
        }

        if (activeTechnicians) {
            const available = Math.floor(Math.random() * 12) + 1;
            activeTechnicians.textContent = available;
        }

        if (jobsToday) {
            const current = parseInt(jobsToday.textContent);
            const increment = Math.floor(Math.random() * 3);
            jobsToday.textContent = current + increment;
        }
    }

    // ===== Typing Effect =====
    initTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;

        const phrases = [
            ' When Emergency Strikes',
            ' With AI Intelligence',
            ' 24/7 Availability',
            ' In 60 Minutes or Less',
            ' With AR Technology'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause before next phrase
            }

            setTimeout(type, typeSpeed);
        };

        type();
    }

    // ===== Animation System =====
    initAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        document.querySelectorAll('.trust-item, .stat-item, .service-card').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== Emergency Features =====
    initEmergencyFeatures() {
        // Emergency panel toggle
        const emergencyToggle = document.querySelector('.emergency-toggle');
        if (emergencyToggle) {
            emergencyToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleEmergencyPanel();
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', () => {
            if (this.emergencyPanelOpen) {
                this.closeEmergencyPanel();
            }
        });
    }

    toggleEmergencyPanel() {
        const panel = document.querySelector('.emergency-panel-content');
        if (!panel) return;

        if (this.emergencyPanelOpen) {
            this.closeEmergencyPanel();
        } else {
            this.openEmergencyPanel();
        }
    }

    openEmergencyPanel() {
        const panel = document.querySelector('.emergency-panel-content');
        if (panel) {
            panel.style.opacity = '1';
            panel.style.visibility = 'visible';
            panel.style.transform = 'translateY(0)';
            this.emergencyPanelOpen = true;
        }
    }

    closeEmergencyPanel() {
        const panel = document.querySelector('.emergency-panel-content');
        if (panel) {
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.transform = 'translateY(10px)';
            this.emergencyPanelOpen = false;
        }
    }

    // ===== Panic Mode =====
    activatePanicMode() {
        if (this.panicModeActive) return;

        this.panicModeActive = true;
        const panicOverlay = document.getElementById('panic-mode');

        if (panicOverlay) {
            panicOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Auto-close after 30 seconds if not manually closed
            setTimeout(() => {
                if (this.panicModeActive) {
                    this.closePanicMode();
                }
            }, 30000);

        }
    }

    closePanicMode() {
        this.panicModeActive = false;
        const panicOverlay = document.getElementById('panic-mode');

        if (panicOverlay) {
            panicOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    // ===== Location Services =====
    shareLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Create What3Words-style location
                    const locationCode = this.generateLocationCode(lat, lng);

                    // Share location via various methods
                    this.displayLocationSharing(lat, lng, locationCode);
                },
                (error) => {
                    console.error('Location error:', error);
                    alert('Unable to get your location. Please enable location services.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    generateLocationCode(lat, lng) {
        // Simplified location code generator (in real app, use What3Words API)
        const words = ['apple', 'brave', 'calm', 'deep', 'echo', 'fast', 'green', 'happy'];
        const code = Array(3).fill().map(() => words[Math.floor(Math.random() * words.length)]);
        return code.join('.');
    }

    displayLocationSharing(lat, lng, locationCode) {
        const message = `My location: ${lat.toFixed(6)}, ${lng.toFixed(6)}\nLocation code: ${locationCode}\nGoogle Maps: https://maps.google.com/?q=${lat},${lng}`;

        // Show sharing options
        if (navigator.share) {
            navigator.share({
                title: 'My Emergency Location - TyreHero',
                text: message
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(message).then(() => {
                alert('Location copied to clipboard!');
            });
        }
    }

    // ===== AR Scanner Integration =====
    startARScanner() {
        // Initialize AR scanner (placeholder for actual AR implementation)
        alert('AR Scanner would start here - camera access required');

        // In real implementation, this would:
        // 1. Request camera permission
        // 2. Initialize AR.js or WebXR
        // 3. Start computer vision for tyre recognition
        // 4. Overlay tyre size information
    }

    // ===== Search Functions =====
    searchByReg() {
        const regInput = document.getElementById('reg-input');
        const regNumber = regInput.value.trim().toUpperCase();

        if (!regNumber) {
            alert('Please enter a vehicle registration number');
            return;
        }

        // Simulate DVLA lookup
        this.simulateDVLALookup(regNumber);
    }

    simulateDVLALookup(regNumber) {
        // Show loading state
        const searchBtn = document.querySelector('.btn-reg-search');
        const originalText = searchBtn.textContent;
        searchBtn.textContent = '🔍 Searching...';
        searchBtn.disabled = true;

        setTimeout(() => {
            // Simulate successful lookup
            const vehicleData = {
                make: 'Honda',
                model: 'Civic',
                year: '2019',
                tyreSize: '205/55R16',
                recommendedTyres: [
                    'Michelin Primacy 4',
                    'Continental PremiumContact 6',
                    'Bridgestone Turanza T005'
                ]
            };

            this.displayVehicleResults(vehicleData);

            // Reset button
            searchBtn.textContent = originalText;
            searchBtn.disabled = false;
        }, 2000);
    }

    displayVehicleResults(vehicleData) {
        // Create results display
        const resultsHtml = `
            <div class="vehicle-results">
                <h4>🚗 Vehicle Found</h4>
                <p><strong>${vehicleData.make} ${vehicleData.model} (${vehicleData.year})</strong></p>
                <p><strong>Tyre Size:</strong> ${vehicleData.tyreSize}</p>
                <h5>Recommended Tyres:</h5>
                <ul>
                    ${vehicleData.recommendedTyres.map(tyre => `<li>${tyre}</li>`).join('')}
                </ul>
                <button class="btn btn-primary" onclick="tyreHero.proceedToBooking('${vehicleData.tyreSize}')">
                    📋 Book Service
                </button>
            </div>
        `;

        // Display results in the current tab
        const currentContent = document.querySelector('.search-content.active');
        currentContent.innerHTML = resultsHtml;
    }

    proceedToBooking(tyreSize) {
        // Redirect to booking page or open booking modal
        window.location.href = `booking.html?size=${encodeURIComponent(tyreSize)}`;
    }

    // ===== Emergency Checklist =====
    emergencyChecklist() {
        const checklist = [
            '🚨 Turn on hazard lights',
            '🚗 Move to safe location if possible',
            '👀 Check for injuries',
            '📱 Call emergency services if needed',
            '🦺 Wear high-visibility clothing',
            '⚠️ Place warning triangle behind vehicle',
            '📞 Wait for TyreHero technician'
        ];

        const checklistHtml = checklist.map(item =>
            `<label class="checklist-item">
                <input type="checkbox"> ${item}
            </label>`
        ).join('');

        // Show checklist in modal or alert
        alert('Emergency Safety Checklist:\n\n' + checklist.join('\n'));
    }

    // ===== Family Contact =====
    contactFamily() {
        const message = "I'm safe but need roadside assistance. TyreHero is helping me. I'll update you soon.";

        if (navigator.share) {
            navigator.share({
                title: 'Safety Update',
                text: message
            });
        } else {
            // Open SMS/WhatsApp with pre-filled message
            const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
            window.open(smsUrl);
        }
    }
}

// Global Functions for HTML onclick handlers

function openARScanner() {
    tyreHero.startARScanner();
}

function activatePanicMode() {
    tyreHero.activatePanicMode();
}

function closePanicMode() {
    tyreHero.closePanicMode();
}

function toggleEmergencyPanel() {
    tyreHero.toggleEmergencyPanel();
}

function shareLocation() {
    tyreHero.shareLocation();
}

function emergencyChecklist() {
    tyreHero.emergencyChecklist();
}

function contactFamily() {
    tyreHero.contactFamily();
}

function searchByReg() {
    tyreHero.searchByReg();
}

function startARScanner() {
    tyreHero.startARScanner();
}


function searchManual() {
    const width = document.getElementById('width').value;
    const profile = document.getElementById('profile').value;
    const diameter = document.getElementById('diameter').value;

    if (!width || !profile || !diameter) {
        alert('Please select all tyre specifications');
        return;
    }

    const tyreSize = `${width}/${profile}R${diameter}`;
    tyreHero.proceedToBooking(tyreSize);
}

// Initialize TyreHero Enhanced on page load
let tyreHero;

document.addEventListener('DOMContentLoaded', () => {
    tyreHero = new TyreHeroEnhanced();
    console.log('TyreHero Enhanced initialized');
});

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}