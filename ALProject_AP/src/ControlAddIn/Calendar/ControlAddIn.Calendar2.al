controladdin Calendar2
{
    Scripts =
        'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.js',
        'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/locales-all.global.min.js',
        'src/Resources/Test/event-handlers.js',
        'src\Resources\Test\init.js',
        'src/Resources/Test/calendar2.js';
    StyleSheets =
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.css',
      'src/Resources/Test\calendar2.css';

    StartupScript = 'src\Resources\Test\calendar2.js';
    RequestedHeight = 900;
    // RequestedWidth = 1300;

    VerticalStretch = true;
    HorizontalStretch = true;

    // สามารถสร้าง Procedure ถ้าต้องการโต้ตอบ AL ↔ JS
    procedure LoadEvents(jsonText: Text);
    event DateSelected(startDate: Text; endDate: Text);
    event EventMoved(No: Text; NewDate: Text);
    procedure SwitchTheme(themeName: Text);
    procedure SetRoutingText(Text: Text);
}