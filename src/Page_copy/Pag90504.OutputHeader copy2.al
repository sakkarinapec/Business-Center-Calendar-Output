// page 90504 "Output Header"
// {
//     PageType = Card;
//     ApplicationArea = All;
//     UsageCategory = Documents;
//     Caption = 'Output Header Card';
//     SourceTable = "Item Journal Line";

//     layout
//     {
//         area(Content)
//         {
//             group(General)
//             {
//                 // field("Document No."; Rec."Document No.")
//                 // {
//                 //     ApplicationArea = All;
//                 //     Editable = false;
//                 // }
//                 field("Order No."; Rec."Order No.")
//                 {
//                     ApplicationArea = All;
//                 }
//                 field("Document Date"; Rec."Document Date")
//                 {
//                     ApplicationArea = All;
//                 }
//                 field("Posting Date"; Rec."Posting Date")
//                 {
//                     ApplicationArea = All;
//                 }
//                 field(SystemCreatedBy; Rec.SystemCreatedBy)
//                 {
//                     ApplicationArea = All;
//                 }
//                 field("Source No."; Rec."Source No.")
//                 {
//                     ApplicationArea = All;
//                 }
//                 field("Journal Template Name"; Rec."Journal Template Name")
//                 {
//                     ApplicationArea = All;
//                     Lookup = true;
//                     trigger OnLookup(var Text: Text): Boolean
//                     var
//                         ItemJnlTemplate: Record "Item Journal Template";
//                     begin
//                         ItemJnlTemplate.SetRange("Name", ''); // หรือเงื่อนไขที่ต้องการ
//                         if PAGE.RunModal(PAGE::"Item Journal Templates", ItemJnlTemplate) = ACTION::LookupOK then begin
//                             Rec."Journal Template Name" := ItemJnlTemplate."Name";
//                             exit(true);
//                         end;
//                         exit(false);
//                     end;

//                     trigger OnValidate()
//                     var
//                         ItemJnlTemplate: Record "Item Journal Template";
//                     begin
//                         if Rec."Journal Template Name" = '' then
//                             Error('กรุณาระบุ Journal Template Name');

//                         if not ItemJnlTemplate.Get(Rec."Journal Template Name") then
//                             Error('Journal Template Name "%1" ไม่พบในระบบ', Rec."Journal Template Name");
//                     end;
//                 }
//                 field("Location Code"; Rec."Location Code")
//                 {
//                     ApplicationArea = All;
//                 }
//                 field("Work Center No."; Rec."Work Center No.")
//                 {
//                     ApplicationArea = All;
//                 }
//             }

//             group(Production_Scan_)
//             {
//                 group("Prdd. Info")
//                 {
//                     Caption = 'Production Info';
//                     field("Prod. Order No."; POLine."Prod. Order No.")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Routing Reference No."; POLine."Routing Reference No.")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Routing No."; POLine."Routing No.")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Operation No."; PORount."Operation No.")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Description"; POLine.Description)
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Remaining Quantity"; POLine."Remaining Quantity")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Finished Quantity"; POLine."Finished Quantity")
//                     {
//                         ApplicationArea = All;
//                         Editable = false;
//                     }
//                     field("Output Quantity"; Rec."Output Quantity")
//                     {
//                         Caption = 'Output Quantity';
//                         ApplicationArea = All;
//                         Editable = true;

//                         trigger OnValidate()
//                         begin
//                             // Allow negative quantities for corrections/reversals
//                             ValidateOutputQuantityCustom();
//                         end;
//                     }
//                     field("Applies-to Entry"; Rec."Applies-to Entry")
//                     {
//                         ApplicationArea = All;

//                         trigger OnLookup(var Text: Text): Boolean
//                         begin
//                             SelectAppliesToEntry();
//                             exit(true);
//                         end;
//                     }
//                     field("Production Location_Code"; ProdOrderRec."Location Code")
//                     {
//                         ApplicationArea = All;
//                         Editable = true;
//                     }
//                 }

//                 group("Production_Scan System")
//                 {
//                     Caption = 'Production Scan';
//                     field("Production Scan"; ProdOrderRec."Production Scan")
//                     {
//                         ApplicationArea = All;

//                         trigger OnValidate()
//                         begin
//                             ProcessProductionScanInput(ProdOrderRec."Production Scan");
//                         end;
//                     }
//                     usercontrol("QrCode Scanner"; "QrCode_Scan")
//                     {
//                         ApplicationArea = All;

//                         trigger OnControlReady()
//                         begin
//                             CurrPage."QrCode Scanner".InitializeScanner();
//                         end;

//                         trigger OnQrCodeScanned(QrData: Text)
//                         begin
//                             ProcessProductionScanInput(QrData);
//                             CurrPage.Update(false);

//                             // Show success message
//                             Message('QR Code scanned and output line created successfully: %1', QrData);
//                         end;

//                         trigger OnScanError(ErrorMessage: Text)
//                         begin
//                             // Show error message
//                             Message('QR Scan Error: %1', ErrorMessage);
//                         end;
//                     }
//                 }
//             }
//         }
//     }
//     actions
//     {
//         area(Processing)
//         {
//             action(Post)
//             {
//                 Caption = 'Post';
//                 Image = Post;
//                 ShortCutKey = 'F9';

//                 trigger OnAction()
//                 begin
//                     PostOutput();
//                 end;
//             }

//             action(PostAndPrint)
//             {
//                 Caption = 'Post and Print';
//                 Image = PostPrint;

//                 trigger OnAction()
//                 begin
//                     PostOutput(true);
//                 end;
//             }

//             action(ClearLine)
//             {
//                 Caption = 'Clear Line';

//                 trigger OnAction()
//                 begin
//                     ClearCurrentLine();
//                 end;
//             }

//             action(CreateNewOutput)
//             {
//                 Caption = 'Create New Output Line';
//                 Image = New;

//                 trigger OnAction()
//                 begin
//                     CreateNewOutputLine();
//                 end;
//             }
//         }

//         area(Promoted)
//         {
//             group(Category_Process)
//             {
//                 Caption = 'Process';
//                 actionref(Post_Promoted; Post) { }
//                 actionref(PostAndPrint_Promoted; PostAndPrint) { }
//                 actionref(CreateNewOutput_Promoted; CreateNewOutput) { }
//             }
//             group(Category_Actions)
//             {
//                 Caption = 'Actions';
//                 actionref(ClearLine_Promoted; ClearLine) { }
//             }
//         }
//     }

//     var
//         ProdOrderRec: Record "Production Order";
//         POLine: Record "Prod. Order Line";
//         PORount: Record "Prod. Order Routing Line";
//         ItemJournalLine: Record "Item Journal Line";
//         TempItemJnlLine: Record "Item Journal Line" temporary;
//         ToTemplateName: Code[10];
//         ToBatchName: Code[10];
//         ProdOrder: Record "Production Order";
//         ProdOrderLineNo: Integer;
//         FlushingFilter: Enum "Flushing Method Filter";
//         AllowNegativeOutput: Boolean;

//     local procedure ProcessProductionScanInput(ScanData: Text)
//     begin
//         if ScanData = '' then
//             exit;

//         // Create new output line automatically after successful scan
//         CreateNewOutputFromScan(ScanData);
//     end;

//     local procedure CreateNewOutputFromScan(QrData: Text)
//     var
//         NewItemJnlLine: Record "Item Journal Line";
//         POText, RoutingText, LocationText, RoutingRefText : Text;
//         Parts: List of [Text];
//         LineNo: Integer;
//     begin
//         Parts := QrData.Split('|');

//         if Parts.Count() >= 1 then
//             POText := DelChr(Parts.Get(1), '<>', ' ');

//         if Parts.Count() >= 2 then
//             RoutingText := DelChr(Parts.Get(2), '<>', ' ');

//         if Parts.Count() >= 3 then
//             LocationText := DelChr(Parts.Get(3), '<>', ' ');

//         if Parts.Count() >= 4 then
//             RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

//         // Validate Production Order
//         ProdOrderRec.Reset();
//         ProdOrderRec.SetRange("No.", POText);
//         if not ProdOrderRec.FindFirst() then
//             Error('ไม่พบ Production Order No. %1', POText);

//         // Validate Production Order Line
//         POLine.Reset();
//         POLine.SetRange("Prod. Order No.", POText);
//         if RoutingText <> '' then
//             POLine.SetRange("Routing No.", RoutingText);

//         if not POLine.FindFirst() then
//             Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);

//         // Validate that Item No. exists
//         if POLine."Item No." = '' then
//             Error('ไม่พบ Item No. ในบรรทัด Production Order %1', POText);

//         // Validate Routing
//         PORount.Reset();
//         PORount.SetRange("Prod. Order No.", POText);
//         PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
//         if not PORount.FindFirst() then
//             Error('ไม่พบ Routing Operation สำหรับ PO %1 และ Routing Ref. %2', POText, POLine."Routing Reference No.");

//         // Initialize template and batch if not set
//         if ToTemplateName = '' then
//             ToTemplateName := GetDefaultOutputTemplate();
//         if ToBatchName = '' then
//             ToBatchName := GetDefaultOutputBatch(ToTemplateName);

//         // Get next line number
//         LineNo := GetNextLineNo(ToTemplateName, ToBatchName);

//         // Create new Item Journal Line step by step with proper validation order
//         NewItemJnlLine.Init();

//         // Set basic journal information first
//         NewItemJnlLine."Journal Template Name" := ToTemplateName;
//         NewItemJnlLine."Journal Batch Name" := ToBatchName;
//         NewItemJnlLine."Line No." := LineNo;

//         // Set entry type before other validations
//         NewItemJnlLine."Entry Type" := NewItemJnlLine."Entry Type"::Output;

//         // Set dates
//         NewItemJnlLine."Posting Date" := WorkDate();
//         NewItemJnlLine."Document Date" := WorkDate();
//         NewItemJnlLine."Order No." := GetNextDocumentNo(ToTemplateName, ToBatchName);

//         // Set Production Order information
//         NewItemJnlLine."Source No." := POText;
//         NewItemJnlLine."Order Type" := NewItemJnlLine."Order Type"::Production;
//         NewItemJnlLine."Order No." := POText;
//         NewItemJnlLine."Order Line No." := POLine."Line No.";
//         NewItemJnlLine."Routing Reference No." := POLine."Routing Reference No.";
//         NewItemJnlLine."Routing No." := POLine."Routing No.";
//         NewItemJnlLine."Operation No." := PORount."Operation No.";

//         // Validate item information - THIS IS CRITICAL
//         NewItemJnlLine.Validate("Item No.", POLine."Item No.");

//         // Set location after item validation
//         if LocationText <> '' then
//             NewItemJnlLine.Validate("Location Code", LocationText)
//         else if POLine."Location Code" <> '' then
//             NewItemJnlLine.Validate("Location Code", POLine."Location Code");

//         // Set work center information
//         if PORount."Work Center No." <> '' then begin
//             NewItemJnlLine.Validate("Work Center No.", PORount."Work Center No.");
//             NewItemJnlLine.Validate(Type, NewItemJnlLine.Type::"Work Center");
//             NewItemJnlLine.Validate("No.", PORount."Work Center No.");
//         end;

//         // Set output quantity to remaining quantity (validate after all other fields are set)
//         if POLine."Remaining Quantity" > 0 then
//             NewItemJnlLine.Validate("Output Quantity", POLine."Remaining Quantity");

//         // Insert the new line
//         NewItemJnlLine.Insert(true);

//         // Update current record to the new line
//         Rec := NewItemJnlLine;

//         // Update related variables
//         ProdOrder := ProdOrderRec;
//         ProdOrderLineNo := POLine."Line No.";
//         ToTemplateName := NewItemJnlLine."Journal Template Name";
//         ToBatchName := NewItemJnlLine."Journal Batch Name";

//         // Update UI
//         CurrPage.Update(true);

//         Message('สร้าง Output Line ใหม่สำเร็จ - PO: %1, Item: %2, Qty: %3',
//                 POText, POLine."Item No.", POLine."Remaining Quantity");
//     end;

//     local procedure CreateNewOutputLine()
//     var
//         NewItemJnlLine: Record "Item Journal Line";
//         LineNo: Integer;
//     begin
//         // Initialize template and batch if not set
//         if ToTemplateName = '' then
//             ToTemplateName := GetDefaultOutputTemplate();
//         if ToBatchName = '' then
//             ToBatchName := GetDefaultOutputBatch(ToTemplateName);

//         // Get next line number
//         LineNo := GetNextLineNo(ToTemplateName, ToBatchName);

//         // Create new Item Journal Line with minimal required fields
//         NewItemJnlLine.Init();

//         // Set basic journal information first (direct assignment, not Validate)
//         NewItemJnlLine."Journal Template Name" := ToTemplateName;
//         NewItemJnlLine."Journal Batch Name" := ToBatchName;
//         NewItemJnlLine."Line No." := LineNo;
//         NewItemJnlLine."Entry Type" := NewItemJnlLine."Entry Type"::Output;
//         NewItemJnlLine."Posting Date" := WorkDate();
//         NewItemJnlLine."Document Date" := WorkDate();
//         NewItemJnlLine."Order No." := GetNextDocumentNo(ToTemplateName, ToBatchName);

//         // Insert the new line with minimal data first
//         NewItemJnlLine.Insert(false);

//         // Update current record to the new line
//         Rec := NewItemJnlLine;

//         // Clear production scan data for next scan
//         Clear(ProdOrderRec."Production Scan");

//         // Update UI
//         CurrPage.Update(true);

//         Message('สร้าง Output Line ใหม่สำเร็จ - พร้อมสำหรับการสแกน QR Code');
//     end;

//     local procedure GetDefaultOutputTemplate(): Code[10]
//     var
//         ItemJnlTemplate: Record "Item Journal Template";
//     begin
//         ItemJnlTemplate.SetRange(Type, ItemJnlTemplate.Type::Output);
//         if ItemJnlTemplate.FindFirst() then
//             exit(ItemJnlTemplate.Name);

//         Error('ไม่พบ Output Journal Template');
//     end;

//     local procedure GetDefaultOutputBatch(TemplateName: Code[10]): Code[10]
//     var
//         ItemJnlBatch: Record "Item Journal Batch";
//     begin
//         ItemJnlBatch.SetRange("Journal Template Name", TemplateName);
//         if ItemJnlBatch.FindFirst() then
//             exit(ItemJnlBatch.Name);

//         Error('ไม่พบ Journal Batch สำหรับ Template %1', TemplateName);
//     end;

//     local procedure GetNextLineNo(TemplateName: Code[10]; BatchName: Code[10]): Integer
//     var
//         ItemJnlLine: Record "Item Journal Line";
//     begin
//         ItemJnlLine.SetRange("Journal Template Name", TemplateName);
//         ItemJnlLine.SetRange("Journal Batch Name", BatchName);
//         if ItemJnlLine.FindLast() then
//             exit(ItemJnlLine."Line No." + 10000)
//         else
//             exit(10000);
//     end;

//     local procedure GetNextDocumentNo(TemplateName: Code[10]; BatchName: Code[10]): Code[20]
//     var
//         ItemJnlBatch: Record "Item Journal Batch";
//         NoSeriesManagement: Codeunit NoSeriesManagement;
//     begin
//         if ItemJnlBatch.Get(TemplateName, BatchName) then begin
//             if ItemJnlBatch."No. Series" <> '' then
//                 exit(NoSeriesManagement.GetNextNo(ItemJnlBatch."No. Series", WorkDate(), false));
//         end;

//         // Fallback to simple sequential number
//         exit(Format(Today, 0, '<Year4><Month,2><Day,2>') + '-001');
//     end;

//     local procedure PostOutput(Print: Boolean)
//     begin
//         // Validate essential fields
//         if Rec."Output Quantity" = 0 then
//             Error('Output Quantity cannot be zero');

//         if Rec."Item No." = '' then
//             Error('Item No. must be specified');

//         if Rec."Order No." = '' then
//             Error('Order No. must be specified');

//         // For Output entries, validate capacity fields
//         if Rec."Entry Type" = Rec."Entry Type"::Output then begin
//             if Rec."Operation No." = '' then
//                 Error('Operation No. must be specified for Output entry');

//             if Rec."No." = '' then
//                 Error('Work Center No. or Machine Center No. must be specified');

//             if Rec."Work Center No." = '' then
//                 Error('Work Center No. must be specified');
//         end;

//         // Handle negative quantities - require Applies-to Entry for corrections
//         if Rec."Output Quantity" < 0 then begin
//             if Rec."Applies-to Entry" = 0 then
//                 Error('Applies-to Entry must be specified for negative Output Quantity (corrections)');
//         end;

//         // Proceed with posting
//         DeleteTempRec();
//         PostItemJournalFromProduction(Print);
//         InsertTempRec();
//         SetFilterGroup();
//         CurrPage.Update(false);

//         if Rec."Output Quantity" < 0 then
//             Message('Output correction posted successfully')
//         else
//             Message('Output posted successfully');

//         // Create new line after successful posting
//         CreateNewOutputLine();
//     end;

//     local procedure PostOutput()
//     begin
//         PostOutput(false);
//     end;

//     local procedure ValidateOutputQuantityCustom()
//     var
//         Item: Record Item;
//         WhseValidateSourceLine: Codeunit "Whse. Validate Source Line";
//     begin
//         Rec.TestField("Entry Type", Rec."Entry Type"::Output);

//         // Skip subcontracting validation for negative quantities (corrections)
//         if (Rec."Output Quantity" > 0) and SubcontractingWorkCenterUsed() and (Rec."Output Quantity" <> 0) then
//             Error('Cannot specify %1 for subcontracted operations', Rec.FieldCaption("Output Quantity"));

//         // Allow negative quantities for corrections without finished operation check
//         if Rec."Output Quantity" > 0 then
//             CheckConfirmOutputOnFinishedOperation();

//         if LastOutputOperation(Rec) then begin
//             Item.Get(Rec."Item No.");
//             if Item.IsInventoriableType() then
//                 WhseValidateSourceLine.ItemLineVerifyChange(Rec, xRec);
//         end;

//         // Calculate base quantity (allow negative)
//         Rec."Output Quantity (Base)" := CalcBaseQty(Rec."Output Quantity", Rec.FieldCaption("Output Quantity"), Rec.FieldCaption("Output Quantity (Base)"));

//         // Set main quantity
//         Rec.Validate(Quantity, Rec."Output Quantity");
//         ValidateQuantityIsBalanced();
//     end;

//     local procedure SetOutputQuantityDirect(NewOutputQty: Decimal)
//     begin
//         // Set Output Quantity without triggering all validations
//         Rec."Output Quantity" := NewOutputQty;
//         Rec."Output Quantity (Base)" := CalcBaseQty(NewOutputQty, Rec.FieldCaption("Output Quantity"), Rec.FieldCaption("Output Quantity (Base)"));
//         Rec.Quantity := NewOutputQty;
//     end;

//     local procedure SelectAppliesToEntry()
//     var
//         ItemLedgEntry: Record "Item Ledger Entry";
//         ItemLedgerEntries: Page "Item Ledger Entries";
//     begin
//         ItemLedgEntry.SetCurrentKey("Item No.", Open, "Variant Code", Positive, "Location Code", "Posting Date");
//         ItemLedgEntry.SetRange("Item No.", Rec."Item No.");
//         ItemLedgEntry.SetRange("Entry Type", ItemLedgEntry."Entry Type"::Output);
//         if Rec."Order No." <> '' then begin
//             ItemLedgEntry.SetRange("Order Type", ItemLedgEntry."Order Type"::Production);
//             ItemLedgEntry.SetRange("Order No.", Rec."Order No.");
//         end;

//         ItemLedgerEntries.SetTableView(ItemLedgEntry);
//         ItemLedgerEntries.SetRecord(ItemLedgEntry);
//         ItemLedgerEntries.LookupMode := true;

//         if ItemLedgerEntries.RunModal() = ACTION::LookupOK then begin
//             ItemLedgerEntries.GetRecord(ItemLedgEntry);
//             Rec."Applies-to Entry" := ItemLedgEntry."Entry No.";
//         end;
//     end;

//     local procedure ClearCurrentLine()
//     begin
//         Rec."Output Quantity" := 0;
//         Rec."Applies-to Entry" := 0;
//         Rec."Operation No." := '';
//         Rec."Work Center No." := '';
//         Rec."No." := '';
//         Rec."Item No." := '';
//         Rec."Order No." := '';
//         Rec."Order Line No." := 0;
//         Clear(ProdOrderRec."Production Scan");
//         CurrPage.Update(true);
//     end;

//     local procedure PostItemJournalFromProduction(Print: Boolean)
//     var
//         ProductionOrder: Record "Production Order";
//         IsHandled: Boolean;
//     begin
//         if (Rec."Order Type" = Rec."Order Type"::Production) and (Rec."Order No." <> '') then
//             ProductionOrder.Get(ProductionOrder.Status::Released, Rec."Order No.");

//         IsHandled := false;
//         OnBeforePostingItemJnlFromProduction(Rec, Print, IsHandled);
//         if IsHandled then
//             exit;

//         if Print then
//             CODEUNIT.Run(CODEUNIT::"Item Jnl.-Post+Print", Rec)
//         else
//             CODEUNIT.Run(CODEUNIT::"Item Jnl.-Post", Rec);
//     end;

//     protected procedure DeleteTempRec()
//     begin
//         TempItemJnlLine.DeleteAll();

//         if Rec.Find('-') then
//             repeat
//                 case Rec."Entry Type" of
//                     Rec."Entry Type"::Consumption:
//                         if Rec."Quantity (Base)" = 0 then begin
//                             TempItemJnlLine := Rec;
//                             TempItemJnlLine.Insert();
//                             Rec.Delete();
//                         end;
//                     Rec."Entry Type"::Output:
//                         if Rec.TimeIsEmpty() and
//                            (Rec."Output Quantity (Base)" = 0) and (Rec."Scrap Quantity (Base)" = 0)
//                         then begin
//                             TempItemJnlLine := Rec;
//                             TempItemJnlLine.Insert();
//                             Rec.Delete();
//                         end;
//                 end;
//             until Rec.Next() = 0;
//     end;

//     protected procedure InsertTempRec()
//     begin
//         if TempItemJnlLine.Find('-') then
//             repeat
//                 Rec := TempItemJnlLine;
//                 Rec."Changed by User" := false;
//                 Rec.Insert();
//             until TempItemJnlLine.Next() = 0;
//         TempItemJnlLine.DeleteAll();
//     end;

//     procedure SetFilterGroup()
//     begin
//         Rec.FilterGroup(2);
//         Rec.SetRange("Journal Template Name", ToTemplateName);
//         Rec.SetRange("Journal Batch Name", ToBatchName);
//         Rec.SetRange("Order Type", Rec."Order Type"::Production);
//         Rec.SetRange("Order No.", ProdOrder."No.");
//         if ProdOrderLineNo <> 0 then
//             Rec.SetRange("Order Line No.", ProdOrderLineNo);
//         SetFlushingFilter();
//         OnAfterSetFilterGroup(Rec, ProdOrder, ProdOrderLineNo);
//         Rec.FilterGroup(0);
//     end;

//     procedure SetFlushingFilter()
//     begin
//         case FlushingFilter of
//             FlushingFilter::"All Methods":
//                 Rec.SetRange("Flushing Method");
//             FlushingFilter::"Manual Methods":
//                 Rec.SetFilter("Flushing Method", '%1|%2', "Flushing Method"::"Pick + Manual", "Flushing Method"::"Pick + Manual");
//             else
//                 Rec.SetRange("Flushing Method", FlushingFilter);
//         end;
//     end;

//     // Helper procedures
//     local procedure SubcontractingWorkCenterUsed(): Boolean
//     var
//         WorkCenter: Record "Work Center";
//     begin
//         if Rec."Work Center No." = '' then
//             exit(false);

//         if WorkCenter.Get(Rec."Work Center No.") then
//             exit(WorkCenter."Subcontractor No." <> '');

//         exit(false);
//     end;

//     local procedure CheckConfirmOutputOnFinishedOperation()
//     var
//         ProdOrderRtngLine: Record "Prod. Order Routing Line";
//     begin
//         // Add logic to check if operation is finished
//     end;

//     local procedure LastOutputOperation(ItemJnlLine: Record "Item Journal Line"): Boolean
//     var
//         ProdOrderRtngLine: Record "Prod. Order Routing Line";
//     begin
//         ProdOrderRtngLine.SetRange("Prod. Order No.", ItemJnlLine."Order No.");
//         ProdOrderRtngLine.SetRange("Routing Reference No.", ItemJnlLine."Routing Reference No.");
//         if ProdOrderRtngLine.FindLast() then
//             exit(ProdOrderRtngLine."Operation No." = ItemJnlLine."Operation No.");

//         exit(true);
//     end;

//     local procedure CalcBaseQty(Qty: Decimal; FromFieldName: Text; ToFieldName: Text): Decimal
//     var
//         UOMMgt: Codeunit "Unit of Measure Management";
//     begin
//         exit(UOMMgt.CalcBaseQty(
//             Rec."Item No.", Rec."Variant Code", Rec."Unit of Measure Code", Qty, Rec."Qty. per Unit of Measure"));
//     end;

//     local procedure ValidateQuantityIsBalanced()
//     begin
//         // Add logic to validate quantity balance if needed
//     end;

//     [IntegrationEvent(false, false)]
//     local procedure OnAfterSetFilterGroup(var ItemJournalLine: Record "Item Journal Line"; ProductionOrder: Record "Production Order"; ProdOrderLineNo: Integer)
//     begin
//     end;

//     [IntegrationEvent(false, false)]
//     local procedure OnBeforePostingItemJnlFromProduction(var ItemJournalLine: Record "Item Journal Line"; Print: Boolean; var IsHandled: Boolean)
//     begin
//     end;
// }