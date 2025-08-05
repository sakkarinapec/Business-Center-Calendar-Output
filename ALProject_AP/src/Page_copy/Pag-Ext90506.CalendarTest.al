pageextension 90506 "Calendar Test" extends "Calendar ap"
{
    // PageType = Card;
    // ApplicationArea = All;
    // UsageCategory = Documents;
    // SourceTable = "Production Order";
    // Caption = 'Calendar Card AP Test';

    layout
    {
        addlast(Content)
        {
            group(CalendarGroup)
            {
                Caption = 'Calendar Test';
                usercontrol(CalendarControl; calendar2)
                {
                    ApplicationArea = All;

                }
            }
        }
    }
    trigger OnAfterGetCurrRecord()
    begin
        // เตรียม context หรือ state ถ้าต้องการ
    end;

    procedure ViewEventDetail(EventId: Text)
    var
        Parts: List of [Text];
        ProdOrderNo: Code[20];
        LineNo: Integer;
    begin
        Parts := EventId.Split('|');
        if Parts.Count >= 2 then begin
            ProdOrderNo := Parts.Get(1);
            Evaluate(LineNo, Parts.Get(2));

            // 🔍 แสดงรายละเอียดใน panel หรือ message
            Message('รายละเอียด: Order %1, Line %2', ProdOrderNo, LineNo);

            // หรือจะเก็บไว้ใน global variable แล้วแสดงใน UI ก็ได้
        end;
    end;

    procedure OpenEventPage(EventId: Text)
    var
        Parts: List of [Text];
        ProdOrderNo: Code[20];
        LineNo: Integer;
        POLine: Record "Prod. Order Routing Line";
        PageID: Integer;
    begin
        Parts := EventId.Split('|');
        if Parts.Count >= 2 then begin
            ProdOrderNo := Parts.Get(1);
            Evaluate(LineNo, Parts.Get(2));

            // 👇 ค้นหาข้อมูลจริง
            if POLine.Get('Released', ProdOrderNo, LineNo) then begin
                // ตัวอย่าง: เปิดหน้า Page ของ Routing Line
                PageID := Page::"Prod. Order Routing";
                PAGE.Run(PageID, POLine);
            end else
                Message('ไม่พบข้อมูลสำหรับ %1 / %2', ProdOrderNo, LineNo);
        end;
    end;

    trigger OnOpenPage()
    begin
        LoadRoutingEvents2();
    end;

    procedure LoadRoutingEvents2()
    var
        POLine: Record "Prod. Order Routing Line";
        ProdOrderLine: Record "Prod. Order Line";
        JsonText: Text;
        IsFirst: Boolean;
        TitleText: Text;
        StartingDateStr: Text;
    begin
        JsonText := '[';
        IsFirst := true;

        if POLine.FindSet() then
            repeat
                if POLine."Starting Date" <> 0D then begin
                    if not IsFirst then
                        JsonText += ',';

                    StartingDateStr := Format(POLine."Starting Date", 0, '<Year4>-<Month,2>-<Day,2>');

                    if ProdOrderLine.Get(POLine.Status, POLine."Prod. Order No.", POLine."Routing Reference No.") then begin
                        // สร้าง title รวม 3 ฟิลด์แบบ %3 | %4 | %5
                        TitleText := StrSubstNo(
                            '%1 | %2 | %3 | %4',
                            POLine."Prod. Order No.",
                            ProdOrderLine."Item No.",
                            ProdOrderLine.Description.Replace('"', '\"'),
                            POLine.Description.Replace('"', '\"')
                        );

                        JsonText += StrSubstNo(
                            '{ "id": "%1|%2", "title": "%3", "start": "%4", "allDay": true, "prodOrderNo": "%5", "lineNo": "%6", "description": "%7" }',
                            Format(POLine."Prod. Order No."),
                            Format(ProdOrderLine."Line No."),
                            TitleText,
                            StartingDateStr,
                            POLine."Prod. Order No.",
                            Format(ProdOrderLine."Line No."),
                            ProdOrderLine.Description.Replace('"', '\"')
                        );
                    end;

                    IsFirst := false;
                end;
            until POLine.Next() = 0;

        JsonText += ']';

        CurrPage.CalendarControl.LoadEvents(JsonText);
    end;
}
