window.MyCalendarApp = (function () {
    let calendar;

    function init() {
        const container = document.getElementById("controlAddIn");
        if (!container) {
            console.error("❌ controlAddIn not found.");
            return;
        }

        const calendarEl = document.createElement("div");
        calendarEl.id = "calendar";
        container.appendChild(calendarEl);

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'th',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            editable: true,
            eventStartEditable: true,
            eventDurationEditable: false,

            dateClick: function (info) {
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("DateSelected", [info.dateStr]);
            },

            eventDrop: function (info) {
                const newDate = info.event.startStr;
                const id = info.event.id;
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventMoved", [id, newDate]);
            },

            eventDidMount: function (info) {
                if (window.EventHandlers?.attachClickEvents) {
                    window.EventHandlers.attachClickEvents(info);
                }
            }
        });

        calendar.render();
    }

    function loadEvents(jsonText) {
        const events = JSON.parse(jsonText);
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }

    // expose to AL ↔ JS
    window.LoadEvents = loadEvents;

    return {
        init,
        loadEvents
    };
})();
