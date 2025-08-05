let calendar;
let eventListEl;
let detailPanel, eventDetailTab, routingTab, tabContentDetail, tabContentRouting;
let allEvents = [];
let loadedComponentsFor = "";
let SelectedProdOrderNo = "";
let lastClickTime = 0;
let clickTimer = null;

window.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("controlAddIn");

  // Initialize UI
  initializeDetailPanel(container);
  initializeThemeSwitcher(container);
  const themeSwitcher = container.querySelector(".theme-buttons");
  initializeFilterContainer(themeSwitcher);
  createShowMoreByDateControl(themeSwitcher);

  const calendarEl = document.createElement("div");
  calendarEl.id = "calendar";
  calendarEl.style.flexGrow = "1";

  container.style.display = "flex";
  container.appendChild(calendarEl);

  // Load fonts + themes
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";
  document.head.appendChild(fontLink);

  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = "src/Resources/calendar-themes.css";
  document.head.appendChild(themeLink);

  // ⬇️ สร้าง Calendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 650,
    selectable: true,
    editable: true, // ✅ เปิด global เพื่อให้ใช้ eventStartEditable ได้
    eventStartEditable: function (event) {
      return !event.id.startsWith("routing-") && !event.id.startsWith("comp-");
    },
    eventDurationEditable: false, // ❌ ไม่ให้ resize

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    eventDidMount: function (info) {
      info.el.setAttribute("id", info.event.id);

      // 🔒 Cursor บอกผู้ใช้ว่าลากไม่ได้
      if (info.event.id.startsWith("routing-") || info.event.id.startsWith("comp-")) {
        info.el.style.cursor = "not-allowed";
      } else {
        info.el.style.cursor = "grab";
      }

      info.el.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        openDatePrompt(info.event);
      });
    },

    dayMaxEvents: 3,

    select: function (info) {
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("DateSelected", [
        info.startStr,
        info.endStr,
      ]);
    },

    eventClick: function (info) {
      const event = info.event;
      const eventId = event.id;
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventClicked", [eventId]);
      showEventDetails(event);
    },

    eventDrop: function (info) {
      const event = info.event;
      const newDate = event.startStr;

      // 🔁 ป้องกันหลุดจาก eventStartEditable
      if (event.id.startsWith("routing-") || event.id.startsWith("comp-")) {
        info.revert();
        return;
      }

      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventMoved", [
        event.id,
        newDate,
      ]);
    },

    events: [],
  });

  calendar.render();

  setTheme("default");
  calendar.render();

  calendar.on('datesSet', autoClickMoreLinks);
});

// ✅ โหลด event ใหม่ (ล้างก่อน)
function LoadEvents(jsonText) {
  const events = JSON.parse(jsonText);
  // 🔎 ตรวจสอบ ID ทั้งหมด
  events.forEach(ev => console.log("Loaded Event ID:", ev.id));
  
  allEvents = events;
  calendar.removeAllEvents();
  calendar.addEventSource(events);
  autoClickMoreLinks();
}
Microsoft.Dynamics.NAV.RegisterAddInMethod("LoadEvents", LoadEvents);

// ✅ เพิ่ม Routing Events (ไม่ลบทั้งหมด)
function AddRoutingEvents(jsonText) {
  const events = JSON.parse(jsonText);

  calendar.getEvents().forEach((event) => {
    if (event.id.startsWith("routing-")) event.remove();
  });

  events.forEach((event) => {
    calendar.addEvent(event);
  });
}

// ✅ เปิด popup ให้ใส่วันใหม่
function openDatePrompt(event) {
  const currentDateStr = event.startStr;
  const newDate = prompt("กรุณาใส่วันที่ใหม่ (yyyy-mm-dd):", currentDateStr);
  if (newDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      event.setStart(newDate);
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventMoved", [
        event.id,
        newDate
      ]);
    } else {
      alert("รูปแบบวันที่ไม่ถูกต้อง กรุณาใส่แบบ yyyy-mm-dd");
    }
  }
}

// ✅ เปิดป๊อปอัป "+more" อัตโนมัติ
function autoClickMoreLinks() {
  setTimeout(() => {
    const moreLinks = document.querySelectorAll('.fc-more');
    moreLinks.forEach(link => link.click());
  }, 200);
}
