tableextension 90500 "Production Order Ext. ap" extends "Production Order"
{

    // Caption = 'Production Order';
    // DataCaptionFields = "No.";
    fields
    {
        field(500; "Production Scan"; Text[100])
        {
            Caption = 'Scanned Scan';
            DataClassification = ToBeClassified;
        }
        field(501; "Standard Pack"; Decimal)
        {
            Caption = 'Standard Pack';
        }
        field(502; "Confirm Quantity"; Decimal)
        {
            Caption = 'Confirm Quantity';
        }
        field(503; "PO No."; Text[100])
        {
            Caption = 'Prod Order No.';
        }
        field(504; "PO Test No."; Text[100])
        {
            Caption = 'Prod Test No.';
        }
        field(505; "Test."; Text[100])
        {
            Caption = 'Prod Test No.';
        }

    }
}