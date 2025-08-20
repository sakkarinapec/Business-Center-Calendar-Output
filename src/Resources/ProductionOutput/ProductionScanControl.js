// ProductionScanControl.js
var ProductionScanControl = (function() {
    'use strict';

    var isInitialized = false;
    var scannerEnabled = false;
    var currentStream = null;
    var scannerActive = false;

    // Initialize the control
    function InitializeControl() {
        if (isInitialized) return;
        
        createControlInterface();
        setupEventListeners();
        isInitialized = true;
        
        // Notify Business Central that control is ready
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnControlReady', null);
    }

    // Create the main interface
    function createControlInterface() {
        var container = document.getElementById('controlAddIn');
        if (!container) {
            container = document.body;
        }

        container.innerHTML = `
            <div class="production-scan-container">
                <div class="scan-header">
                    <h3 class="scan-title">
                        <i class="icon-barcode"></i>
                        Production Scan System
                    </h3>
                    <div class="status-indicator" id="statusIndicator">
                        <span class="status-text">Ready</span>
                    </div>
                </div>

                <div class="scan-tabs">
                    <button class="tab-button active" data-tab="manual">
                        <i class="icon-edit"></i>
                        Manual Input
                    </button>
                    <button class="tab-button" data-tab="qr">
                        <i class="icon-camera"></i>
                        QR Scanner
                    </button>
                </div>

                <div class="tab-content">
                    <!-- Manual Input Tab -->
                    <div class="tab-panel active" id="manual-panel">
                        <div class="input-section">
                            <div class="input-group">
                                <label class="input-label">Production Scan Data</label>
                                <div class="input-wrapper">
                                    <input type="text" 
                                           id="productionScanInput" 
                                           class="production-input"
                                           placeholder="Enter scan data or scan QR code (Format: PO|Routing|Location|RoutingRef)"
                                           autocomplete="off">
                                    <button class="input-button" id="validateBtn" type="button">
                                        <i class="icon-check"></i>
                                        Validate
                                    </button>
                                </div>
                                <div class="input-help">
                                    Format: ProductionOrder|Routing|Location|RoutingReference
                                </div>
                            </div>

                            <div class="parsed-data" id="parsedData" style="display: none;">
                                <h4 class="parsed-title">Parsed Data:</h4>
                                <div class="parsed-grid">
                                    <div class="parsed-item">
                                        <span class="parsed-label">Production Order:</span>
                                        <span class="parsed-value" id="parsedPO"></span>
                                    </div>
                                    <div class="parsed-item">
                                        <span class="parsed-label">Routing:</span>
                                        <span class="parsed-value" id="parsedRouting"></span>
                                    </div>
                                    <div class="parsed-item">
                                        <span class="parsed-label">Location:</span>
                                        <span class="parsed-value" id="parsedLocation"></span>
                                    </div>
                                    <div class="parsed-item">
                                        <span class="parsed-label">Routing Ref:</span>
                                        <span class="parsed-value" id="parsedRoutingRef"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Scanner Tab -->
                    <div class="tab-panel" id="qr-panel">
                        <div class="scanner-section">
                            <div class="scanner-container" id="scannerContainer">
                                <video id="qrVideo" class="qr-video" style="display: none;"></video>
                                <div class="scanner-overlay">
                                    <div class="scan-frame"></div>
                                </div>
                                <div class="scanner-placeholder" id="scannerPlaceholder">
                                    <div class="placeholder-content">
                                        <i class="icon-camera-large"></i>
                                        <p>Click "Start Scanner" to begin scanning</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="scanner-controls">
                                <button class="scanner-button start-btn" id="startScanBtn">
                                    <i class="icon-play"></i>
                                    Start Scanner
                                </button>
                                <button class="scanner-button stop-btn" id="stopScanBtn" style="display: none;">
                                    <i class="icon-stop"></i>
                                    Stop Scanner
                                </button>
                            </div>
                            
                            <div class="scanner-status" id="scannerStatus">
                                <div class="status-message">Scanner ready</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="action-btn clear-btn" id="clearBtn">
                        <i class="icon-trash"></i>
                        Clear
                    </button>
                    <button class="action-btn process-btn" id="processBtn" disabled>
                        <i class="icon-cog"></i>
                        Process Data
                    </button>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        var tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                switchTab(this.dataset.tab);
            });
        });

        // Manual input handling
        var productionInput = document.getElementById('productionScanInput');
        var validateBtn = document.getElementById('validateBtn');
        
        productionInput.addEventListener('input', function() {
            handleManualInput(this.value);
        });

        productionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateInput();
            }
        });

        validateBtn.addEventListener('click', validateInput);

        // Scanner controls
        document.getElementById('startScanBtn').addEventListener('click', startScanner);
        document.getElementById('stopScanBtn').addEventListener('click', stopScanner);

        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', clearData);
        document.getElementById('processBtn').addEventListener('click', processData);
    }

    // Switch between tabs
    function switchTab(tabName) {
        // Update tab buttons
        var tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(function(button) {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update tab panels
        var tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(function(panel) {
            panel.classList.toggle('active', panel.id === tabName + '-panel');
        });

        // Stop scanner if switching away from QR tab
        if (tabName !== 'qr' && scannerActive) {
            stopScanner();
        }
    }

    // Handle manual input changes
    function handleManualInput(value) {
        updateStatus('Typing...', 'info');
        
        if (value.trim() === '') {
            hideParsedData();
            document.getElementById('processBtn').disabled = true;
            updateStatus('Ready', 'ready');
            return;
        }

        // Auto-parse if it looks like scan data
        if (value.includes('|')) {
            parseScanData(value);
        }

        // Notify Business Central of input change
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnManualInputChanged', [value]);
    }

    // Validate input data
    function validateInput() {
        var input = document.getElementById('productionScanInput');
        var value = input.value.trim();

        if (!value) {
            showError('Please enter scan data');
            return;
        }

        if (!value.includes('|')) {
            showError('Invalid format. Expected format: PO|Routing|Location|RoutingRef');
            return;
        }

        parseScanData(value);
        updateStatus('Data validated', 'success');
        
        // Enable process button
        document.getElementById('processBtn').disabled = false;
    }

    // Parse scan data
    function parseScanData(data) {
        try {
            var parts = data.split('|');
            var poText = parts[0] ? parts[0].trim() : '';
            var routingText = parts[1] ? parts[1].trim() : '';
            var locationText = parts[2] ? parts[2].trim() : '';
            var routingRefText = parts[3] ? parts[3].trim() : '';

            // Display parsed data
            showParsedData(poText, routingText, locationText, routingRefText);
            
            return {
                po: poText,
                routing: routingText,
                location: locationText,
                routingRef: routingRefText
            };
        } catch (error) {
            showError('Error parsing scan data: ' + error.message);
            return null;
        }
    }

    // Show parsed data
    function showParsedData(po, routing, location, routingRef) {
        document.getElementById('parsedPO').textContent = po || 'Not specified';
        document.getElementById('parsedRouting').textContent = routing || 'Not specified';
        document.getElementById('parsedLocation').textContent = location || 'Not specified';
        document.getElementById('parsedRoutingRef').textContent = routingRef || 'Not specified';
        
        document.getElementById('parsedData').style.display = 'block';
        document.getElementById('processBtn').disabled = false;
    }

    // Hide parsed data
    function hideParsedData() {
        document.getElementById('parsedData').style.display = 'none';
    }

    // Start QR scanner
    function startScanner() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError('Camera not supported in this browser');
            return;
        }

        updateStatus('Starting camera...', 'info');

        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        })
        .then(function(stream) {
            currentStream = stream;
            var video = document.getElementById('qrVideo');
            video.srcObject = stream;
            video.style.display = 'block';
            
            document.getElementById('scannerPlaceholder').style.display = 'none';
            document.getElementById('startScanBtn').style.display = 'none';
            document.getElementById('stopScanBtn').style.display = 'inline-block';
            
            scannerActive = true;
            updateStatus('Scanning for QR codes...', 'scanning');
            
            video.play();
            startQRDetection(video);
        })
        .catch(function(error) {
            console.error('Error accessing camera:', error);
            showError('Failed to access camera: ' + error.message);
            updateStatus('Camera error', 'error');
        });
    }

    // Stop QR scanner
    function stopScanner() {
        if (currentStream) {
            currentStream.getTracks().forEach(function(track) {
                track.stop();
            });
            currentStream = null;
        }

        var video = document.getElementById('qrVideo');
        video.style.display = 'none';
        video.srcObject = null;
        
        document.getElementById('scannerPlaceholder').style.display = 'block';
        document.getElementById('startScanBtn').style.display = 'inline-block';
        document.getElementById('stopScanBtn').style.display = 'none';
        
        scannerActive = false;
        updateStatus('Scanner stopped', 'ready');
    }

    // Simple QR detection (basic implementation)
    function startQRDetection(video) {
        if (!scannerActive) return;

        // This is a simplified QR detection
        // In a real implementation, you'd use a library like jsQR
        setTimeout(function() {
            if (scannerActive) {
                startQRDetection(video);
            }
        }, 100);
    }

    // Simulate QR code detection (for demonstration)
    function simulateQRScan() {
        var testData = 'PO001|RT001|LOC001|REF001';
        handleQRDetection(testData);
    }

    // Handle QR code detection
    function handleQRDetection(qrData) {
        if (!qrData || !scannerActive) return;

        updateStatus('QR Code detected!', 'success');
        
        // Fill manual input
        document.getElementById('productionScanInput').value = qrData;
        
        // Parse the data
        parseScanData(qrData);
        
        // Switch to manual tab to show results
        switchTab('manual');
        
        // Stop scanner
        stopScanner();
        
        // Notify Business Central
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnQrCodeScanned', [qrData]);
        
        setTimeout(function() {
            updateStatus('QR code processed successfully', 'success');
        }, 1000);
    }

    // Process the scanned/entered data
    function processData() {
        var input = document.getElementById('productionScanInput');
        var data = input.value.trim();
        
        if (!data) {
            showError('No data to process');
            return;
        }

        var parsed = parseScanData(data);
        if (!parsed) {
            showError('Failed to parse data');
            return;
        }

        updateStatus('Processing data...', 'info');

        // Notify Business Central with parsed data
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnProductionScanValidated', [
            parsed.po,
            parsed.routing,
            parsed.location,
            parsed.routingRef
        ]);

        updateStatus('Data sent to Business Central', 'success');
    }

    // Clear all data
    function clearData() {
        document.getElementById('productionScanInput').value = '';
        hideParsedData();
        document.getElementById('processBtn').disabled = true;
        updateStatus('Data cleared', 'ready');
        
        if (scannerActive) {
            stopScanner();
        }
    }

    // Update status display
    function updateStatus(message, type) {
        var statusIndicator = document.getElementById('statusIndicator');
        var statusText = statusIndicator.querySelector('.status-text');
        
        statusText.textContent = message;
        statusIndicator.className = 'status-indicator ' + (type || 'ready');
    }

    // Show error message
    function showError(message) {
        updateStatus(message, 'error');
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnScanError', [message]);
        
        // Clear error after 5 seconds
        setTimeout(function() {
            updateStatus('Ready', 'ready');
        }, 5000);
    }

    // Set production scan data from Business Central
    function SetProductionScanData(data) {
        if (data) {
            document.getElementById('productionScanInput').value = data;
            parseScanData(data);
        }
    }

    // Enable/disable scanner
    function SetScannerEnabled(enabled) {
        scannerEnabled = enabled;
        var scannerTab = document.querySelector('[data-tab="qr"]');
        if (scannerTab) {
            scannerTab.disabled = !enabled;
            if (!enabled && scannerActive) {
                stopScanner();
            }
        }
    }

    // Public API
    return {
        InitializeControl: InitializeControl,
        SetProductionScanData: SetProductionScanData,
        SetScannerEnabled: SetScannerEnabled,
        // Test function for QR simulation
        SimulateQRScan: simulateQRScan
    };
})();

// Make functions available globally for Business Central
window.InitializeControl = ProductionScanControl.InitializeControl;
window.SetProductionScanData = ProductionScanControl.SetProductionScanData;
window.SetScannerEnabled = ProductionScanControl.SetScannerEnabled;
document.addEventListener('DOMContentLoaded', function () {
    ProductionScanControl.InitializeControl();
});
