controladdin "QrCode_Scan"
{
    RequestedHeight = 600;
    // RequestedWidth = 600;
    // MinimumHeight = 300;
    // MinimumWidth = 400;
    // MaximumHeight = 800;
    // MaximumWidth = 1200;
    VerticalStretch = true;
    VerticalShrink = true;
    HorizontalStretch = true;
    HorizontalShrink = true;

    Scripts = 'https://unpkg.com/jsqr/dist/jsQR.js',
              'src\Resources\Scan\QrCodeCamera.js';
    StyleSheets = 'src\Resources\Scan\QrCodeCamera.css';

    // Events from JavaScript to AL
    // event OnQrCodeScanned(qrData: Text);
    event OnError(errorMessage: Text);
    event OnControlReady()
    event OnControlAddInReady()

    // Functions callable from AL
    procedure StartCamera();
    procedure StopCamera();
    procedure ScanFromFile();
    event OnQrCodeScanned(QrData: Text);
    event OnScanError(ErrorMessage: Text);
    procedure InitializeScanner();
    procedure ClearResult();

    
}