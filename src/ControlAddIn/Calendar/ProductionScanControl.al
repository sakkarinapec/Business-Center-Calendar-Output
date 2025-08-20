controladdin "Production Scan Control"
{
    RequestedHeight = 400;
    MinimumHeight = 300;
    RequestedWidth = 600;
    MinimumWidth = 500;
    VerticalStretch = false;
    VerticalShrink = false;
    HorizontalStretch = true;
    HorizontalShrink = true;

    Scripts = 'src\Resources\ProductionOutput\ProductionScanControl.js';
    StyleSheets = 'src\Resources\ProductionOutput\ProductionScanControl.css';

    /// <summary>
    /// Initializes the production scan control
    /// </summary>
    procedure InitializeControl();

    /// <summary>
    /// Sets the current production scan data
    /// </summary>
    /// <param name="productionScanData">The production scan data to display</param>
    procedure SetProductionScanData(productionScanData: Text);

    /// <summary>
    /// Enables or disables the QR scanner
    /// </summary>
    /// <param name="enabled">Whether to enable the scanner</param>
    procedure SetScannerEnabled(enabled: Boolean);

    /// <summary>
    /// Event fired when the control is ready
    /// </summary>
    event OnControlReady();

    /// <summary>
    /// Event fired when production scan data is validated
    /// </summary>
    /// <param name="POText">Production Order text</param>
    /// <param name="RoutingText">Routing text</param>
    /// <param name="LocationText">Location text</param>
    /// <param name="RoutingRefText">Routing reference text</param>
    event OnProductionScanValidated(POText: Text; RoutingText: Text; LocationText: Text; RoutingRefText: Text);

    /// <summary>
    /// Event fired when QR code is scanned successfully
    /// </summary>
    /// <param name="QrData">The scanned QR data</param>
    event OnQrCodeScanned(QrData: Text);

    /// <summary>
    /// Event fired when there's a scan error
    /// </summary>
    /// <param name="ErrorMessage">The error message</param>
    event OnScanError(ErrorMessage: Text);

    /// <summary>
    /// Event fired when manual input changes
    /// </summary>
    /// <param name="InputValue">The input value</param>
    event OnManualInputChanged(InputValue: Text);
}