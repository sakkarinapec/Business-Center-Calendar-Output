page 90501 "Calendar ap"
{

    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Documents;
    SourceTable = "Prod. Order Line";
    DataCaptionFields = "Prod. Order No.", "Line No.", "Routing No.";
    Caption = 'Calendar Card AP';
    AdditionalSearchTerms = 'ap';
    DataCaptionExpression = Format(Rec."Prod. Order No.") + ' ∙ ' + Format(Rec."Line No.") + ' ∙ ' + Format(Rec."Routing No.")
    + ' ∙ ' + Format(Rec.Description);

    layout
    {
        area(Content)
        {
            group(BOX_Calendar)
            {
                usercontrol(MyCalendar; Calendar)
                {
                    ApplicationArea = All;

                    trigger EventMoved(LineNo: Text; NewDate: Text)
                    var
                        POLine: Record "Prod. Order Line";
                        NewDateValue: Date;
                        SplitValues: List of [Text];
                        ProdOrderNo: Code[20];
                        LineNoInt: Integer;
                        NewDateTimeValue: DateTime;
                        NewStartingDateTime: DateTime;
                        // NewDateValue: Date;
                        NewStartingDate: Date;
                    begin
                        Evaluate(NewDateValue, NewDate);
                        // แปลง Date เป็น DateTime เวลา 00:00:00
                        // NewDateTimeValue := CreateDateTime(NewDateValue, TIME());
                        // NewStartingDateTime := CreateDateTime(CalcDate('<-1D>', NewDateValue), TIME());
                        NewStartingDate := CalcDate('<-1D>', NewDateValue);
                        POLine.Validate("Starting Date", CalcDate('<-1D>', NewDateValue));
                        POLine.Validate("Due Date", NewDateValue);

                        SplitValues := LineNo.Split('|');
                        if SplitValues.Count = 2 then begin
                            ProdOrderNo := SplitValues.Get(1);
                            Evaluate(LineNoInt, SplitValues.Get(2));

                            POLine.SetRange("Prod. Order No.", ProdOrderNo);
                            POLine.SetRange("Line No.", LineNoInt);

                            if POLine.FindFirst() then begin
                                LastProdOrderNo := ProdOrderNo;
                                LastLineNo := LineNoInt;
                                // 🔸 เก็บค่าเดิมไว้ก่อน
                                LastOldDate := POLine."Starting Date";
                                UndoStack.Add(StrSubstNo('%1|%2|%3',
                                    ProdOrderNo,
                                    LineNoInt,
                                    Format(LastOldDate, 0, '<Year4>-<Month,2>-<Day,2>')
                                ));
                                // POLine.Validate("Due Date", NewDateValue);
                                POLine.Validate("Starting Date", NewStartingDate);
                                POLine.Modify(true);
                                // ✅ Refresh Routing View
                                SelectedProdOrderNo := ProdOrderNo;
                                SelectedLineNo := LineNoInt;

                                // LoadCalendarData();
                                LoadRoutingDetails();
                                // LoadRoutingEvents2();
                                OnFilterChanged('production');
                                Message('✅ อัปเดต Due Date: %1 - Line %2 → %3 | %4',
                                    ProdOrderNo, LineNoInt,
                                    Format(NewDateValue, 0, '<Year4>-<Month,2>-<Day,2>'),
                                    Format(NewStartingDate, 0, '<Year4>-<Month,2>-<Day,2>')
                                );
                            end else
                                Message('❌ ไม่พบข้อมูลสำหรับ %1 - Line %2', ProdOrderNo, LineNoInt);
                        end;
                    end;

                    trigger EventClicked(eventId: Text)
                    var
                        Parts: List of [Text];
                    begin
                        Parts := eventId.Split('|');
                        if Parts.Count = 2 then begin
                            SelectedProdOrderNo := Parts.Get(1);
                            SelectedLineNo := EvaluateInt(Parts.Get(2));

                            LoadRoutingDetails(); // โหลด Routing เฉพาะรายการที่เลือก
                            // LoadComponentEvents();     // ✅ โหลด Component
                            // LoadProdOrderComponents(eventId);
                            LoadProdOrderComponents(SelectedProdOrderNo);
                        end;
                    end;

                    trigger ViewRouting(ProdOrderNo: Text)
                    begin
                        viewRouting(ProdOrderNo);
                    end;

                    trigger ViewProdOrder(ProdOrderNo: Text)
                    begin
                        ViewProdOrder(ProdOrderNo);
                    end;

                    trigger ViewComponents(ProdOrderNo: Text)
                    begin
                        ViewComponent(ProdOrderNo);
                    end;

                    trigger FilterChanged(filterValue: Text)
                    begin
                        OnFilterChanged(filterValue); // เรียก procedure ที่คุณประกาศไว้
                    end;
                }
            }


        }

    }
    actions
    {
        area(Processing)
        {
            action(UndoDateChange)
            {
                ApplicationArea = All;
                Caption = 'Undo Last Date Change';
                Image = Undo;

                trigger OnAction()
                var
                    POLine: Record "Prod. Order Line";
                    LastEntry: Text;
                    Parts: List of [Text];
                    OldDateTime: DateTime;
                    OldDateString: Text;
                    OldDate: Date;
                begin
                    if UndoStack.Count > 0 then begin
                        LastEntry := UndoStack.Get(UndoStack.Count);
                        UndoStack.RemoveAt(UndoStack.Count); // pop
                        // LastIndex := UndoStack.Count;
                        // LastEntry := UndoStack.Get(LastIndex);
                        // UndoStack.RemoveAt(LastIndex); // pop

                        Parts := LastEntry.Split('|');
                        if Parts.Count = 3 then begin
                            LastProdOrderNo := Parts.Get(1);
                            LastLineNo := EvaluateInt(Parts.Get(2));
                            Evaluate(OldDate, Parts.Get(3));

                            POLine.SetRange("Prod. Order No.", LastProdOrderNo);
                            POLine.SetRange("Line No.", LastLineNo);

                            if POLine.FindFirst() then begin
                                POLine.Validate("Starting Date", OldDate);
                                POLine.Modify(true);

                                LoadRoutingDetails();
                                LoadRoutingEvents();
                                LoadCalendarData();
                                CurrPage.MyCalendar.ShowUndoSuccessToast(StrSubstNo(
                                    '⏪ ย้อนกลับ Production %1 Line %2 เป็น %3 สำเร็จ',
                                    LastProdOrderNo, LastLineNo, Format(OldDateTime)
                                ));
                            end;
                        end;
                    end else
                        Message('⚠️ ไม่มีประวัติที่สามารถ Undo ได้แล้ว');
                end;
            }
            action(UndoAllDateChanges)
            {
                ApplicationArea = All;
                Caption = 'Undo All Date Changes';
                Image = Undo;

                trigger OnAction()
                var
                    POLine: Record "Prod. Order Line";
                    Entry: Text;
                    Parts: List of [Text];
                    OldDate: Date;
                    i: Integer;
                    UndoCount: Integer;
                begin
                    if UndoStack.Count = 0 then begin
                        Message('⚠️ ไม่มีประวัติให้ย้อนกลับ');
                        exit;
                    end;

                    UndoCount := 0;

                    for i := UndoStack.Count downto 1 do begin
                        Entry := UndoStack.Get(i);
                        Parts := Entry.Split('|');

                        if Parts.Count = 3 then begin
                            LastProdOrderNo := Parts.Get(1);
                            LastLineNo := EvaluateInt(Parts.Get(2));
                            Evaluate(OldDate, Parts.Get(3));

                            POLine.SetRange("Prod. Order No.", LastProdOrderNo);
                            POLine.SetRange("Line No.", LastLineNo);

                            if POLine.FindFirst() then begin
                                POLine.Validate("Starting Date", OldDate);
                                POLine.Modify(true);
                                UndoCount += 1;
                            end;
                        end;
                    end;

                    // UndoStack.Clear(); // 🔁 เคลียร์ stack หลังจาก undo หมด
                    while UndoStack.Count > 0 do
                        // UndoStack.Remove(UndoStack.Count);
                        UndoStack.RemoveAt(i);

                    LoadRoutingDetails();
                    LoadRoutingEvents();
                    LoadCalendarData();

                    Message('⏪ ย้อนกลับทั้งหมด %1 รายการสำเร็จ', UndoCount);
                end;
            }

            action(CheckComponents)
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
                    if SelectedProdOrderNo = '' then begin
                        Message('⚠️ กรุณาคลิกรายการใน Calendar ก่อนเพื่อเลือก Production Order');
                        exit;
                    end;

                    MsgText := '';
                    Count := 0;

                    ComponentLine.SetRange("Prod. Order No.", SelectedProdOrderNo);
                    if SelectedLineNo <> 0 then
                        ComponentLine.SetRange("Prod. Order Line No.", SelectedLineNo);

                    if ComponentLine.FindSet() then
                        repeat
                            MsgText +=
                                'Prod Order No.: ' + ComponentLine."Prod. Order No." + '\n' +
                                'Item No.: ' + ComponentLine."Item No." + '\n' +
                                'Description: ' + ComponentLine.Description + '\n' +
                                'Quantity Per: ' + Format(ComponentLine."Quantity per") + '\n\n';
                            Count += 1;
                        until ComponentLine.Next() = 0;

                    if Count = 0 then
                        Message('ไม่พบ Component Line สำหรับ Production Order %1 Line %2',
                            SelectedProdOrderNo, SelectedLineNo)
                    else
                        Message('พบ %1 Component Line สำหรับ %2 Line %3:\n\n%4',
                            Count, SelectedProdOrderNo, SelectedLineNo, MsgText);
                end;
            }
            action(OpenComponentsPage)
            {
                Caption = '🧩 เปิดหน้า Component Lines';
                ApplicationArea = All;
                Image = View;

                trigger OnAction()
                var
                    ComponentLine: Record "Prod. Order Component";
                    ComponentPage: Page "Prod. Order Components";
                begin
                    if SelectedProdOrderNo = '' then begin
                        Message('⚠️ กรุณาคลิกรายการใน Calendar ก่อนเพื่อเลือก Production Order');
                        exit;
                    end;

                    ComponentLine.SetRange("Prod. Order No.", SelectedProdOrderNo);
                    if SelectedLineNo <> 0 then
                        ComponentLine.SetRange("Prod. Order Line No.", SelectedLineNo);

                    ComponentPage.SetTableView(ComponentLine);
                    ComponentPage.RunModal();
                end;
            }

        }area(Promoted){
            group(Category_Undo)
            {
                Caption = 'Undo';
                actionref(Show_Promoted; "UndoDateChange") { }
                actionref(Show_Promoted6; "UndoAllDateChanges") { }

            }
            group(Category_Test)
            {
                Caption = 'Test data';
                actionref(Show_Promoted4; "OpenComponentsPage") { }
                actionref(Show_Promoted5; "CheckComponents") { }
            }
        }
    }
    var
        SelectedProdOrderNo: Code[20];
        SelectedLineNo: Integer;

        LastProdOrderNo: Code[20];
        LastLineNo: Integer;
        LastOldDateTime: DateTime;
        LastOldDate: Date;
        UndoStack: List of [Text]; // เก็บค่าเป็น Text เช่น 'ProdOrderNo|LineNo|DateTime'
        ComponentArray: JsonArray;
        obj: JsonObject;

    trigger OnQueryClosePage(CloseAction: Action): Boolean
    begin
        // ถ้ามี Undo Stack ค้างอยู่ แสดงข้อความยืนยัน
        if UndoStack.Count > 0 then begin
            if not Confirm('คุณยังมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการปิดหน้านี้หรือไม่? Yes(บันทึกและออก) NO(กลับหน้า Calendar)') then
                exit(false); // ไม่อนุญาตให้ปิดหน้า
        end;

        exit(true); // อนุญาตให้ปิดหน้า
    end;

    trigger OnOpenPage()
    begin
        // LoadCalendarData();
        // LoadRoutingEvents();
        // LoadRoutingEvents2();
        // LoadAllEvents();
        // LoadRoutingDetails()
        // LoadComponentEvents();
        OnFilterChanged('production');

    end;

    procedure OnFilterChanged(filterValue: Text)
    begin
        if filterValue = 'production' then
            LoadCalendarData()
        else if filterValue = 'routing' then
            LoadRoutingEvents()
        else if filterValue = 'component' then
            LoadComponentEvents()
        else
            LoadAllEvents();

    end;

    procedure LoadCalendarData()
    var
        POLine: Record "Prod. Order Line";
        PO: Record "Production Order";
        // ProdOrderLine: Record "Prod. Order Line";
        JsonText: Text;
        IsFirst: Boolean;
        TitleText: Text;
    begin
        JsonText := '[';
        IsFirst := true;

        // POLine.SetRange("Prod. Order No.", Rec."Prod. Order No.");
        if POLine.FindSet() then
            repeat
                if POLine."Due Date" <> 0D then begin
                    if not IsFirst then
                        JsonText += ',';

                    TitleText := POLine.Description.Replace('"', '\"');
                    // JsonText += StrSubstNo(
                    //         '{ "id": "%1|%2", "title": "%3 | %4 | %5", "start": "%6" , "allDay": true, "classNames": ["has-event"] }',
                    //         Format(POLine."Prod. Order No."),
                    //         Format(POLine."Line No."),
                    //         Format(POLine."Prod. Order No."),
                    //         POLine."Item No.",
                    //         TitleText,
                    //         Format(POLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>')
                    //     );
                    JsonText += StrSubstNo(
                        '{ "id": "%1|%2", "title": "🏭 %3 | %4", "start": "%5", "allDay": true, "classNames": ["has-event"], ' +
                        '"extendedProps": { "description": "%6", "quantity": "%7", "startingDateTime": "%8", "endingDateTime": "%9", "other": "%13 | %14", "status": "%10" , "UnitofMeasure": "%12", "idPO": "%11", "FinishedQty":"%15", "RemainingQty":"%16" }}',
                        Format(POLine."Prod. Order No."),
                        Format(POLine."Line No."),
                        Format(POLine."Prod. Order No."),
                        TitleText,
                        Format(POLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine.Description.Replace('"', '\"')),
                        Format(POLine.Quantity, 0, 9),
                        Format(POLine."Starting Date-Time", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine."Ending Date-Time", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine.Status),
                        Format(POLine."Routing No."),
                        Format(POLine."Unit of Measure Code"),
                        Format(POLine."Inventory Posting Group"),
                        Format(POLine."Item No."),
                        Format(POLine."Finished Quantity"),
                        Format(POLine."Remaining Quantity")
                    );

                    IsFirst := false;
                end;
            until POLine.Next() = 0;

        JsonText += ']';

        CurrPage.MyCalendar.LoadEvents(JsonText);
    end;
    procedure LoadRoutingEvents()
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
                            POLine.Description.Replace('"', '\"'),
                            POLine."Prod. Order No.",
                            ProdOrderLine."Item No.",
                            ProdOrderLine.Description.Replace('"', '\"')
                        );

                        JsonText += StrSubstNo(
                            '{ "id": "routing-%1|%2", "title": "🧪 %3", "start": "%4", "allDay": true,  "classNames": ["routing"],"prodOrderNo": "%5", "lineNo": "%6", "description": "%7" }',
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

        CurrPage.MyCalendar.LoadEvents(JsonText);
    end;

    procedure LoadRoutingDetails()
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

        POLine.SetRange("Prod. Order No.", SelectedProdOrderNo);
        // อาจจะกรองตาม LineNo ถ้าตาราง Routing มีฟิลด์นี้

        if POLine.FindSet() then
            repeat
                if POLine."Starting Date" <> 0D then begin
                    if not IsFirst then
                        JsonText += ',';

                    StartingDateStr := Format(POLine."Starting Date", 0, '<Year4>-<Month,2>-<Day,2>');

                    if ProdOrderLine.Get(POLine.Status, POLine."Prod. Order No.", POLine."Routing Reference No.") then begin
                        TitleText := StrSubstNo(
                            '<b>Production Order No. :</b> %1<br/><b>Item No. :</b> %2<br/><b>Description :</b> %3<br/><b>Routing :</b> %4<br/><b>Start Date :</b> %5<br/><b>End Date :</b> %6',
                            POLine."Prod. Order No.",
                            ProdOrderLine."Item No.",
                            ProdOrderLine.Description.Replace('"', '\"'),
                            POLine.Description.Replace('"', '\"'),
                            Format(POLine."Starting Date-Time", 0, '<Year4>-<Month,2>-<Day,2>'),
                            Format(POLine."Ending Date-Time", 0, '<Year4>-<Month,2>-<Day,2>')
                        );

                        JsonText += StrSubstNo(
                            '{ "id": "%1|%2", "title": "%8", "start": "%4", "allDay": true, "prodOrderNo": "%5", "lineNo": "%6", "description": "%7", "other": "%3", "Status": "%9" }',
                            Format(POLine."Prod. Order No."),
                            Format(ProdOrderLine."Line No."),
                            TitleText,
                            StartingDateStr,
                            POLine."Prod. Order No.",
                            Format(ProdOrderLine."Line No."),
                            ProdOrderLine.Description.Replace('"', '\"'),
                            POLine.Description.Replace('"', '\"'),
                            Format(POLine."Routing Status")
                        );
                    end;
                    IsFirst := false;
                end;
            until POLine.Next() = 0;

        JsonText += ']';

        CurrPage.MyCalendar.SetRoutingText(JsonText);
    end;

    procedure EvaluateInt(text: Text): Integer;
    var
        intValue: Integer;
    begin
        if not Evaluate(intValue, text) then
            intValue := 0;
        exit(intValue);
    end;

    procedure viewRouting(ProdOrderNo: Code[20])
    var
        OutputListPage: Page "Prod. Order Routing";
        FilteredRoutingLine: Record "Prod. Order Routing Line";
    begin
        FilteredRoutingLine.SetRange("Prod. Order No.", ProdOrderNo);
        OutputListPage.SetTableView(FilteredRoutingLine);
        OutputListPage.RunModal();
    end;

    procedure ViewProdOrder(id: Text)
    var
        ReleasedProdOrderPage: Page "Released Production Order";
        ReleasedProdOrderRec: Record "Production Order";
        ProdOrderNo: Text;
        PosPipe: Integer;
    begin
        PosPipe := StrPos(id, '|');
        if PosPipe > 0 then
            ProdOrderNo := CopyStr(id, 1, PosPipe - 1)
        else
            ProdOrderNo := id;

        ReleasedProdOrderRec.SetFilter("No.", '%1', ProdOrderNo);
        ReleasedProdOrderPage.SetTableView(ReleasedProdOrderRec);
        ReleasedProdOrderPage.RunModal();
    end;

    procedure ViewComponent(ProdOrderNo: Text)
    var
        ComponentPage: Page "Prod. Order Components";
        ComponentLine: Record "Prod. Order Component";
    begin
        if ProdOrderNo = '' then begin
            Message('⚠️ ไม่ได้ระบุ Production Order');
            exit;
        end;

        ComponentLine.SetRange("Prod. Order No.", ProdOrderNo);
        if SelectedLineNo <> 0 then
            ComponentLine.SetRange("Prod. Order Line No.", SelectedLineNo);

        ComponentPage.SetTableView(ComponentLine);
        ComponentPage.RunModal();
    end;

    procedure LoadProdOrderComponents(ProdOrderNo: Text)
    var
        ComponentLine: Record "Prod. Order Component";
        JsonText: Text;
        First: Boolean;
    begin
        JsonText := '[';
        First := true;

        ComponentLine.SetRange("Prod. Order No.", ProdOrderNo);
        if ComponentLine.FindSet() then begin
            repeat
                if not First then
                    JsonText += ','
                else
                    First := false;

                JsonText += '{' +
                    '"ProdOrderNo":"' + Format(ComponentLine."Prod. Order No.") + '",' + // ✅ เพิ่มบรรทัดนี้
                    '"ItemNo":"' + Format(ComponentLine."Item No.") + '",' +
                    '"Description":"' + Format(ComponentLine.Description) + '",' +
                    '"QuantityPer":"' + Format(ComponentLine."Quantity per") + '",' +
                    '"DueDate":"' + Format(ComponentLine."Due Date") + '", ' +
                    '"UnitofMeasure":"' + Format(ComponentLine."Unit of Measure Code") + '"' +
                '}';
            until ComponentLine.Next() = 0;
        end;

        JsonText += ']';

        // ✅ ส่งกลับไปยัง JavaScript
        CurrPage.MyCalendar.SetComponentText(JsonText);
    end;

    procedure LoadComponentEvents(ProdOrderNo: Text)
    begin
        LoadProdOrderComponents(ProdOrderNo); // อาจเรียกตรงๆ
    end;

    procedure LoadAllEvents()
    var
        POLine: Record "Prod. Order Line";
        POLineRouting: Record "Prod. Order Routing Line";
        ProdOrderLine: Record "Prod. Order Line";
        ComponentLine: Record "Prod. Order Component";

        JsonText: Text;
        EventsProd: Text;
        EventsRouting: Text;
        EventsComponent: Text;

        FirstProd: Boolean;
        FirstRouting: Boolean;
        FirstComponent: Boolean;

        TitleText: Text;
        StartingDateStr: Text;
    begin
        EventsProd := '';
        EventsRouting := '';
        EventsComponent := '';

        FirstProd := true;
        FirstRouting := true;
        FirstComponent := true;

        // 🔹 1. Production Events
        if POLine.FindSet() then
            repeat
                if POLine."Due Date" <> 0D then begin
                    if not FirstProd then
                        EventsProd += ',';

                    TitleText := POLine.Description.Replace('"', '\"');

                    EventsProd += StrSubstNo(
                        '{ "id": "%1|%2", "title": "🏭 %3 | %4", "start": "%5", "allDay": true, "classNames": ["production"], ' +
                        '"extendedProps": { "description": "%6", "quantity": "%7", "startingDateTime": "%8", "endingDateTime": "%9", "status": "%10", "routingNo": "%11" }}',
                        Format(POLine."Prod. Order No."),
                        Format(POLine."Line No."),
                        Format(POLine."Prod. Order No."),
                        TitleText,
                        Format(POLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine.Description.Replace('"', '\"')),
                        Format(POLine.Quantity, 0, 9),
                        Format(POLine."Starting Date-Time", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine."Ending Date-Time", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(POLine.Status),
                        Format(POLine."Routing No.")
                    );

                    FirstProd := false;
                end;
            until POLine.Next() = 0;

        // 🔹 2. Routing Events
        if POLineRouting.FindSet() then
            repeat
                if POLineRouting."Starting Date" <> 0D then begin
                    if not FirstRouting then
                        EventsRouting += ',';

                    StartingDateStr := Format(POLineRouting."Starting Date", 0, '<Year4>-<Month,2>-<Day,2>');

                    if ProdOrderLine.Get(POLineRouting.Status, POLineRouting."Prod. Order No.", POLineRouting."Routing Reference No.") then begin
                        TitleText := StrSubstNo(
                            '%1 | %2 | %3 | %4',
                            POLineRouting."Prod. Order No.",
                            ProdOrderLine."Item No.",
                            ProdOrderLine.Description.Replace('"', '\"'),
                            POLineRouting.Description.Replace('"', '\"')
                        );

                        EventsRouting += StrSubstNo(
                            '{ "id": "routing-%1|%2", "title": "🧪 %3", "start": "%4", "allDay": true, "classNames": ["routing"], ' +
                            '"extendedProps": { "description": "%5", "prodOrderNo": "%6", "lineNo": "%7" }}',
                            Format(POLineRouting."Prod. Order No."),
                            Format(ProdOrderLine."Line No."),
                            TitleText,
                            StartingDateStr,
                            ProdOrderLine.Description.Replace('"', '\"'),
                            POLineRouting."Prod. Order No.",
                            Format(ProdOrderLine."Line No.")
                        );
                    end;

                    FirstRouting := false;
                end;
            until POLineRouting.Next() = 0;

        // 🔹 3. Component Events
        if ComponentLine.FindSet() then
            repeat
                if ComponentLine."Due Date" <> 0D then begin
                    if not FirstComponent then
                        EventsComponent += ',';

                    TitleText := ComponentLine.Description.Replace('"', '\"');

                    EventsComponent += StrSubstNo(
                        '{ "id": "comp-%1|%2", "title": "🔩 %3 | %4", "start": "%5", "allDay": true, "classNames": ["component-event"], ' +
                        '"extendedProps": { "itemNo": "%6", "quantity": "%7", "description": "%8", "dueDate": "%9" }}',
                        Format(ComponentLine."Prod. Order No."),
                        Format(ComponentLine."Line No."),
                        Format(ComponentLine."Item No."),
                        TitleText,
                        Format(ComponentLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(ComponentLine."Item No."),
                        Format(ComponentLine.Quantity, 0, 9),
                        Format(ComponentLine.Description.Replace('"', '\"')),
                        Format(ComponentLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>')
                    );

                    FirstComponent := false;
                end;
            until ComponentLine.Next() = 0;

        // 🔹 4. รวมทั้งหมด Production + Routing + Component
        JsonText := '[';

        if EventsProd <> '' then begin
            JsonText += EventsProd;
            if (EventsRouting <> '') or (EventsComponent <> '') then
                JsonText += ',';
        end;

        if EventsRouting <> '' then begin
            JsonText += EventsRouting;
            if EventsComponent <> '' then
                JsonText += ',';
        end;

        if EventsComponent <> '' then
            JsonText += EventsComponent;

        JsonText += ']';

        CurrPage.MyCalendar.LoadEvents(JsonText);
    end;


    procedure LoadComponentEvents()
    var
        ComponentLine: Record "Prod. Order Component";
        JsonText: Text;
        IsFirst: Boolean;
        TitleText: Text;
    begin
        JsonText := '[';
        IsFirst := true;

        if ComponentLine.FindSet() then
            repeat
                if ComponentLine."Due Date" <> 0D then begin
                    if not IsFirst then
                        JsonText += ',';

                    TitleText := ComponentLine.Description.Replace('"', '\"');

                    JsonText += StrSubstNo(
                        '{ "id": "comp- %1|%2", "title": "🔩 %3 | %4", "start": "%5", "allDay": true, "classNames": ["component-event"], ' +
                        '"extendedProps": { "itemNo": "%6", "quantity": "%7", "description": "%8", "dueDate": "%9", "UnitofMeasure": "%10"}}',
                        Format(ComponentLine."Prod. Order No."),
                        Format(ComponentLine."Line No."),
                        Format(ComponentLine."Item No."),
                        TitleText,
                        Format(ComponentLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(ComponentLine."Item No."),
                        Format(ComponentLine.Quantity, 0, 9),
                        Format(ComponentLine.Description.Replace('"', '\"')),
                        Format(ComponentLine."Due Date", 0, '<Year4>-<Month,2>-<Day,2>'),
                        Format(ComponentLine."Unit of Measure Code")
                    );

                    IsFirst := false;
                end;
            until ComponentLine.Next() = 0;

        JsonText += ']';

        CurrPage.MyCalendar.LoadEvents(JsonText);
    end;
}