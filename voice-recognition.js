/*
 * TyreHero Voice Recognition System
 * Advanced voice activation and command processing
 */

class TyreHeroVoiceSystem {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.commands = {
            'hey tyrehero': () => this.activateAssistant(),
            'emergency': () => this.triggerEmergency(),
            'book service': () => this.openBooking(),
            'call now': () => this.makeEmergencyCall(),
            'location': () => this.shareLocation(),
            'panic mode': () => this.activatePanicMode(),
            'scan tyre': () => this.openARScanner(),
            'services': () => this.showServices()
        };
        this.init();
    }

    init() {
        // Check browser support
        if (!this.checkSupport()) {
            console.log('🎤 Voice recognition not supported');
            return;
        }

        this.setupRecognition();
        this.bindEvents();
        console.log('🎤 TyreHero Voice System initialized');
        // Auto-start disabled per client request
        // this.startListening();
    }

    checkSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.showVoiceIndicator();
            console.log('🎤 Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                this.processCommand(finalTranscript.toLowerCase().trim());
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🎤 Voice recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.hideVoiceIndicator();
            console.log('🎤 Voice recognition ended');
        };
    }

    processCommand(transcript) {
        console.log('🎤 Voice input:', transcript);

        // Check for wake word
        if (transcript.includes('hey tyrehero')) {
            this.activateAssistant();
            return;
        }

        // Process other commands
        for (const [command, action] of Object.entries(this.commands)) {
            if (transcript.includes(command)) {
                action();
                break;
            }
        }

        // Fallback: Show all options
        if (!Object.keys(this.commands).some(cmd => transcript.includes(cmd))) {
            this.showVoiceHelp();
        }
    }

    activateAssistant() {
        this.showAssistantDialog();
        this.speak("Hello! I'm your TyreHero AI assistant. How can I help you today?");
    }

    triggerEmergency() {
        if (typeof activatePanicMode === 'function') {
            activatePanicMode();
        }
        this.speak("Emergency mode activated. Help is on the way.");
    }

    openBooking() {
        // Navigate to booking or open booking widget
        window.location.href = 'booking.html';
        this.speak("Opening booking service");
    }

    makeEmergencyCall() {
        window.location.href = 'tel:08001234567';
        this.speak("Calling emergency line");
    }

    shareLocation() {
        if (typeof shareEmergencyLocation === 'function') {
            shareEmergencyLocation();
        }
        this.speak("Sharing your location");
    }

    activatePanicMode() {
        if (typeof activatePanicMode === 'function') {
            activatePanicMode();
        }
        this.speak("Panic mode activated. Emergency services contacted.");
    }

    openARScanner() {
        if (typeof startARScanner === 'function') {
            startARScanner();
        }
        this.speak("Opening AR tyre scanner");
    }

    showServices() {
        window.location.href = '#services';
        this.speak("Showing available services");
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    startListening() {
        if (!this.isListening && this.recognition) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.isListening && this.recognition) {
            this.recognition.stop();
        }
    }

    showVoiceIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    showAssistantDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'voice-assistant-dialog';
        dialog.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(10px);
                color: white; padding: 30px; border-radius: 20px;
                text-align: center; z-index: 9999; max-width: 400px;
                border: 2px solid #00D4FF; box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
            ">
                <h3>🎤 Voice Assistant Active</h3>
                <p>Say one of these commands:</p>
                <ul style="text-align: left; margin: 15px 0;">
                    <li>"Emergency" - Activate panic mode</li>
                    <li>"Call now" - Emergency call</li>
                    <li>"Book service" - Open booking</li>
                    <li>"Location" - Share location</li>
                    <li>"Scan tyre" - AR scanner</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: #00D4FF; border: none; padding: 10px 20px;
                               border-radius: 10px; color: black; font-weight: bold; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(dialog);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.getElementById('voice-assistant-dialog')) {
                document.getElementById('voice-assistant-dialog').remove();
            }
        }, 10000);
    }

    showVoiceHelp() {
        this.speak("I didn't understand that. Try saying: Emergency, Call now, Book service, or Location.");
    }

    bindEvents() {
        // Bind to voice activation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.voice-button, .btn-voice, [onclick*="activateVoice"]')) {
                this.startListening();
            }
        });

        // Listen for device detection
        window.addEventListener('tyrehero:deviceDetected', (e) => {
            const device = e.detail;
            if (device.isMobile && device.isSlowConnection) {
                // Disable continuous listening on slow mobile connections
                if (this.recognition) {
                    this.recognition.continuous = false;
                }
            }
        });
    }
}

// Initialize voice system
let tyreHeroVoice;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroVoice = new TyreHeroVoiceSystem();
});

// Global functions for backward compatibility
function activateVoice() {
    if (tyreHeroVoice) {
        tyreHeroVoice.startListening();
    }
}

function startVoiceSearch() {
    if (tyreHeroVoice) {
        tyreHeroVoice.startListening();
        tyreHeroVoice.speak("What service do you need?");
    }
}