table 90501 "Output Header ap"
{
    DataClassification = ToBeClassified;
    Caption = 'Output Header';
    DataCaptionFields = "No.",Description;
    fields
    {
        field(1; "No."; Code[20])
        {
            DataClassification = CustomerContent;
            Caption = 'No.';
            TableRelation = "Production Order"."No.";
        }
        field(2; "Description"; Text[120])
        {
            DataClassification = CustomerContent;
            Caption = 'Description';
            // TableRelation = "Production Order"."Description";
        }

        field(500; "Production Scan"; Text[100])
        {
            Caption = 'Scanned Scan';
            DataClassification = ToBeClassified;
        }
        // field(501; "Standard Pack"; Decimal)
        // {
        //     Caption = 'Standard Pack';
        // }
        // field(502; "Confirm Quantity"; Decimal)
        // {
        //     Caption = 'Confirm Quantity';
        // }
        // field(503; "PO No."; Text[100])
        // {
        //     Caption = 'Prod Order No.';
        // }
        // field(504; "PO Test No."; Text[100])
        // {
        //     Caption = 'Prod Test No.';
        // }
        // field(505; "Test."; Text[100])
        // {
        //     Caption = 'Prod Test No.';
        // }

    }
}