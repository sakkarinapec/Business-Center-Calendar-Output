page 90504 "Output Header"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Documents;
    Caption = 'Output Header Card';
    SourceTable = "Item Journal Line";

    layout
    {
        area(Content)
        {
            group(General)
            {
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
                }
                field("Location Code"; Rec."Location Code")
                {
                    ApplicationArea = All;
                }
                field("Work Center No."; Rec."Work Center No.")
                {
                    ApplicationArea = All;
                }
            }

            group(Production_Scan_)
            {
                group("Prdd. Info")
                {
                    Caption = 'Production Info';
                    field("Prod. Order No."; POLine."Prod. Order No.")
                    {
                        ApplicationArea = All;
                        Editable = false;
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
                            // Allow negative quantities for corrections/reversals
                            ValidateOutputQuantityCustom();
                        end;
                    }
                    field("Applies-to Entry"; Rec."Applies-to Entry")
                    {
                        ApplicationArea = All;

                        // trigger OnLookup(var Text: Text): Boolean
                        // begin
                        //     SelectAppliesToEntry();
                        //     exit(true); // ถ้าคุณจัดการเอง
                        // end;
                    }
                    field("Production Location_Code"; ProdOrderRec."Location Code")
                    {
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

                        trigger OnValidate()
                        var
                            POText: Text;
                            RoutingText: Text;
                            Parts: List of [Text];
                            LocationText: Text;
                            RoutingRefText: Text;
                        begin
                            Parts := ProdOrderRec."Production Scan".Split('|');

                            if Parts.Count() >= 1 then
                                POText := DelChr(Parts.Get(1), '<>', ' ');

                            if Parts.Count() >= 2 then
                                RoutingText := DelChr(Parts.Get(2), '<>', ' ');

                            if Parts.Count() >= 3 then
                                LocationText := DelChr(Parts.Get(3), '<>', ' ');

                            if Parts.Count() >= 4 then
                                RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

                            ProdOrderRec.SetRange("No.", POText);
                            if not ProdOrderRec.FindFirst() then
                                Error('ไม่พบ Production Order No. %1', POText);

                            POLine.SetRange("Prod. Order No.", POText);
                            if RoutingText <> '' then
                                POLine.SetRange("Routing No.", RoutingText);

                            if not POLine.FindFirst() then
                                Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);

                            PORount.SetRange("Prod. Order No.", POText);
                            PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
                            if PORount.FindFirst() then
                                Rec."Operation No." := PORount."Operation No."
                            else
                                Error('ไม่พบ Routing Operation สำหรับ PO %1 และ Routing Ref. %2', POText, POLine."Routing Reference No.");

                            if POText <> '' then
                                Rec."Source No." := POText;

                            Rec."Order No." := POText;
                            Rec."Order Line No." := POLine."Line No.";
                            Rec."Routing Reference No." := POLine."Routing Reference No.";
                            Rec."Routing No." := POLine."Routing No.";

                            if Rec."Entry Type" <> Rec."Entry Type"::Output then
                                Rec.Validate("Entry Type", Rec."Entry Type"::Output);

                            Rec.Validate("Item No.", POLine."Item No.");

                            // Set Output Quantity without triggering standard validation
                            SetOutputQuantityDirect(POLine."Remaining Quantity");

                            // Set required fields for capacity posting
                            if PORount."Work Center No." <> '' then begin
                                Rec.Validate("Work Center No.", PORount."Work Center No.");
                                Rec.Validate(Type, Rec.Type::"Work Center");
                                Rec.Validate("No.", PORount."Work Center No.");
                            end;

                            // Initialize required variables for posting
                            ProdOrder := ProdOrderRec;
                            ProdOrderLineNo := POLine."Line No.";
                            ToTemplateName := Rec."Journal Template Name";
                            ToBatchName := Rec."Journal Batch Name";

                            CurrPage.Update(true);
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
                Image = Post;
                ShortCutKey = 'F9';

                trigger OnAction()
                begin
                    PostOutput();
                end;
            }

            action(PostAndPrint)
            {
                Caption = 'Post and Print';
                Image = PostPrint;

                trigger OnAction()
                begin
                    PostOutput(true);
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
        }

        area(Promoted)
        {
            group(Category_Process)
            {
                Caption = 'Process';
                actionref(Post_Promoted; Post) { }
                actionref(PostAndPrint_Promoted; PostAndPrint) { }
            }
            group(Category_Actions)
            {
                Caption = 'Actions';
                actionref(ClearLine_Promoted; ClearLine) { }
            }
        }
    }

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
        else
            Message('Output posted successfully');
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

    local procedure SelectAppliesToEntry()
    var
        ItemLedgEntry: Record "Item Ledger Entry";
        ItemLedgerEntries: Page "Item Ledger Entries";
    begin
        ItemLedgEntry.SetCurrentKey("Item No.", Open, "Variant Code", Positive, "Location Code", "Posting Date");
        ItemLedgEntry.SetRange("Item No.", Rec."Item No.");
        ItemLedgEntry.SetRange("Entry Type", ItemLedgEntry."Entry Type"::Output);
        if Rec."Order No." <> '' then begin
            ItemLedgEntry.SetRange("Order Type", ItemLedgEntry."Order Type"::Production);
            ItemLedgEntry.SetRange("Order No.", Rec."Order No.");
        end;

        ItemLedgerEntries.SetTableView(ItemLedgEntry);
        ItemLedgerEntries.SetRecord(ItemLedgEntry);
        ItemLedgerEntries.LookupMode := true;

        if ItemLedgerEntries.RunModal() = ACTION::LookupOK then begin
            ItemLedgerEntries.GetRecord(ItemLedgEntry);
            Rec."Applies-to Entry" := ItemLedgEntry."Entry No.";
        end;
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

    // Helper procedures that may need to be implemented based on your table extension
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
        // This is typically handled by the standard Item Journal Line validation
    end;

    local procedure LastOutputOperation(ItemJnlLine: Record "Item Journal Line"): Boolean
    var
        ProdOrderRtngLine: Record "Prod. Order Routing Line";
    begin
        // Check if this is the last operation in the routing
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