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
//                     // Editable = false;
//                     Caption = 'Production Info';
//                     // field("Prod. Order Comp. Line No."; Rec."Prod. Order Comp. Line No.")
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     // }
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
//                     // field("Prod. Order No."; ProdOrderNoText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false; // ทำให้เป็น Label อ่านอย่างเดียว
//                     //     Caption = 'Prod. Order No.';
//                     // }
//                     // field("Routing Reference No."; RoutingRefText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     //     Caption = 'Routing Reference No.';
//                     // }
//                     // field("Routing No."; RoutingNoText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     //     Caption = 'Routing No.';
//                     // }
//                     // field("Operation No."; OperationNoText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     //     Caption = 'Operation No.';
//                     // }
//                     // field("Description"; DescriptionText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     //     Caption = 'Description';
//                     // }
//                     // field("Remaining Quantity"; RemainingQtyText)
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = false;
//                     //     Caption = 'Remaining Quantity';
//                     // }

//                     // field("Reserved Qty. (Base)"; Rec."Reserved Qty. (Base)")
//                     // {
//                     //     ApplicationArea = All;
//                     // }
//                     field("Standard Pack"; ItemJournalLine."Output Quantity")
//                     {
//                         Caption = 'Standard Pack';
//                         ApplicationArea = All;
//                         Editable = true;
//                     }
//                     // field("Standard Pack"; ProdOrderRec."Standard Pack")
//                     // {
//                     //     ApplicationArea = All;
//                     //     Editable = true;
//                     // }
//                     field("Confirm Quantity"; ItemJournalLine."Output Quantity")
//                     {
//                         ApplicationArea = All;
//                         Editable = true;
//                     }
//                     // field("Confirm Quantity"; ProdOrderRec."Confirm Quantity")
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
//                 // }
//                 group("Production_Scan System")
//                 {
//                     Caption = 'Production Scan';
//                     field("Production Scan"; ProdOrderRec."Production Scan")
//                     {
//                         ApplicationArea = All;
//                         // trigger OnValidate()
//                         // var
//                         //     POText: Text;
//                         //     RoutingText: Text;
//                         //     Parts: List of [Text];
//                         //     LocationText: Text;
//                         //     RoutingRefText: Text;
//                         // begin
//                         //     // แยกข้อความด้วย '|'
//                         //     Parts := ProdOrderRec."Production Scan".Split('|');

//                         //     if Parts.Count() >= 1 then
//                         //         POText := DelChr(Parts.Get(1), '<>', ' '); // Production Order No.

//                         //     if Parts.Count() >= 2 then
//                         //         RoutingText := DelChr(Parts.Get(2), '<>', ' '); // Routing No. (ถ้ามี)

//                         //     if Parts.Count() >= 3 then
//                         //         LocationText := DelChr(Parts.Get(3), '<>', ' '); // Location Code

//                         //     if Parts.Count() >= 4 then
//                         //         RoutingRefText := DelChr(Parts.Get(4), '<>', ' '); // Routing Ref. No.

//                         //     ProdOrderRec.SetRange("No.", POText);
//                         //     if ProdOrderRec.FindFirst() then begin
//                         //         ProdOrderRec.Description := ProdOrderRec.Description;

//                         //         POLine."Prod. Order No." := POLine."Prod. Order No.";

//                         //         POLine.SetRange("Prod. Order No.", POText);
//                         //         if RoutingText <> '' then
//                         //             POLine.SetRange("Routing No.", RoutingText);

//                         //         if POLine.FindFirst() then begin
//                         //             POLine."Routing No." := POLine."Routing No.";
//                         //             POLine."Routing Reference No." := POLine."Routing Reference No.";
//                         //             POLine."Remaining Quantity" := POLine."Remaining Quantity";
//                         //             // ItemJournalLine."Output Quantity" := ItemJournalLine."Output Quantity";
//                         //             // Rec.Validate("Output Quantity", SomeValue); // จะ trigger OnValidate ด้วย
//                         //             if Rec."Entry Type" <> Rec."Entry Type"::Output then
//                         //                 Rec.Validate("Entry Type", Rec."Entry Type"::Output);

//                         //             // จากนั้น Validate Output Quantity ได้
//                         //             Rec.Validate("Output Quantity", POLine."Remaining Quantity");


//                         //             PORount.SetRange("Prod. Order No.", POText);
//                         //             PORount.SetRange("Routing Reference No.", POLine."Routing Reference No.");
//                         //             if PORount.FindFirst() then
//                         //                 PORount."Operation No." := PORount."Operation No.";

//                         //             // ใช้ Line No. กรอง Prod. Order Component แทน Routing Reference No.
//                         //             POCom.SetRange("Prod. Order No.", POText);
//                         //             POCom.SetRange("Prod. Order Line No.", POLine."Line No.");

//                         //         end else
//                         //             Error('ไม่พบข้อมูลในบรรทัดสำหรับ PO %1 และ Routing No. %2', POText, RoutingText);
//                         //     end else
//                         //         Error('ไม่พบ Production Order No. %1', POText);

//                         //     CurrPage.Update(true);
//                         // end;

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

//                             if Rec."Entry Type" <> Rec."Entry Type"::Output then
//                                 Rec.Validate("Entry Type", Rec."Entry Type"::Output);

//                             Rec.Validate("Item No.", POLine."Item No.");
//                             Rec.Validate("Output Quantity", POLine."Remaining Quantity");

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

//             action(Post_ap)
//             {
//                 Caption = 'Post new';
//                 Image = PostOrder;
//                 ShortCutKey = 'F9';
//                 trigger OnAction()
//                 var
//                     ItemJnlPostLine: Codeunit "Item Jnl.-Post Line";
//                     ItemJnlLine: Record "Item Journal Line";
//                 begin
//                     ItemJnlLine.SetRange("Journal Template Name", Rec."Journal Template Name");
//                     ItemJnlLine.SetRange("Journal Batch Name", Rec."Journal Batch Name");
//                     ItemJnlLine.SetRange("Document No.", Rec."Document No.");

//                     if not ItemJnlLine.FindSet() then
//                         Error('ไม่พบรายการ Journal ที่จะ Post สำหรับเอกสาร %1', Rec."Document No.");

//                     repeat
//                         ItemJnlPostLine.RunWithCheck(ItemJnlLine);
//                     until ItemJnlLine.Next() = 0;

//                     Message('Post เอกสาร %1 เรียบร้อยแล้ว', Rec."Document No.");

//                     CurrPage.Update();
//                 end;
//             }
//             action(post_)
//             {
//                 Caption = 'Post';
//                 Image = Post;
//                 trigger OnAction()
//                 begin
//                     DeleteTempRec();
//                     Rec.PostingItemJnlFromProduction(false);
//                     InsertTempRec();
//                     SetFilterGroup();
//                     CurrPage.Update(false);
//                 end;
//             }
//             action(test_post)
//             {
//                 Caption = 'Test_Post';
//                 Image = Post;
//                 trigger OnAction()
//                 begin
//                     DoPostLine();
//                     Message('Post เรียบร้อยแล้ว');
//                     // Rec.GET(...); // รีโหลด
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
//                 actionref(Show_Promoted1; "Post_ap") { }
//             }
//             group(Category_Print)
//             {
//                 Caption = 'Test ';

//                 actionref(Show_Promoted3; "Test_Post") { }
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

//     var
//         ToTemplateName: Code[10];
//         ToBatchName: Code[10];
//         ProdOrder: Record "Production Order";
//         ProdOrderLineNo: Integer;
//         FlushingFilter: Enum "Flushing Method Filter";

//     var
//         ProdOrderNoText: Text;
//         RoutingRefText: Text;
//         RoutingNoText: Text;
//         OperationNoText: Text;
//         DescriptionText: Text;
//         RemainingQtyText: Text;

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

//     procedure DoPostLine()
//     var
//         ItemJnlPostLine: Codeunit "Item Jnl.-Post Line";
//         ItemJnlLine: Record "Item Journal Line";
//     begin
//         ItemJnlLine.SetRange("Journal Template Name", Rec."Journal Template Name");
//         ItemJnlLine.SetRange("Journal Batch Name", Rec."Journal Batch Name");
//         ItemJnlLine.SetRange("Document No.", Rec."Document No.");
//         // ItemJnlLine.SetRange("Line No.", Rec."Line No.");

//         if ItemJnlLine.FindSet() then
//             repeat
//                 ItemJnlPostLine.RunWithCheck(ItemJnlLine);
//             until ItemJnlLine.Next() = 0;
//     end;

// }