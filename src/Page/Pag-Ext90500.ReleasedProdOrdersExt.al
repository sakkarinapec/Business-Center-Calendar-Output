pageextension 90500 "Released Prod. Orders Ext" extends "Released Production Orders"
{
    actions
    {
        addlast(Processing)
        {

            action("View Calendar")
            {
                ApplicationArea = All;
                Caption = 'Calendar';
                Image = Calendar;
                ToolTip = 'Open calendar view for Released Production Orders.';

                trigger OnAction()
                var
                    CalendarPage: Page 90501; // Calendar Page
                begin
                    CalendarPage.Run();
                end;
            }
            action(TestShowDueDate)
            {
                Caption = '🔍 ทดสอบแสดง Due Date';
                ApplicationArea = All;
                Image = View;

                trigger OnAction()
                var
                    POLine: Record "Prod. Order Line";
                    MsgText: Text;
                    Count: Integer;
                begin
                    Count := 0;
                    MsgText := '';

                    // POLine.SetRange("Prod. Order No.", Rec."Prod. Order No.");
                    if POLine.FindSet() then
                        repeat
                            if POLine."Due Date" <> 0D then begin
                                MsgText += StrSubstNo('Line No.: %1 | Due Date: %3\ |Description: %2\ ',
                                    POLine."Line No.", POLine.Description,
                                    Format(POLine."Due Date"));
                                Count += 1;
                            end;
                        until POLine.Next() = 0;

                    if Count = 0 then
                        Message('ไม่พบข้อมูลที่มี Due Date')
                    else
                        Message('พบ %1 รายการที่มี Due Date:\n\n%2', Count, MsgText);
                end;
            }
            action("View Output Header Card")
            {
                ApplicationArea = All;
                Caption = 'Output Card Test';
                Image = OutputJournal;
                ToolTip = 'เปิดหน้ารายละเอียดการสแกน Output';

                trigger OnAction()
                var
                    OutputCardPage: Page "Output Header ap"; // Page 90502
                    EmptyProdOrder: Record "Production Order";
                begin
                    // ไม่ส่ง Rec ปัจจุบันเข้าไป แต่ส่ง Record ว่าง ๆ
                    // OutputCardPage.SetRecord(EmptyProdOrder);
                    OutputCardPage.SetRecord(Rec);
                    OutputCardPage.RunModal();
                end;
            }
            action("View Output Card")
            {
                ApplicationArea = All;
                Caption = 'Output Card';
                Image = OutputJournal;
                ToolTip = 'เปิดหน้ารายละเอียดการสแกน Output';

                trigger OnAction()
                var
                    OutputCardPage: Page "Output Header"; // Page 90502
                begin
                    // OutputCardPage.SetRecord(Rec); // กำหนด record ปัจจุบันเข้าไป
                    OutputCardPage.RunModal();
                end;
            }
            action("View Routing")
            {
                ApplicationArea = All;
                Caption = 'Routing';
                Image = Route;

                trigger OnAction()
                var
                    OutputListPage: Page "Prod. Order Routing"; // Page 99000817
                    FilteredRoutingLine: Record "Prod. Order Routing Line";
                begin
                    // กรองเฉพาะเอกสารที่ต้องการ เช่น ตาม "Prod. Order No." ปัจจุบัน
                    FilteredRoutingLine.SetRange("Prod. Order No.", Rec."No.");
                    OutputListPage.SetTableView(FilteredRoutingLine);
                    OutputListPage.RunModal(); // เปิดแบบรายการ
                end;
            }
            action("View Component")
            {
                ApplicationArea = All;
                Caption = 'Component';
                Image = Components;

                trigger OnAction()
                var
                    OutputListPage: Page "Prod. Order Components";
                    FilteredComponent: Record "Prod. Order Component";
                begin
                    // กรองเฉพาะเอกสารที่ต้องการ เช่น ตาม "Prod. Order No." ปัจจุบัน
                    FilteredComponent.SetRange("Prod. Order No.", Rec."No.");
                    OutputListPage.SetTableView(FilteredComponent);
                    OutputListPage.RunModal(); // เปิดแบบรายการ
                end;
            }
            action("View Production Journal")
            {
                ApplicationArea = All;
                Caption = 'Production Journal';
                Image = Journals;

                trigger OnAction()
                var
                    OutputListPage: Page "Production Journal";
                    FilteredJournal: Record "Item Journal Line";
                    PO: Record "Production Order";
                    FilteredRoutingLine: Record "Prod. Order Routing Line";
                begin
                    // กรองเฉพาะเอกสารที่ต้องการ เช่น ตาม "Prod. Order No." ปัจจุบัน
                    // FilteredJournal.SetRange("Prod. Order No.", Rec."No.");
                    // OutputListPage.SetTableView(FilteredJournal);
                    // OutputListPage.RunModal(); // เปิดแบบรายการ
                    ShowProductionJournal();
                end;
            }

            action(TestRoutingLine)
            {
                Caption = '🧪 ทดสอบ Routing Line';
                ApplicationArea = All;
                Image = View;

                trigger OnAction()
                var
                    RoutingLine: Record "Prod. Order Routing Line";
                    MsgText: Text;
                    Count: Integer;
                begin
                    MsgText := '';
                    Count := 0;

                    RoutingLine.SetRange("Prod. Order No.", Rec."No."); // กรองจาก Production Order No.

                    if RoutingLine.FindSet() then
                        repeat
                            MsgText += StrSubstNo(
                                'Routing No.: %1\nDescription: %2\nStarting Date: %3\n\n',
                                RoutingLine."Routing No.",
                                RoutingLine.Description,
                                Format(RoutingLine."Starting Date")
                            );
                            Count += 1;
                        until RoutingLine.Next() = 0;

                    if Count = 0 then
                        Message('ไม่พบ Routing Line สำหรับ Production Order No. = %1', Rec."No.")
                    else
                        Message('พบ %1 Routing Line:\n\n%2', Count, MsgText);
                end;
            }
            action(TestComponentLine)
            {
                Caption = '🧩 ทดสอบ Component Line';
                ApplicationArea = All;
                Image = View;

                trigger OnAction()
                var
                    ComponentLine: Record "Prod. Order Component";
                    MsgText: Text;
                    Count: Integer;
                begin
                    MsgText := '';
                    Count := 0;

                    ComponentLine.SetRange("Prod. Order No.", Rec."No."); // กรองจาก Production Order No.

                    if ComponentLine.FindSet() then
                        repeat
                            MsgText += StrSubstNo(
                                'Item No.: %1\nDescription: %2\nQuantity Per: %3\n\n',
                                ComponentLine."Item No.",
                                ComponentLine.Description,
                                Format(ComponentLine."Quantity per")
                            );
                            Count += 1;
                        until ComponentLine.Next() = 0;

                    if Count = 0 then
                        Message('ไม่พบ Component Line สำหรับ Production Order No. = %1', Rec."No.")
                    else
                        Message('พบ %1 Component Line:\n\n%2', Count, MsgText);
                end;
            }
            action("View Output Journals")
            {
                ApplicationArea = All;
                Caption = 'Output Journal';
                Image = OutputJournal;
                ToolTip = 'Output Journal';

                trigger OnAction()
                var
                    OutputCardPage: Page "Output Journal";
                begin
                    // OutputCardPage.SetRecord(Rec); // กำหนด record ปัจจุบันเข้าไป
                    OutputCardPage.RunModal();
                end;
            }
        }
        addlast(Promoted)
        {
            group(Category_Calendar)
            {
                Caption = 'Calendar/Output';
                actionref(Show_Promoted; "View Calendar") { }
                // actionref(Show_Promoted2; "View Output Header Card") { }
                actionref(Show_Promoted6; "View Output Card") { }


            }
            group(Category_Test)
            {
                Caption = 'Test data';
                actionref(Show_Promoted4; "View Routing") { }
                actionref(Show_Promoted7; "View Component") { }
                actionref(Show_Promoted2; "View Output Header Card") { }
                actionref(Show_Promoted8; "View Production Journal") { }
                actionref(Show_Promoted9; "View Output Journals") { }
                actionref(Show_Promoted1; "TestShowDueDate") { }
                actionref(Show_Promoted3; "TestRoutingLine") { }
                actionref(Show_Promoted5; "TestComponentLine") { }
            }
        }
    }
    local procedure ShowProductionJournal()
    var
        ProductionJrnlMgt: Codeunit "Production Journal Mgt";
        ProdOrderLine: Record "Prod. Order Line";
        ProdOrder: Record "Production Order";
    begin
        CurrPage.SaveRecord();

        // Rec คือ "Production Order"
        ProdOrder := Rec;

        // หาบรรทัดที่เกี่ยวข้องของ Production Order
        ProdOrderLine.SetRange("Prod. Order No.", Rec."No.");
        if not ProdOrderLine.FindFirst() then
            Error('ไม่พบบรรทัดของ Production Order No. %1', Rec."No.");

        Clear(ProductionJrnlMgt);
        ProductionJrnlMgt.Handling(ProdOrder, ProdOrderLine."Line No.");
    end;

}
