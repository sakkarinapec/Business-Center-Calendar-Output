pageextension 90503 "Prod. Order Routing Line Ext" extends "Prod. Order Routing"
{
    actions
    {
        addlast(Processing)
        {
            action("Report_ap")
            {
                Caption = 'Report_ใบสั่งการผลิต';
                Image = PrintCheck;
                ApplicationArea = All;
                Promoted = true;
                PromotedCategory = Process;

                trigger OnAction()
                var
                    RoutingRec: Record "Prod. Order Routing Line";
                    ProdOrder: Record "Production Order";
                    OrderLine: Record "Prod. Order Line";
                    OrderCom: Record "Prod. Order Component";
                begin
                    RoutingRec := Rec;

                    // ✅ กำหนด Filter ให้ Production Order (DataItem แรกของ Report)
                    ProdOrder.SetRange("No.", RoutingRec."Prod. Order No.");
                    ProdOrder.SetRange(Status, RoutingRec.Status);
                    RoutingRec.SetRange("Prod. Order No.");
                    OrderLine.SetRange("Line No.");
                    OrderCom.SetRange("Item No.");
                    // ✅ เรียก Report พร้อม Filter ที่ตั้งไว้
                    Report.RunModal(Report::"Delivery Note / Tax Invoice", true, false, ProdOrder);
                end;
            }
        }
    }
}