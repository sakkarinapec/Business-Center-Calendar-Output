page 90505 "Output Header Card"
{
    ApplicationArea = Manufacturing;
    Caption = 'Output Header Card';
    PageType = Card;
    SourceTable = "Item Journal Line";
    Editable = true;

    layout
    {
        area(Content)
        {
            group(General)
            {
                field("Journal Template Name"; Rec."Journal Template Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'เลือก Journal Template ที่จะใช้';
                    TableRelation = "Item Journal Template".Name;
                }
                field("Journal Batch Name"; Rec."Journal Batch Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'เลือก Journal Batch ที่จะใช้';
                    TableRelation = "Item Journal Batch".Name WHERE("Journal Template Name" = FIELD("Journal Template Name"));
                }
                field("Document No."; Rec."Document No.")
                {
                    ApplicationArea = All;
                }
                field("Posting Date"; Rec."Posting Date")
                {
                    ApplicationArea = All;
                }
                field("Document Date"; Rec."Document Date")
                {
                    ApplicationArea = All;
                }
                field("Quantity"; Rec.Quantity)
                {
                    ApplicationArea = All;
                }
                // เพิ่มฟิลด์อื่น ๆ ตามต้องการ
            }
        }
    }

    // trigger OnValidate()
    // begin
    //     // ตัวอย่างเช็คถ้าต้องการ (option)
    //     if Rec."Journal Template Name" = '' then
    //         Error('กรุณาเลือก Journal Template Name ก่อน');
    //     if Rec."Journal Batch Name" = '' then
    //         Error('กรุณาเลือก Journal Batch Name ก่อน');
    // end;

    // trigger OnInsert()
    // begin
    //     if Rec."Journal Template Name" = '' then
    //         Error('กรุณาเลือก Journal Template Name ก่อนบันทึก');
    //     if Rec."Journal Batch Name" = '' then
    //         Error('กรุณาเลือก Journal Batch Name ก่อนบันทึก');

    //     // ดึง Template และ Batch มาใช้กำหนดค่าเริ่มต้น
    //     var
    //         ItemJnlTemplate: Record "Item Journal Template";
    //         ItemJnlBatch: Record "Item Journal Batch";
    //     begin
    //         ItemJnlTemplate.Get(Rec."Journal Template Name");
    //         ItemJnlBatch.Get(Rec."Journal Template Name", Rec."Journal Batch Name");

    //         if Rec."Posting No. Series" = '' then
    //             Rec."Posting No. Series" := ItemJnlBatch."Posting No. Series";
    //         if Rec."Posting No. Series" = '' then
    //             Rec."Posting No. Series" := ItemJnlTemplate."Posting No. Series";

    //         Rec.ValidateShortcutDimCode(1, Rec."Shortcut Dimension 1 Code");
    //         Rec.ValidateShortcutDimCode(2, Rec."Shortcut Dimension 2 Code");
    //         Rec.ValidateNewShortcutDimCode(1, Rec."New Shortcut Dimension 1 Code");
    //         Rec.ValidateNewShortcutDimCode(2, Rec."New Shortcut Dimension 2 Code");

    //         CheckPlanningAssignment();
    //     end;
    // end;
}
