// QrCodeCamera.js
(function() {
    'use strict';
    
    let fileInput, preview, canvas, output, video, startCameraBtn, stopCameraBtn, controlAddIn;
    let isScanning = false;
    let animationId = null;
    let stream = null;
    
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
            preview.style.display = 'none';
            preview.src = '#';
        }
        if (video) {
            video.style.display = 'none';
        }
        if (fileInput) {
            fileInput.value = '';
        }
        stopCamera();
    };

    window.StartCamera = function() {
        startCamera();
    };

    window.StopCamera = function() {
        stopCamera();
    };

    function setupQrScanner() {
        // Create the HTML structure
        const container = document.body;
        // <h2 class="scanner-title">📷 อ่าน QR Code</h2>
        container.innerHTML = `
            <div class="qr-scanner-container">
                
                <div class="control-buttons">
                    <button id="startCameraBtn" class="control-btn camera-btn">
                        📹 เปิดกล้อง
                    </button>
                    <button id="stopCameraBtn" class="control-btn stop-btn" style="display: none;">
                        ❌ ปิดกล้อง
                    </button>
                </div>
                
                <div class="upload-section">
                    <input type="file" id="fileInput" accept="image/*" class="file-input">
                    <label for="fileInput" class="file-label">
                        📁 เลือกรูปภาพ QR Code
                    </label>
                </div>
                
                <canvas id="canvas" style="display: none;"></canvas>
                
                <div class="camera-section">
                    <video id="video" autoplay muted playsinline class="camera-video" style="display: none;"></video>
                    <div id="scanOverlay" class="scan-overlay" style="display: none;">
                        <div class="scan-frame"></div>
                        <div class="scan-instructions">วาง QR Code ให้อยู่ในกรอบ</div>
                    </div>
                </div>
                
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
        video = document.getElementById('video');
        startCameraBtn = document.getElementById('startCameraBtn');
        stopCameraBtn = document.getElementById('stopCameraBtn');

        // Add event listeners
        fileInput.addEventListener('change', handleFileSelect);
        startCameraBtn.addEventListener('click', startCamera);
        stopCameraBtn.addEventListener('click', stopCamera);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Stop camera if running
        stopCamera();

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

    async function startCamera() {
        try {
            // Request camera permissions
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            
            video.srcObject = stream;
            video.style.display = 'block';
            document.getElementById('scanOverlay').style.display = 'block';
            
            // Hide preview image when camera starts
            preview.style.display = 'none';
            
            // Update button states
            startCameraBtn.style.display = 'none';
            stopCameraBtn.style.display = 'inline-block';
            
            // Start scanning
            isScanning = true;
            output.innerHTML = '<div class="loading">🔍 กำลังสแกน QR Code...</div>';
            
            // Wait for video to be ready
            video.onloadedmetadata = () => {
                scanQRCode();
            };
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMsg = 'ไม่สามารถเข้าถึงกล้องได้';
            
            if (error.name === 'NotAllowedError') {
                errorMsg = 'กรุณาอนุญาตการใช้งานกล้อง';
            } else if (error.name === 'NotFoundError') {
                errorMsg = 'ไม่พบกล้องในอุปกรณ์';
            } else if (error.name === 'NotSupportedError') {
                errorMsg = 'เบราว์เซอร์ไม่รองรับการใช้งานกล้อง';
            }
            
            showError(errorMsg);
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnScanError', [errorMsg]);
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        if (video) {
            video.style.display = 'none';
            video.srcObject = null;
        }
        
        document.getElementById('scanOverlay').style.display = 'none';
        
        // Update button states
        startCameraBtn.style.display = 'inline-block';
        stopCameraBtn.style.display = 'none';
        
        // Stop scanning
        isScanning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function scanQRCode() {
        if (!isScanning || !video || video.videoWidth === 0) {
            if (isScanning) {
                animationId = requestAnimationFrame(scanQRCode);
            }
            return;
        }

        try {
            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data and scan for QR code
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

            if (qrCode) {
                // QR Code found!
                isScanning = false;
                stopCamera();
                
                showSuccess(qrCode.data);
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnQrCodeScanned', [qrCode.data]);
                return;
            }

        } catch (error) {
            console.error('Error during scanning:', error);
        }

        // Continue scanning
        if (isScanning) {
            animationId = requestAnimationFrame(scanQRCode);
        }
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