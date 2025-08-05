controladdin "calendar Test"
{
    Scripts =
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.js',
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/locales-all.global.min.js',
      'src\Resources\Test\CalendarTest.js';
    StyleSheets =
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.18/index.global.min.css';

    StartupScript = 'src\Resources\Test\CalendarTest.js';
    RequestedHeight = 1250;
    // RequestedWidth = 1300;

    VerticalStretch = true;
    HorizontalStretch = true;

    procedure LoadEvents(jsonText: Text);
    event AddInReady();
}