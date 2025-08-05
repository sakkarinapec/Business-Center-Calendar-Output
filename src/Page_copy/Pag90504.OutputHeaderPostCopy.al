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
//                 field("Document No."; Rec."Document No.")
//                 {
//                     ApplicationArea = All;
//                     Editable = false;
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
//                         Caption = 'Standard Pack';
//                         ApplicationArea = All;
//                         Editable = true;
//                     }
//                     field("Applies-to Entry"; Rec."Applies-to Entry")
//                     {
//                         ApplicationArea = All;
//                     }
//                     // field("Confirm Quantity"; ItemJournalLine."Output Quantity")
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = true;
//                     // }
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
//                         var
//                             POText: Text;
//                             RoutingText: Text;
//                             Parts: List of [Text];
//                             LocationText: Text;
//                             RoutingRefText: Text;
//                         begin
//                             Parts := ProdOrderRec."Production Scan".Split('|');

//                             if Parts.Count() >= 1 then
//                                 POText := DelChr(Parts.Get(1), '<>', ' ');

//                             if Parts.Count() >= 2 then
//                                 RoutingText := DelChr(Parts.Get(2), '<>', ' ');

//                             if Parts.Count() >= 3 then
//                                 LocationText := DelChr(Parts.Get(3), '<>', ' ');

//                             if Parts.Count() >= 4 then
//                                 RoutingRefText := DelChr(Parts.Get(4), '<>', ' ');

//                             ProdOrderRec.SetRange("No.", POText);
//                             if not ProdOrderRec.FindFirst() then
//                                 Error('ไม่พบ Production Order No. %1', POText);

//                             POLine.SetRange("Prod. Order No.", POText);
//                             if RoutingText <> '' then
//                                 POLine.SetRange("Routing No.", RoutingText);

//                             if not POLine.FindFirst() then
//                                 Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);

//                             PORount.SetRange("Prod. Order No.", POText);
//                             PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
//                             if PORount.FindFirst() then
//                                 Rec."Operation No." := PORount."Operation No."
//                             else
//                                 Error('ไม่พบ Routing Operation สำหรับ PO %1 และ Routing Ref. %2', POText, POLine."Routing Reference No.");

//                             if POText <> '' then
//                                 Rec."Source No." := POText;

//                             Rec."Order No." := POText;
//                             Rec."Order Line No." := POLine."Line No.";
//                             Rec."Routing Reference No." := POLine."Routing Reference No.";
//                             Rec."Routing No." := POLine."Routing No.";

//                             if Rec."Entry Type" <> Rec."Entry Type"::Output then
//                                 Rec.Validate("Entry Type", Rec."Entry Type"::Output);

//                             Rec.Validate("Item No.", POLine."Item No.");
//                             Rec.Validate("Output Quantity", POLine."Remaining Quantity");

//                             // Set required fields for capacity posting
//                             if PORount."Work Center No." <> '' then begin
//                                 Rec.Validate("Work Center No.", PORount."Work Center No.");
//                                 Rec.Validate(Type, Rec.Type::"Work Center");
//                                 Rec.Validate("No.", PORount."Work Center No.");
//                             end;

//                             // If Machine Center is specified, use it instead
//                             // if PORount."Machine Center No." <> '' then begin
//                             //     Rec.Validate(Type, Rec.Type::"Machine Center");
//                             //     Rec.Validate("No.", PORount."Machine Center No.");
//                             //     Rec.Validate("Work Center No.", PORount."Work Center No.");
//                             // end;

//                             // Initialize required variables for posting
//                             ProdOrder := ProdOrderRec;
//                             ProdOrderLineNo := POLine."Line No.";
//                             ToTemplateName := Rec."Journal Template Name";
//                             ToBatchName := Rec."Journal Batch Name";

//                             CurrPage.Update(true);
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
//             action(post_)
//             {
//                 Caption = 'Post';
//                 Image = Post;
//                 trigger OnAction()
//                 begin
//                     // Validate required fields before posting
//                     if Rec."Output Quantity" <= 0 then
//                         Error('Output Quantity must be greater than 0');

//                     if Rec."Item No." = '' then
//                         Error('Item No. must be specified');

//                     if Rec."Order No." = '' then
//                         Error('Order No. must be specified');

//                     // Validate capacity fields for Output entry
//                     if Rec."Entry Type" = Rec."Entry Type"::Output then begin
//                         if Rec."Operation No." = '' then
//                             Error('Operation No. must be specified for Output entry');

//                         if Rec."No." = '' then
//                             Error('Work Center No. or Machine Center No. must be specified');

//                         if Rec."Work Center No." = '' then
//                             Error('Work Center No. must be specified');
//                     end;

//                     DeleteTempRec();
//                     PostItemJournalFromProdCustom(false);
//                     InsertTempRec();
//                     SetFilterGroup();
//                     CurrPage.Update(false);

//                     Message('Output posted successfully');
//                 end;
//             }
//             action(post_2)
//             {
//                 Caption = 'Post';
//                 Image = Post;
//                 trigger OnAction()
//                 begin

//                     DeleteTempRec();
//                     PostItemJournalFromProdCustom(false);
//                     InsertTempRec();
//                     SetFilterGroup();
//                     CurrPage.Update(false);

//                     Message('Output posted successfully');
//                 end;
//             }

//             action(ClearLine)
//             {
//                 Caption = 'Clear Line';
//                 trigger OnAction()
//                 begin
//                     Rec.Reset();
//                     CurrPage.Update(true);
//                 end;
//             }
//         }

//         area(Promoted)
//         {
//             group(Category_Process)
//             {
//                 Caption = 'Home ';
//                 actionref(Show_Promoted2; "Post_") { }
//             }
//             group(Category_Print)
//             {
//                 Caption = 'Test ';
//                 actionref(Show_Promoted3; "ClearLine") { }
//                 actionref(Show_Promoted; "post_2") { }
//             }
//         }
//     }

//     var
//         ProdOrderRec: Record "Production Order";
//         POLine: Record "Prod. Order Line";
//         PORount: Record "Prod. Order Routing Line";
//         POCom: Record "Prod. Order Component";
//         ItemJournalLine: Record "Item Journal Line";
//         TempItemJnlLine: Record "Item Journal Line" temporary;
//         ToTemplateName: Code[10];
//         ToBatchName: Code[10];
//         ProdOrder: Record "Production Order";
//         ProdOrderLineNo: Integer;
//         FlushingFilter: Enum "Flushing Method Filter";

//     // Add the missing PostingItemJnlFromProduction procedure
//     procedure PostItemJournalFromProdCustom(Print: Boolean)
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

//     [IntegrationEvent(false, false)]
//     local procedure OnAfterSetFilterGroup(var ItemJournalLine: Record "Item Journal Line"; ProductionOrder: Record "Production Order"; ProdOrderLineNo: Integer)
//     begin
//     end;

//     [IntegrationEvent(false, false)]
//     local procedure OnBeforePostingItemJnlFromProduction(var ItemJournalLine: Record "Item Journal Line"; Print: Boolean; var IsHandled: Boolean)
//     begin
//     end;
// }