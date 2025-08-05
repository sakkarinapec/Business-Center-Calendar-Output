report 90500 "Delivery Note / Tax Invoice"
{
    UsageCategory = ReportsAndAnalysis;
    ApplicationArea = All;
    DefaultLayout = RDLC;
    EnableExternalImages = true; // ✅ เพิ่มบรรทัดนี้
    RDLCLayout = './src/Layouts/Invoice.rdl';
    Caption = 'Report Production Order';

    dataset
    {
        // dataitem(CompanyINFO; "Company Information")
        // {
        //     // column(Name; Name) { }
        //     // column(Picture; Picture) { }
        //     // column(Address; Address) { }
        //     // column(Address_2; "Address 2") { }
        //     // column(Phone_No_; "Phone No.") { }
        //     // column(Fax_No_; "Fax No.") { }
        //     // column(City; City) { }
        //     // column(Post_Code; "Post Code") { }
        //     // column(Company_VAT_Registration_No_; "VAT Registration No.") { }
        //     column(User)
        // }
        dataitem("Production Order"; "Production Order")
        {
            DataItemTableView = sorting(Status, "No.");
            RequestFilterFields = "No.", Status;
            column(No_; "No.") { }
            column(Due_Date_; "Due Date") { }
            column(Starting_Date_; "Starting Date") { }
            column(Starting_Time_; "Starting Time") { }
            column(Ending_Date_; "Ending Date") { }
            column(Ending_Time_; "Ending Time") { }
            column(Planned_Order_No_; "Planned Order No.") { }
            column(Location_Code_ComInfo; "Location Code") { }
            column(Routing_No_; "Routing No.") { }
            column(Description; Description) { }
            column(COMPANYNAME; COMPANYPROPERTY.DisplayName()) { }
            column(User_ID; UserId()) { }
            column(Name; compoInFo.Name) { }
            column(Picture; compoInFo.Picture) { }
            column(Address; compoInFo.Address) { }
            column(Address_2; compoInFo."Address 2") { }
            column(Phone_No_; compoInFo."Phone No.") { }
            column(Fax_No_; compoInFo."Fax No.") { }
            column(City; compoInFo.City) { }
            column(Post_Code; compoInFo."Post Code") { }
            column(Company_VAT_Registration_No_; compoInFo."VAT Registration No.") { }
            column(QR_Code_Text; QRCode) { }
            column(QRCodeItemNo; QRCodeItemNo) { }

            // }
            dataitem("Prod. Order Line"; "Prod. Order Line")
            {
                // DataItemLink = "Prod. Order No." = field("No.");
                // DataItemLink = "Prod. Order No." = field("No."), "Routing No." = field("Routing No.");
                // DataItemLink = "Prod. Order No." = field("Prod. Order No.");
                // PrintOnlyIfDetail = true; // ✅ ป้องกันแสดงว่าง
                DataItemLink = Status = field(Status), "Prod. Order No." = field("No.");
                DataItemTableView = sorting(Status, "Prod. Order No.", "Line No.");
                column(Line_No_; "Line No.") { }
                column(Prod__Order_No_Line; "Prod. Order No.") { }
                column(Item_No_Line; "Item No.") { }
                dataitem("Prod. Order Components"; "Prod. Order Component")
                {
                    // DataItemLink = "Prod. Order No." = field("No.");
                    // DataItemLink = "Item No." = field("Line No.");
                    // DataItemLink = "Prod. Order No." = field("Prod. Order No.");
                    DataItemLink = Status = field(Status), "Prod. Order No." = field("Prod. Order No."), "Prod. Order Line No." = field("Line No.");
                    DataItemTableView = sorting(Status, "Prod. Order No.", "Prod. Order Line No.", "Line No.");
                    column(Item_No_; "Item No.") { }
                    column(Due_Date; "Due Date") { }
                    column(Description_Components; Description) { }
                    column(Unit_of_Measure_Code; "Unit of Measure Code") { }
                    column(Expected_Quantity; "Expected Quantity") { }
                    column(Location_Code_Com; "Location Code") { }
                }
                dataitem(Routing; "Prod. Order Routing Line")
                {
                    // DataItemLink = "Prod. Order No." = field("Prod. Order No.");
                    // DataItemLink = "Prod. Order No." = field("No.");
                    // DataItemLink = "Prod. Order No." = field("No."), "Routing No." = field("Routing No."); 
                    // DataItemTableView = sorting(Status, "No.");
                    DataItemLink = "Routing No." = field("Routing No."), "Routing Reference No." = field("Routing Reference No."), "Prod. Order No." = field("Prod. Order No."), Status = field(Status);
                    DataItemTableView = sorting(Status, "Prod. Order No.", "Routing Reference No.", "Routing No.", "Operation No.");
                    RequestFilterFields = "Routing No.", "Prod. Order No.";
                    column(RoutingNo; "Routing No.") { }
                    // column(Description; Description) { }
                    column(Prod__Order_No_; "Prod. Order No.") { }
                    column(No_Routing; "No.") { }
                    column(Starting_Date_Time; "Starting Date-Time") { }
                    column(Starting_Date; "Starting Date") { }
                    column(Starting_Time; "Starting Time") { }
                    column(Ending_Date_Time; "Ending Date-Time") { }
                    column(Ending_Date; "Ending Date") { }
                    column(Ending_Time; "Ending Time") { }
                    column(Location_Code; "Location Code") { }
                    column(Work_Center_No_; "Work Center No.") { }
                    column(Input_Quantity; "Input Quantity") { }
                    column(Description_; Description) { }
                    column(Type; Type) { }
                    column(Routing_Reference_No_; "Routing Reference No.") { }
                }
            }
            trigger OnAfterGetRecord()
            var
                BarcodeSymbology2D: Enum "Barcode Symbology 2D";
                BarcodeFontProvider2D: Interface "Barcode Font Provider 2D";
                BarcodeString: Text;
            begin
                // QRCodeItemNo := "Production Order"."No." + ' | ' + "Production Order".Description + ' | ' + "Production Order"."Routing No.";
                // QRCodeItemNo := "Production Order"."No." + ' | ' + "Production Order"."Routing No." + ' | ' + "Production Order"."Location Code"+ ' | ' + Format("Prod. Order Line"."Line No.") ;
                // QRCodeItemNo := "Production Order"."No." ;
                "Prod. Order Line".SetRange("Prod. Order No.", "Production Order"."No.");
                if "Prod. Order Line".FindFirst() then begin
                    QRCodeItemNo := "Production Order"."No." + ' | ' +
                                    "Production Order"."Routing No." + ' | ' +
                                    "Production Order"."Location Code" + ' | ' +
                                    Format("Prod. Order Line"."Line No.");
                end else
                    QRCodeItemNo := 'ไม่พบข้อมูล Line No.';
                BarcodeFontProvider2D := Enum::"Barcode Font Provider 2D"::IDAutomation2D;
                BarcodeSymbology2D := Enum::"Barcode Symbology 2D"::"QR-Code";
                QRCodeItemNo := BarcodeFontProvider2D.EncodeFont(QRCodeItemNo, BarcodeSymbology2D);
            end;
            // trigger OnAfterGetRecord()
            // begin
            //     GenerateQRCode("Routing No.");
            // end;

        }

    }

    var
        RoutingNoFilter: Code[20];
        ProdOrderNoFilter: Code[20];
        LineNoFilter: Integer;
        ItemNoFilter: Code[20];
        QRCode: Text[4000];
        BarcodeURL: Text;
        QRCodeItemNo: Text;

    trigger OnPreReport()

    begin
        compoInFo.Get();
        compoInFo.CalcFields(Picture);
    end;


    // local procedure GenerateQRCode(BarcodeURL: Text)
    // var
    //     BarcodeSymbology2D: Enum "Barcode Symbology 2D";
    //     BarcodeFontProvider2D: Interface "Barcode Font Provider 2D";
    //     BarcodeString: Text;
    // begin
    //     BarcodeFontProvider2D := Enum::"Barcode Font Provider 2D"::IDAutomation2D;
    //     BarcodeSymbology2D := Enum::"Barcode Symbology 2D"::"QR-Code";
    //     QRCode := BarcodeFontProvider2D.EncodeFont(BarcodeURL, BarcodeSymbology2D);
    //     //  "Item No." := ItemNo;
    //     // BarcodeURL := NewBarcodeURL;
    // end;
    // local procedure GenerateQRCode(RoutingNo: Code[20])
    // var
    //     BarcodeSymbology2D: Enum "Barcode Symbology 2D";
    //     BarcodeFontProvider2D: Interface "Barcode Font Provider 2D";
    // begin
    //     BarcodeFontProvider2D := Enum::"Barcode Font Provider 2D"::IDAutomation2D;
    //     BarcodeSymbology2D := Enum::"Barcode Symbology 2D"::"QR-Code";
    //     QRCode := BarcodeFontProvider2D.EncodeFont(RoutingNo, BarcodeSymbology2D);
    // end;


    var
        compoInFo: Record "Company Information";

}
// }
// }