controladdin Calendar
{
    Scripts =
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.js',// ✅ calendar
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/locales-all.global.min.js',// ✅ calendar
      // 'src/Resources/CalendarTest\calendar.js';

      // 'src\Resources\Calendar\main.js',
      // 'src\Resources\Calendar\calendar-core.js',
      // 'src\Resources\Calendar\panel-detail.js',
      // 'src\Resources\Calendar\routing-panel.js',
      // 'src\Resources\Calendar\component-panel.js',
      // 'src\Resources\Calendar\toast.js',
      // 'src\Resources\Calendar\theme-switcher.js',
      // 'src\Resources\Calendar\date-prompt.js';

      'src\Resources\Calendar\calendar-main.js',
      'src\Resources\Calendar\event-highlight.js',
      'src\Resources\Calendar\routing-components.js',
      'src\Resources\Calendar\ui-calendar.js',
      'src\Resources\Calendar\ui-filter.js',
      'src\Resources\Calendar\ui-panel.js',
      'src\Resources\Calendar\ui-theme.js',
      'src\Resources\Calendar\utilities.js',
      'src\Resources\Calendar\more.js';
    StyleSheets =
      // 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.css',
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.css', // ✅ calendar
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',// ✅ไอคอน
      // 'src/Resources/CalendarTest\calendar.css',
      //   'src\Resources\CalendarTest\calendar-themes.css';
      'src/Resources/Calendar\calendar.css',
      'src\Resources\Calendar\calendar-themes.css',
      'src\Resources\Calendar\ui-calendar.css',
      'src\Resources\Calendar\routing-components.css';


    // StartupScript = 'src/Resources/CalendarTest\calendar.js';
    StartupScript = 'src\Resources\Calendar\calendar-main.js';
    RequestedHeight = 1500;
    // RequestedWidth = 1300;

    VerticalStretch = true;
    HorizontalStretch = true;

    // สามารถสร้าง Procedure ถ้าต้องการโต้ตอบ AL ↔ JS
    procedure LoadEvents(jsonText: Text);
    event DateSelected(startDate: Text; endDate: Text);
    event EventMoved(No: Text; NewDate: Text);
    procedure SwitchTheme(themeName: Text);
    event EventClicked(EventId: Text)
    // procedure AddRoutingEvents(JsonText: Text);
    // procedure LoadRoutingData(htmlText: Text);
    event OnEventClicked(EventId: Text)
    event OnLoadRoutingDetails()
    Procedure SetRoutingText(MsgText: Text);
    Procedure SetComponentText(MsgText: Text);
    event ViewRouting(ProdOrderNo: Text);
    event ViewProdOrder(ProdOrderNo: Text);
    event ViewComponents(ProdOrderNo: Text)
    event LoadProdOrderComponents(ProdOrderNo: Text);
    procedure ShowUndoSuccessToast(Message: Text);
    // event EventClicked(eventId: Text)
    // **เพิ่ม procedure เพื่อให้ JS เรียกได้**
    event FilterChanged(filterValue: Text);
}