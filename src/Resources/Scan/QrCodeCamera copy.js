// QrCodeCamera.js
(function() {
    'use strict';
    
    let fileInput, preview, canvas, output, controlAddIn;
    
    // Initialize the control when DOM is ready
    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('ControlReady', []);

    // Public functions that can be called from AL
    window.InitializeScanner = function() {
        setupQrScanner();
    };

    window.ClearResult = function() {
        if (output) {
            output.innerHTML = '';
        }
        if (preview) {
            preview.hidden = true;
            preview.src = '#';
        }
        if (fileInput) {
            fileInput.value = '';
        }
    };

    function setupQrScanner() {
        // Create the HTML structure
        const container = document.body;
        container.innerHTML = `
            <div class="qr-scanner-container">
                <h2 class="scanner-title">📷 อ่าน QR Code จากรูปภาพ</h2>
                
                <div class="upload-section">
                    <input type="file" id="fileInput" accept="image/*" class="file-input">
                    <label for="fileInput" class="file-label">
                        เลือกรูปภาพ QR Code
                    </label>
                </div>
                
                <canvas id="canvas" style="display: none;"></canvas>
                
                <div class="preview-section">
                    <img id="preview" alt="Preview" class="preview-image" style="display: none;">
                </div>
                
                <div id="output" class="output-section"></div>
            </div>
        `;

        // Get references to elements
        fileInput = document.getElementById('fileInput');
        preview = document.getElementById('preview');
        canvas = document.getElementById('canvas');
        output = document.getElementById('output');

        // Add event listener for file input
        fileInput.addEventListener('change', handleFileSelect);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading message
        output.innerHTML = '<div class="loading">กำลังประมวลผล...</div>';

        const reader = new FileReader();
        reader.onload = function(e) {
            // Show preview
            preview.src = e.target.result;
            preview.style.display = 'block';

            // Process the image
            processImage(e.target.result);
        };
        
        reader.onerror = function() {
            showError('เกิดข้อผิดพลาดในการอ่านไฟล์');
        };
        
        reader.readAsDataURL(file);
    }

    function processImage(imageSrc) {
        const img = new Image();
        img.onload = function() {
            try {
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Scan for QR code
                const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

                if (qrCode) {
                    showSuccess(qrCode.data);
                    // Fire event to AL
                    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnQrCodeScanned', [qrCode.data]);
                } else {
                    showError('ไม่พบ QR Code ในรูปภาพนี้');
                    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnScanError', ['ไม่พบ QR Code ในรูปภาพนี้']);
                }
            } catch (error) {
                showError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ: ' + error.message);
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnScanError', [error.message]);
            }
        };
        
        img.onerror = function() {
            showError('ไม่สามารถโหลดรูปภาพได้');
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnScanError', ['ไม่สามารถโหลดรูปภาพได้']);
        };
        
        img.src = imageSrc;
    }

    function showSuccess(data) {
        output.innerHTML = `
            <div class="success-message">
                <span class="success-icon">✅</span>
                <strong>พบ QR Code:</strong>
                <div class="qr-data">${escapeHtml(data)}</div>
            </div>
        `;
    }

    function showError(message) {
        output.innerHTML = `
            <div class="error-message">
                <span class="error-icon">❌</span>
                <strong>ข้อผิดพลาด:</strong>
                <div class="error-text">${escapeHtml(message)}</div>
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // Auto-initialize when script loads
    document.addEventListener('DOMContentLoaded', function() {
        setupQrScanner();
    });

    // Fallback initialization
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupQrScanner();
    }
})();