page 90502 "Output Header ap"
{
    ApplicationArea = All;
    Caption = 'Output Header Card';
    SourceTable = "Production Order";
    // SourceTable = "Item Journal Line";
    UsageCategory = Administration;

    layout
    {
        area(Content)
        {
            group(General)
            {

                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    Editable = false;
                    // ShowCaption = false; 
                }
                field("Location Code"; Rec."Location Code")
                {
                    ApplicationArea = All;
                }
            }

            group(Production_Scan)
            {
                // field("Routing No.";Rec."Routing No.") // Routing refernece No
                // {
                //     ApplicationArea = All;
                // }
                field("Production Scan_"; "Production Scan") // Production Scan 
                {
                    ApplicationArea = All;
                    ToolTip = 'ข้อมูลที่ได้จากการสแกนบาร์โค้ดหรือ QR Code';
                    trigger OnValidate()
                    var
                        PO: Record "Production Order";
                        POLine: Record "Prod. Order Line";
                        PORount: Record "Prod. Order Routing Line";
                        POCom: Record "Prod. Order Component";
                        POText: Text;
                        RoutingText: Text;
                        Parts: List of [Text];
                    begin
                        // แยกข้อความด้วย '|'
                        Parts := "Production Scan".Split('|');

                        if Parts.Count() >= 1 then
                            POText := DelChr(Parts.Get(1), '<>', ' '); // Production Order No.

                        if Parts.Count() >= 2 then
                            RoutingText := DelChr(Parts.Get(2), '<>', ' '); // Routing No. (ถ้ามี)

                        PO.SetRange("No.", POText);
                        if PO.FindFirst() then begin
                            DescriptionM := PO.Description;

                            "Prod. Order No." := PO."No.";

                            POLine.SetRange("Prod. Order No.", POText);
                            if RoutingText <> '' then
                                POLine.SetRange("Routing No.", RoutingText);

                            if POLine.FindFirst() then begin
                                "Routing No." := POLine."Routing No.";
                                "Routing Reference No." := POLine."Routing Reference No.";
                                "Remaining Quantity" := POLine."Remaining Quantity";

                                PORount.SetRange("Prod. Order No.", POText);
                                PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
                                if PORount.FindFirst() then
                                    "Operation No." := PORount."Operation No.";

                                // ใช้ Line No. กรอง Prod. Order Component แทน Routing Reference No.
                                POCom.SetRange("Prod. Order No.", POText);
                                POCom.SetRange("Prod. Order Line No.", POLine."Line No.");
                                if POCom.FindFirst() then begin
                                    // "Standard Task Code" := POCom."Standard Task Code";
                                    Quantity := POCom.Quantity;
                                end else begin
                                    "Standard Task Code" := ' ';
                                    Quantity := 0;
                                end;

                            end else
                                Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);
                        end else
                            Error('ไม่พบ Production Order No. %1', POText);
                    end;
                }
                label(BeforeSetupCloseMessage)
                {
                    ApplicationArea = Basic, Suite;
                    Caption = 'Test.';
                }
                field(DescriptionM; DescriptionM)
                {
                    ApplicationArea = All;
                    Editable = false;
                }

                field("Prod. Order No."; "Prod. Order No.")
                {
                    ApplicationArea = All;
                }
                field("Routing No."; "Routing No.") //Routing No.
                {
                    ApplicationArea = All;
                }
                field("Routing Reference No."; "Routing Reference No.")
                {
                    ApplicationArea = All;
                }
                field("Operation No."; "Operation No.")
                {
                    ApplicationArea = All;
                }
                field("Remaining Quantity"; "Remaining Quantity")
                {

                }
                field(Quantity; Quantity)
                {
                    ApplicationArea = All;
                }
            }

        }

    }
    actions
    {
        area(Processing)
        {

            action(Post_ap)
            {
                Caption = 'Post';
                Image = Post;
                trigger OnAction()
                begin
                    Message('Test Post');
                end;
            }


        }
        area(Promoted)
        {
            group(Category_Process)
            {
                Caption = 'Home ';
                actionref(Show_Promoted1; "Post_ap") { }
                // actionref(Show_Promoted; "ViewScannedData") { }
                // actionref(Show_Promoted3; "TestScan") { }
                // actionref(Show_Promoted4; "ClearData") { }
            }
            group(Category_Print)
            {
                Caption = 'Print/Post ';
                // actionref(Show_Promoted1; "Post_ap") { }
                // actionref(Show_Promoted2; "Report_ap") { }
            }
        }
    }
    var
        inputNo: Code[20];
        DescriptionM: Text;
        "Prod. Order No.": Code[20];
        "Routing No.": Code[20];
        "Routing Reference No.": Integer;
        "Operation No.": Code[20];
        "Standard Task Code": Decimal;
        "Production Scan": text;
        Quantity: Decimal;
        "Remaining Quantity": Decimal;
    // local procedure GetInfoLine(): Text
    // begin
    //     exit(
    //         Rec.FieldCaption("PO No.") + ': ' + Rec."PO No." +
    //         ' | ' + Rec.FieldCaption("Due Date") + ': ' + Format(Rec."Due Date")
    //     );
    // end;
}