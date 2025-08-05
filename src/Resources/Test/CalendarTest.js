let calendar;

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        eventDrop: function (info) {
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("UpdateDueDate", [info.event.id, info.event.startStr]);
        },
        eventClick: function (info) {
            const props = info.event.extendedProps;
            alert(
                `📅 Starting Date: ${props.StartingDate}\n⏳ Ending Date: ${props.EndingDate}\n🛑 Due Date: ${props.DueDate}`
            );
        }
    });
    calendar.render();
    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("AddInReady", []);
});

function loadEvents(eventsJSON) {
    const events = JSON.parse(eventsJSON);
    calendar.removeAllEvents();
    events.forEach(event => calendar.addEvent(event));
}
