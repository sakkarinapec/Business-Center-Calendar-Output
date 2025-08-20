page 90504 "Output Header"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Documents;
    Caption = 'Output Header Card';
    SourceTable = "Item Journal Line";
    DelayedInsert = true;
    InsertAllowed = false; // 🚫 ไม่ให้กด New

    layout
    {
        area(Content)
        {
            group(General)
            {
                field("Order No."; Rec."Order No.")
                {
                    ApplicationArea = All;
                }
                field("Document No."; Rec."Document No.")
                {
                    ApplicationArea = All;
                    Editable = false;
                }
                field("Document Date"; Rec."Document Date")
                {
                    ApplicationArea = All;
                }
                field("Posting Date"; Rec."Posting Date")
                {
                    ApplicationArea = All;
                }
                field(SystemCreatedBy; Rec.SystemCreatedBy)
                {
                    ApplicationArea = All;
                }
                field("Source No."; Rec."Source No.")
                {
                    ApplicationArea = All;
                }
                field("Journal Template Name"; Rec."Journal Template Name")
                {
                    ApplicationArea = All;
                    Lookup = true;
                    trigger OnLookup(var Text: Text): Boolean
                    var
                        ItemJnlTemplate: Record "Item Journal Template";
                    begin
                        ItemJnlTemplate.SetRange(Type, ItemJnlTemplate.Type::Output);
                        if PAGE.RunModal(PAGE::"Item Journal Templates", ItemJnlTemplate) = ACTION::LookupOK then begin
                            Rec."Journal Template Name" := ItemJnlTemplate."Name";
                            SetDefaultBatch();
                            exit(true);
                        end;
                        exit(false);
                    end;

                    trigger OnValidate()
                    var
                        ItemJnlTemplate: Record "Item Journal Template";
                    begin
                        if Rec."Journal Template Name" = '' then
                            Error('กรุณาระบุ Journal Template Name');

                        if not ItemJnlTemplate.Get(Rec."Journal Template Name") then
                            Error('Journal Template Name "%1" ไม่พบในระบบ', Rec."Journal Template Name");

                        SetDefaultBatch();
                    end;
                }
                field("Journal Batch Name"; Rec."Journal Batch Name")
                {
                    ApplicationArea = All;
                    Lookup = true;

                    trigger OnLookup(var Text: Text): Boolean
                    var
                        ItemJnlBatch: Record "Item Journal Batch";
                    begin
                        if Rec."Journal Template Name" = '' then
                            Error('กรุณาระบุ Journal Template Name ก่อน');

                        ItemJnlBatch.SetRange("Journal Template Name", Rec."Journal Template Name");
                        if PAGE.RunModal(PAGE::"Item Journal Batches", ItemJnlBatch) = ACTION::LookupOK then begin
                            Rec."Journal Batch Name" := ItemJnlBatch.Name;
                            exit(true);
                        end;
                        exit(false);
                    end;
                }
                field("Location Code"; Rec."Location Code")
                {
                    ApplicationArea = All;
                }
                field("Work Center No."; Rec."Work Center No.")
                {
                    ApplicationArea = All;
                    Editable = true;
                }
            }

            group(Production_Scan_)
            {
                Caption = 'Production Scan';
                group("Prdd. Info")
                {
                    Caption = 'Production Info';
                    field("Prod. Order No."; POLine."Prod. Order No.")
                    {
                        ApplicationArea = All;
                        Editable = false;
                        trigger OnDrillDown()
                        var
                            ProdOrder: Record "Production Order";
                        begin
                            ProdOrder.SetRange("No.", POLine."Prod. Order No.");
                            if ProdOrder.FindFirst() then
                                PAGE.Run(PAGE::"Released Production Order", ProdOrder);
                        end;
                    }
                    field("Routing Reference No."; POLine."Routing Reference No.")
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Routing No."; POLine."Routing No.")
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Operation No."; PORount."Operation No.")
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Description"; POLine.Description)
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Remaining Quantity"; POLine."Remaining Quantity")
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Finished Quantity"; POLine."Finished Quantity")
                    {
                        ApplicationArea = All;
                        Editable = false;
                    }
                    field("Output Quantity"; Rec."Output Quantity")
                    {
                        Caption = 'Output Quantity';
                        ApplicationArea = All;
                        Editable = true;

                        trigger OnValidate()
                        begin
                            ValidateOutputQuantityCustom();
                        end;
                    }
                    field("Applies-to Entry"; Rec."Applies-to Entry")
                    {
                        ApplicationArea = All;
                    }
                    field("Production Location_Code"; ProdOrderRec."Location Code")
                    {
                        Caption = 'Location Code';
                        ApplicationArea = All;
                        Editable = true;
                    }
                }

                group("Production_Scan System")
                {
                    Caption = 'Production Scan';
                    field("Production Scan"; ProdOrderRec."Production Scan")
                    {
                        ApplicationArea = All;

                        // trigger OnValidate()
                        // var
                        //     POText: Text;
                        //     RoutingText: Text;
                        //     Parts: List of [Text];
                        //     LocationText: Text;
                        //     RoutingRefText: Text;
                        // begin
                        //     Parts := ProdOrderRec."Production Scan".Split('|');

                        //     if Parts.Count() >= 1 then
                        //         POText := DelChr(Parts.Get(1), '<>', ' ');

                        //     if Parts.Count() >= 2 then
                        //         RoutingText := DelChr(Parts.Get(2), '<>', ' ');

                        //     if Parts.Count() >= 3 then
                        //         LocationText := DelChr(Parts.Get(3), '<>', ' ');

                        //     if Parts.Count() >= 4 then
                        //         RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

                        //     ProcessProductionScanData(POText, RoutingText, LocationText, RoutingRefText);
                        // end;
                        trigger OnValidate()
                        var
                            POText: Text;
                            RoutingText: Text;
                            Parts: List of [Text];
                            LocationText: Text;
                            RoutingRefText: Text;
                        begin
                            // ตรวจสอบว่า Production Scan ไม่ว่าง
                            if ProdOrderRec."Production Scan" = '' then
                                exit;

                            Parts := ProdOrderRec."Production Scan".Split('|');

                            // ตรวจสอบว่าต้องมีข้อมูลอย่างน้อย 2 ส่วน (PO และ Routing)
                            if Parts.Count() < 2 then
                                Error('รูปแบบการสแกนไม่ถูกต้อง กรุณาใช้รูปแบบ: PO|Routing|Location|RoutingRef (Location สามารถว่างได้)');

                            // ส่วนที่ 1: Production Order (จำเป็น)
                            POText := DelChr(Parts.Get(1), '<>', ' ');
                            if POText = '' then
                                Error('กรุณาระบุหมายเลข Production Order');

                            // ส่วนที่ 2: Routing (จำเป็น)  
                            RoutingText := DelChr(Parts.Get(2), '<>', ' ');
                            if RoutingText = '' then
                                Error('กรุณาระบุหมายเลข Routing');

                            // ส่วนที่ 3: Location (ไม่จำเป็น สามารถว่างได้)
                            if Parts.Count() >= 3 then
                                LocationText := DelChr(Parts.Get(3), '<>', ' ');

                            // ส่วนที่ 4: Routing Reference (ไม่จำเป็น)
                            if Parts.Count() >= 4 then
                                RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

                            ProcessProductionScanData(POText, RoutingText, LocationText, RoutingRefText);
                        end;
                    }
                    usercontrol("QrCode Scanner"; "QrCode_Scan")
                    {
                        ApplicationArea = All;

                        trigger OnControlReady()
                        begin
                            CurrPage."QrCode Scanner".InitializeScanner();
                        end;

                        trigger OnQrCodeScanned(QrData: Text)
                        begin
                            ProcessProductionScan(QrData);
                            CurrPage.Update(false);
                            Message('QR Code scanned successfully: %1', QrData);
                        end;

                        trigger OnScanError(ErrorMessage: Text)
                        begin
                            Message('QR Scan Error: %1', ErrorMessage);
                        end;
                    }
                }
            }
        }
    }
    actions
    {
        area(Processing)
        {
            action(Post)
            {
                Caption = 'Post';
                Image = PostDocument;
                ShortCutKey = 'F9';

                trigger OnAction()
                begin
                    PostOutput();
                end;
            }

            action(ClearLine)
            {
                Caption = 'Clear Line';

                trigger OnAction()
                begin
                    ClearCurrentLine();
                end;
            }

            action(CreateNewLine)
            {
                Caption = 'Create New Line';
                Image = New;

                trigger OnAction()
                begin
                    CreateNewOutputLine();
                end;
            }
        }

        area(Promoted)
        {
            group(Category_Process)
            {
                Caption = 'Process';
                actionref(Post_Promoted; Post) { }
            }
            group(Category_Actions)
            {
                Caption = 'Actions';
                actionref(ClearLine_Promoted; ClearLine) { }
                actionref(CreateNewLine_Promoted; CreateNewLine) { }
            }
        }
    }

    trigger OnOpenPage()
    begin
        InitializePage();
    end;

    trigger OnNewRecord(BelowxRec: Boolean)
    begin
        InitializeNewRecord();
    end;

    var
        ProdOrderRec: Record "Production Order";
        POLine: Record "Prod. Order Line";
        PORount: Record "Prod. Order Routing Line";
        ItemJournalLine: Record "Item Journal Line";
        TempItemJnlLine: Record "Item Journal Line" temporary;
        ToTemplateName: Code[10];
        ToBatchName: Code[10];
        ProdOrder: Record "Production Order";
        ProdOrderLineNo: Integer;
        FlushingFilter: Enum "Flushing Method Filter";
        AllowNegativeOutput: Boolean;

    local procedure InitializePage()
    var
        ItemJnlTemplate: Record "Item Journal Template";
        ItemJnlBatch: Record "Item Journal Batch";
    begin
        // Auto-select default template if not set
        if Rec."Journal Template Name" = '' then begin
            ItemJnlTemplate.SetRange(Type, ItemJnlTemplate.Type::Output);
            if ItemJnlTemplate.FindFirst() then begin
                Rec."Journal Template Name" := ItemJnlTemplate.Name;
                ToTemplateName := ItemJnlTemplate.Name;
            end;
        end;

        // Auto-select or create default batch
        if (Rec."Journal Template Name" <> '') and (Rec."Journal Batch Name" = '') then
            SetDefaultBatch();

        // Initialize default values if new record
        if Rec."Document Date" = 0D then
            Rec."Document Date" := WorkDate();
        if Rec."Posting Date" = 0D then
            Rec."Posting Date" := WorkDate();
    end;

    local procedure InitializeNewRecord()
    begin
        Rec."Entry Type" := Rec."Entry Type"::Output;
        Rec."Document Date" := WorkDate();
        Rec."Posting Date" := WorkDate();

        // Set template and batch if available
        if ToTemplateName <> '' then
            Rec."Journal Template Name" := ToTemplateName;
        if ToBatchName <> '' then
            Rec."Journal Batch Name" := ToBatchName;
    end;

    local procedure SetDefaultBatch()
    var
        ItemJnlBatch: Record "Item Journal Batch";
    begin
        if Rec."Journal Template Name" = '' then
            exit;

        ItemJnlBatch.SetRange("Journal Template Name", Rec."Journal Template Name");
        if not ItemJnlBatch.FindFirst() then begin
            // Create default batch if none exists
            CreateDefaultBatch();
            ItemJnlBatch.SetRange("Journal Template Name", Rec."Journal Template Name");
            ItemJnlBatch.FindFirst();
        end;

        Rec."Journal Batch Name" := ItemJnlBatch.Name;
        ToBatchName := ItemJnlBatch.Name;
    end;

    local procedure CreateDefaultBatch()
    var
        ItemJnlBatch: Record "Item Journal Batch";
    // NoSeriesMgt: Codeunit NoSeriesManagement;
    begin
        ItemJnlBatch.Init();
        ItemJnlBatch."Journal Template Name" := Rec."Journal Template Name";
        ItemJnlBatch.Name := 'DEFAULT';
        ItemJnlBatch.Description := 'Default Output Journal Batch';
        if ItemJnlBatch.Insert() then;
    end;

    local procedure CreateNewOutputLine()
    var
        NewItemJnlLine: Record "Item Journal Line";
        ItemJnlMgt: Codeunit ItemJnlManagement;
        LineNo: Integer;
    begin
        // Validate required fields
        if Rec."Journal Template Name" = '' then
            Error('กรุณาระบุ Journal Template Name ก่อน');
        if Rec."Journal Batch Name" = '' then
            Error('กรุณาระบุ Journal Batch Name ก่อน');

        // Get next line number
        NewItemJnlLine.SetRange("Journal Template Name", Rec."Journal Template Name");
        NewItemJnlLine.SetRange("Journal Batch Name", Rec."Journal Batch Name");
        if NewItemJnlLine.FindLast() then
            LineNo := NewItemJnlLine."Line No." + 10000
        else
            LineNo := 10000;

        // Create new line
        NewItemJnlLine.Init();
        NewItemJnlLine."Journal Template Name" := Rec."Journal Template Name";
        NewItemJnlLine."Journal Batch Name" := Rec."Journal Batch Name";
        NewItemJnlLine."Line No." := LineNo;
        NewItemJnlLine."Entry Type" := NewItemJnlLine."Entry Type"::Output;
        NewItemJnlLine."Document Date" := WorkDate();
        NewItemJnlLine."Posting Date" := WorkDate();
        NewItemJnlLine.Insert();

        // Navigate to new line
        Rec := NewItemJnlLine;
        CurrPage.Update(false);

        Message('สร้าง Output Journal Line ใหม่เรียบร้อยแล้ว');
    end;

    local procedure ProcessProductionScanData(POText: Text; RoutingText: Text; LocationText: Text; RoutingRefText: Text)
    begin
        // Validate that we have a journal line to work with
        if Rec."Journal Template Name" = '' then
            Error('กรุณาระบุ Journal Template Name ก่อน');
        if Rec."Journal Batch Name" = '' then
            Error('กรุณาระบุ Journal Batch Name ก่อน');

        // If current record is not inserted, insert it first
        if not Rec.Find() then begin
            if Rec."Line No." = 0 then
                Rec."Line No." := 10000;
            Rec.Insert();
        end;

        // Find Production Order
        ProdOrderRec.SetRange("No.", POText);
        if not ProdOrderRec.FindFirst() then
            Error('ไม่พบ Production Order No. %1', POText);

        // Find Production Order Line
        POLine.SetRange("Prod. Order No.", POText);
        if RoutingText <> '' then
            POLine.SetRange("Routing No.", RoutingText);

        if not POLine.FindFirst() then
            Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);

        // Find Routing Operation
        PORount.SetRange("Prod. Order No.", POText);
        PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
        if PORount.FindFirst() then
            Rec."Operation No." := PORount."Operation No."
        else
            Error('ไม่พบ Routing Operation สำหรับ PO %1 และ Routing Ref. %2', POText, POLine."Routing Reference No.");

        // Update record fields
        Rec."Source No." := POText;
        Rec."Order No." := POText;
        Rec."Document No." := POText;
        Rec."Order Type" := Rec."Order Type"::Production;
        Rec."Order Line No." := POLine."Line No.";
        Rec."Routing Reference No." := POLine."Routing Reference No.";
        Rec."Routing No." := POLine."Routing No.";

        if Rec."Entry Type" <> Rec."Entry Type"::Output then
            Rec.Validate("Entry Type", Rec."Entry Type"::Output);

        Rec.Validate("Item No.", POLine."Item No.");
        SetOutputQuantityDirect(POLine."Remaining Quantity");

        if PORount."Work Center No." <> '' then begin
            Rec.Validate("Work Center No.", PORount."Work Center No.");
            Rec.Validate(Type, Rec.Type::"Work Center");
            Rec.Validate("No.", PORount."Work Center No.");
        end;

        // Save the record
        Rec.Modify();

        // Update global variables
        ProdOrder := ProdOrderRec;
        ProdOrderLineNo := POLine."Line No.";
        ToTemplateName := Rec."Journal Template Name";
        ToBatchName := Rec."Journal Batch Name";

        CurrPage.Update(true);
    end;

    local procedure ProcessProductionScan(QrData: Text)
    var
        POText, RoutingText, LocationText, RoutingRefText : Text;
        Parts: List of [Text];
    begin
        Parts := QrData.Split('|');

        if Parts.Count() >= 1 then
            POText := DelChr(Parts.Get(1), '<>', ' ');

        if Parts.Count() >= 2 then
            RoutingText := DelChr(Parts.Get(2), '<>', ' ');

        if Parts.Count() >= 3 then
            LocationText := DelChr(Parts.Get(3), '<>', ' ');

        if Parts.Count() >= 4 then
            RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

        ProcessProductionScanData(POText, RoutingText, LocationText, RoutingRefText);
    end;

    // Keep all your existing procedures here...
    local procedure PostOutput(Print: Boolean)
    begin
        // Validate essential fields
        if Rec."Output Quantity" = 0 then
            Error('Output Quantity cannot be zero');

        if Rec."Item No." = '' then
            Error('Item No. must be specified');

        if Rec."Order No." = '' then
            Error('Order No. must be specified');

        // For Output entries, validate capacity fields
        if Rec."Entry Type" = Rec."Entry Type"::Output then begin
            if Rec."Operation No." = '' then
                Error('Operation No. must be specified for Output entry');

            if Rec."No." = '' then
                Error('Work Center No. or Machine Center No. must be specified');

            if Rec."Work Center No." = '' then
                Error('Work Center No. must be specified');
        end;

        // Handle negative quantities - require Applies-to Entry for corrections
        if Rec."Output Quantity" < 0 then begin
            if Rec."Applies-to Entry" = 0 then
                Error('Applies-to Entry must be specified for negative Output Quantity (corrections)');
        end;

        // Proceed with posting
        DeleteTempRec();
        PostItemJournalFromProduction(Print);
        InsertTempRec();
        SetFilterGroup();
        CurrPage.Update(false);

        if Rec."Output Quantity" < 0 then
            Message('Output correction posted successfully')
        // else
        // Message('Output posted successfully');
    end;

    local procedure PostOutput()
    begin
        PostOutput(false);
    end;

    local procedure ValidateOutputQuantityCustom()
    var
        Item: Record Item;
        WhseValidateSourceLine: Codeunit "Whse. Validate Source Line";
    begin
        Rec.TestField("Entry Type", Rec."Entry Type"::Output);

        // Skip subcontracting validation for negative quantities (corrections)
        if (Rec."Output Quantity" > 0) and SubcontractingWorkCenterUsed() and (Rec."Output Quantity" <> 0) then
            Error('Cannot specify %1 for subcontracted operations', Rec.FieldCaption("Output Quantity"));

        // Allow negative quantities for corrections without finished operation check
        if Rec."Output Quantity" > 0 then
            CheckConfirmOutputOnFinishedOperation();

        if LastOutputOperation(Rec) then begin
            Item.Get(Rec."Item No.");
            if Item.IsInventoriableType() then
                WhseValidateSourceLine.ItemLineVerifyChange(Rec, xRec);
        end;

        // Calculate base quantity (allow negative)
        Rec."Output Quantity (Base)" := CalcBaseQty(Rec."Output Quantity", Rec.FieldCaption("Output Quantity"), Rec.FieldCaption("Output Quantity (Base)"));

        // Set main quantity
        Rec.Validate(Quantity, Rec."Output Quantity");
        ValidateQuantityIsBalanced();
    end;

    local procedure SetOutputQuantityDirect(NewOutputQty: Decimal)
    begin
        // Set Output Quantity without triggering all validations
        Rec."Output Quantity" := NewOutputQty;
        Rec."Output Quantity (Base)" := CalcBaseQty(NewOutputQty, Rec.FieldCaption("Output Quantity"), Rec.FieldCaption("Output Quantity (Base)"));
        Rec.Quantity := NewOutputQty;
    end;

    local procedure ClearCurrentLine()
    begin
        Rec."Output Quantity" := 0;
        Rec."Applies-to Entry" := 0;
        Rec."Operation No." := '';
        Rec."Work Center No." := '';
        Rec."No." := '';
        Rec."Item No." := '';
        Rec."Order No." := '';
        Rec."Order Line No." := 0;
        Clear(ProdOrderRec."Production Scan");
        CurrPage.Update(true);
    end;

    // Add all other existing procedures here...
    local procedure PostItemJournalFromProduction(Print: Boolean)
    var
        ProductionOrder: Record "Production Order";
        IsHandled: Boolean;
    begin
        if (Rec."Order Type" = Rec."Order Type"::Production) and (Rec."Order No." <> '') then
            ProductionOrder.Get(ProductionOrder.Status::Released, Rec."Order No.");

        IsHandled := false;
        OnBeforePostingItemJnlFromProduction(Rec, Print, IsHandled);
        if IsHandled then
            exit;

        if Print then
            CODEUNIT.Run(CODEUNIT::"Item Jnl.-Post+Print", Rec)
        else
            CODEUNIT.Run(CODEUNIT::"Item Jnl.-Post", Rec);
    end;

    protected procedure DeleteTempRec()
    begin
        TempItemJnlLine.DeleteAll();

        if Rec.Find('-') then
            repeat
                case Rec."Entry Type" of
                    Rec."Entry Type"::Consumption:
                        if Rec."Quantity (Base)" = 0 then begin
                            TempItemJnlLine := Rec;
                            TempItemJnlLine.Insert();
                            Rec.Delete();
                        end;
                    Rec."Entry Type"::Output:
                        if Rec.TimeIsEmpty() and
                           (Rec."Output Quantity (Base)" = 0) and (Rec."Scrap Quantity (Base)" = 0)
                        then begin
                            TempItemJnlLine := Rec;
                            TempItemJnlLine.Insert();
                            Rec.Delete();
                        end;
                end;
            until Rec.Next() = 0;
    end;

    protected procedure InsertTempRec()
    begin
        if TempItemJnlLine.Find('-') then
            repeat
                Rec := TempItemJnlLine;
                Rec."Changed by User" := false;
                Rec.Insert();
            until TempItemJnlLine.Next() = 0;
        TempItemJnlLine.DeleteAll();
    end;

    procedure SetFilterGroup()
    begin
        Rec.FilterGroup(2);
        Rec.SetRange("Journal Template Name", ToTemplateName);
        Rec.SetRange("Journal Batch Name", ToBatchName);
        Rec.SetRange("Order Type", Rec."Order Type"::Production);
        Rec.SetRange("Order No.", ProdOrder."No.");
        if ProdOrderLineNo <> 0 then
            Rec.SetRange("Order Line No.", ProdOrderLineNo);
        SetFlushingFilter();
        OnAfterSetFilterGroup(Rec, ProdOrder, ProdOrderLineNo);
        Rec.FilterGroup(0);
    end;

    procedure SetFlushingFilter()
    begin
        case FlushingFilter of
            FlushingFilter::"All Methods":
                Rec.SetRange("Flushing Method");
            FlushingFilter::"Manual Methods":
                Rec.SetFilter("Flushing Method", '%1|%2', "Flushing Method"::"Pick + Manual", "Flushing Method"::"Pick + Manual");
            else
                Rec.SetRange("Flushing Method", FlushingFilter);
        end;
    end;

    // Helper procedures
    local procedure SubcontractingWorkCenterUsed(): Boolean
    var
        WorkCenter: Record "Work Center";
    begin
        if Rec."Work Center No." = '' then
            exit(false);

        if WorkCenter.Get(Rec."Work Center No.") then
            exit(WorkCenter."Subcontractor No." <> '');

        exit(false);
    end;

    local procedure CheckConfirmOutputOnFinishedOperation()
    var
        ProdOrderRtngLine: Record "Prod. Order Routing Line";
    begin
        // Add logic to check if operation is finished
    end;

    local procedure LastOutputOperation(ItemJnlLine: Record "Item Journal Line"): Boolean
    var
        ProdOrderRtngLine: Record "Prod. Order Routing Line";
    begin
        ProdOrderRtngLine.SetRange("Prod. Order No.", ItemJnlLine."Order No.");
        ProdOrderRtngLine.SetRange("Routing Reference No.", ItemJnlLine."Routing Reference No.");
        if ProdOrderRtngLine.FindLast() then
            exit(ProdOrderRtngLine."Operation No." = ItemJnlLine."Operation No.");

        exit(true);
    end;

    local procedure CalcBaseQty(Qty: Decimal; FromFieldName: Text; ToFieldName: Text): Decimal
    var
        UOMMgt: Codeunit "Unit of Measure Management";
    begin
        exit(UOMMgt.CalcBaseQty(
            Rec."Item No.", Rec."Variant Code", Rec."Unit of Measure Code", Qty, Rec."Qty. per Unit of Measure"));
    end;

    local procedure ValidateQuantityIsBalanced()
    begin
        // Add logic to validate quantity balance if needed
    end;

    [IntegrationEvent(false, false)]
    local procedure OnAfterSetFilterGroup(var ItemJournalLine: Record "Item Journal Line"; ProductionOrder: Record "Production Order"; ProdOrderLineNo: Integer)
    begin
    end;

    [IntegrationEvent(false, false)]
    local procedure OnBeforePostingItemJnlFromProduction(var ItemJournalLine: Record "Item Journal Line"; Print: Boolean; var IsHandled: Boolean)
    begin
    end;
}