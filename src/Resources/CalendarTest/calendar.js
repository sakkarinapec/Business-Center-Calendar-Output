let calendar;
let eventListEl;
let detailPanel, eventDetailTab, routingTab, tabContentDetail, tabContentRouting;
let allEvents = [];
let loadedComponentsFor = "";
let SelectedProdOrderNo = ""; // เพิ่มตัวแปรนี้ไว้ระดับบนสุด
let lastClickTime = 0;
let clickTimer = null;

window.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("controlAddIn");

  // สร้างแผงด้านซ้าย (ซ่อนไว้ก่อน)
  detailPanel = document.createElement("div");
  detailPanel.id = "eventDetailPanel";
  detailPanel.style.width = "320px";
  detailPanel.style.maxWidth = "350px";
  detailPanel.style.padding = "10px";
  detailPanel.style.borderRight = "1px solid #ccc";
  detailPanel.style.height = "100%";
  detailPanel.style.backgroundColor = "#f9f9f9";
  detailPanel.style.fontFamily = "'Inter', sans-serif";
  detailPanel.style.position = "absolute";
  detailPanel.style.left = "-340px"; //อันนี้คือเริ่มซ้อน ตอนกด ✖ จะมีฟังชันซ่อนอีกอัน
  detailPanel.style.top = "0";
  detailPanel.style.transition = "left 0.3s ease";
  detailPanel.style.zIndex = "1000";
  detailPanel.innerHTML = `
  <style>
    .tab-container {
      display: inline-flex;
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 8px 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      margin: 0 6px;
      padding: 6px 12px;
      font-size: 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      color: #333;
    }

    .tab-btn.active {
      background-color: #aec9f3ff;
      color: white;
    }

    .tab-btn:hover:not(.active) {
      background-color: #e2e6ea;
    }
  </style>

  <div style="display: flex; justify-content: space-between; align-items: center;">
    <strong>📌 รายละเอียด</strong>
    <button id="closePanel" style="border: none; background: none; font-size: 18px;">✖</button>
  </div>

  <div class="tab-container" id="tabBox">
    <button id="tabDetail" class="tab-btn active">📄 รายละเอียด</button>
    <button id="tabRouting" class="tab-btn">🧪</button>
    <button id="tabComponents" class="tab-btn">📦</button>
  </div>

  <div id="tabContentDetail" style="margin-top: 10px;"></div>
  <div id="tabContentRouting" style="margin-top: 10px; display: none;"></div>
  <div id="tabContentComponents" style="margin-top: 10px; display: none;"></div>
`;
  container.appendChild(detailPanel);

  // หลังจากสร้าง panel แล้ว ใส่ listener ปุ่มปิด panel
  document.getElementById("closePanel").addEventListener("click", hideDetailPanel);

  // ดึง element ที่เพิ่งสร้างขึ้นมา
  eventDetailTab = document.getElementById("tabDetail");
  routingTab = document.getElementById("tabRouting");
  tabContentDetail = document.getElementById("tabContentDetail");
  tabContentRouting = document.getElementById("tabContentRouting");

  // ใส่ listener ให้ปุ่ม tab
  eventDetailTab.addEventListener("click", () => {
    eventDetailTab.classList.add("active");
    routingTab.classList.remove("active");
    tabContentDetail.style.display = "block";
    tabContentRouting.style.display = "none";
  });

  routingTab.addEventListener("click", () => {
    routingTab.classList.add("active");
    eventDetailTab.classList.remove("active");
    tabContentDetail.style.display = "none";
    tabContentRouting.style.display = "block";
  });
const tabs = [
  { id: "tabDetail", icon: "📄", label: "รายละเอียด" },
  { id: "tabRouting", icon: "🧪", label: "Routing" },
  { id: "tabComponents", icon: "📦", label: "Components" }
];

function setActiveTab(selectedId) {
  tabs.forEach(tab => {
    const btn = document.getElementById(tab.id);
    const content = document.getElementById("tabContent" + tab.id.replace("tab", ""));
    if (tab.id === selectedId) {
      btn.classList.add("active");
      btn.textContent = `${tab.icon} ${tab.label}`;
      content.style.display = "block";
    } else {
      btn.classList.remove("active");
      btn.textContent = `${tab.icon}`;
      content.style.display = "none";
    }
  });
}

tabs.forEach(tab => {
  const btn = document.getElementById(tab.id);
  btn.addEventListener("click", () => {
    setActiveTab(tab.id);
  });
});

  const componentsTab = document.getElementById("tabComponents");

// listener สำหรับ tabComponents
componentsTab.addEventListener("click", () => {
  setActiveTab("tabComponents");
  LoadComponentEvents(SelectedProdOrderNo);
});
  // สร้าง div สำหรับปฏิทิน (ด้านขวา)
  const calendarEl = document.createElement("div");
  calendarEl.id = "calendar";
  calendarEl.style.flexGrow = "1";

  // เตรียม container ให้อยู่ในรูปแบบ flex แบ่งซ้ายขวา
  container.style.display = "flex";
  container.appendChild(calendarEl);

  // โหลด font
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";
  document.head.appendChild(fontLink);

  // โหลดธีมรวมไว้ไฟล์เดียว
  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = "src/Resources/calendar-themes.css";
  document.head.appendChild(themeLink);

  // สร้างปุ่มเปลี่ยนธีม
  const themeSwitcher = document.createElement("div");
  themeSwitcher.classList.add("theme-buttons");
  themeSwitcher.style.position = "absolute";
  themeSwitcher.style.top = "5px";
  themeSwitcher.style.right = "5px";
  themeSwitcher.style.zIndex = "999";

  const btnDefault = document.createElement("button");
  btnDefault.textContent = "🧾 Default";
  btnDefault.classList.add("default-btn");
  btnDefault.addEventListener("click", () => SwitchTheme("default"));

  const btnHalloween = document.createElement("button");
  btnHalloween.textContent = "🎃 Halloween";
  btnHalloween.classList.add("halloween-btn");
  btnHalloween.addEventListener("click", () => SwitchTheme("halloween"));

  const btnLove = document.createElement("button");
  btnLove.textContent = "💕 Love";
  btnLove.classList.add("love-btn");
  btnLove.addEventListener("click", () => SwitchTheme("love"));

  themeSwitcher.appendChild(btnDefault);
  themeSwitcher.appendChild(btnHalloween);
  themeSwitcher.appendChild(btnLove);
  container.prepend(themeSwitcher);

  // ปุ่มสลับภาษา
  const langToggleBtn = document.createElement("button");
  langToggleBtn.textContent = "🌐 ภาษาไทย";
  langToggleBtn.classList.add("lang-toggle");
  langToggleBtn.dataset.lang = "en"; // เริ่มต้นเป็นภาษาไทย
  langToggleBtn.addEventListener("click", () => {
    const currentLang = langToggleBtn.dataset.lang;
    const newLang = currentLang === "th" ? "en" : "th";
    langToggleBtn.dataset.lang = newLang;
    langToggleBtn.textContent = newLang === "en" ? "🌐 ภาษาไทย" : "🌐 English";

    calendar.setOption("locale", newLang);
  });
  themeSwitcher.appendChild(langToggleBtn);
  const filterContainer = document.createElement("div");
filterContainer.style.marginTop = "10px";
filterContainer.style.display = "flex";
filterContainer.style.gap = "10px";
filterContainer.style.borderRadius = "16px";
filterContainer.style.height = "100%";
const filterSelect = document.createElement("select");
filterSelect.innerHTML = `
  <option value="production" selected>🏭 ผลิต</option>
  <option value="routing">🧪 Routing</option>
  <option value="component">🔩 Component</option>
  <option value="">🔎 ทั้งหมด</option>
`;
filterSelect.addEventListener("change", () => {
  const filterValue = filterSelect.value;
  applyFilter(filterValue);

  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("FilterChanged", [filterValue]);
});

// 🎨 สไตล์ให้ dropdown ดูสวย
filterSelect.style.borderRadius = "16px";
filterSelect.style.padding = "8px 12px";
filterSelect.style.fontSize = "14px";
filterSelect.style.border = "1px solid #ccc";
filterSelect.style.backgroundColor = "#f9f9f9";
filterSelect.style.cursor = "pointer";
filterSelect.style.outline = "none";
filterSelect.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
filterSelect.style.color = "#333";

// สร้าง div สำหรับ search input และ icon
const searchWrapper = document.createElement("div");
searchWrapper.style.position = "relative";
searchWrapper.style.width = "30px";  // เริ่มต้นแคบ
searchWrapper.style.height = "28px";
searchWrapper.style.transition = "width 0.3s ease";
searchWrapper.style.overflow = "hidden";

// สร้าง input สำหรับค้นหา
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.style.width = "100%";
searchInput.style.height = "28px";
searchInput.style.border = "1px solid #ccc";
searchInput.style.borderRadius = "4px";
searchInput.style.padding = "4px 28px 4px 8px"; // เผื่อไว้ให้ icon อยู่ขวา
searchInput.style.fontSize = "14px";
searchInput.style.transition = "width 0.3s ease";
searchInput.style.outline = "none";

// สร้าง icon แว่นขยาย
const searchIcon = document.createElement("span");
searchIcon.textContent = "🔍";
searchIcon.style.position = "absolute";
searchIcon.style.right = "6px";
searchIcon.style.top = "50%";
searchIcon.style.transform = "translateY(-50%)";
searchIcon.style.pointerEvents = "none"; // ไม่ให้ icon บัง input

// ใส่ input กับ icon ลงใน wrapper
searchWrapper.appendChild(searchInput);
searchWrapper.appendChild(searchIcon);

// เพิ่ม listener ให้ขยายตอน focus และ hover ที่ wrapper
searchInput.addEventListener("focus", () => {
  searchWrapper.style.width = "180px";
  searchInput.placeholder = "ค้นหา...";
});
searchInput.addEventListener("blur", () => {
  if (!searchInput.value) {
    searchWrapper.style.width = "30px";
    searchInput.placeholder = "";  // ซ่อน placeholder เมื่อไม่มีข้อความ
  }
});
searchWrapper.addEventListener("mouseenter", () => {
  searchWrapper.style.width = "180px";
  if (!searchInput.value) {
    searchInput.placeholder = "ค้นหา...";
  }
});
searchWrapper.addEventListener("mouseleave", () => {
  if (document.activeElement !== searchInput && !searchInput.value) {
    searchWrapper.style.width = "30px";
    searchInput.placeholder = "";
  }
});
// ฟังก์ชันกรอง events ตามคำค้น
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();

  // กรอง allEvents ตาม keyword ใน title, description, id หรืออื่นๆ ตามต้องการ
  const filtered = allEvents.filter(ev => {
    const title = (ev.title || "").toLowerCase();
    const desc = (ev.extendedProps?.description || "").toLowerCase();
    const id = (ev.id || "").toLowerCase();

    return title.includes(keyword) || desc.includes(keyword) || id.includes(keyword);
  });
//   searchInput.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") {
//     searchInput.blur(); // หรือจะ applyFilter ทันที
//   }
// });
// แทนที่ฟังก์ชันค้นหาเดิมด้วยโค้ดนี้

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) return;

    // กรอง event ที่ตรง keyword
    const filtered = allEvents.filter(ev => {
      const title = (ev.title || "").toLowerCase();
      const desc = (ev.extendedProps?.description || "").toLowerCase();
      const id = (ev.id || "").toLowerCase();

      return title.includes(keyword) || desc.includes(keyword) || id.includes(keyword);
    });

    // กรองตาม filter ด้วย (production/routing/component)
    const filterValue = filterSelect.value;
    const finalFiltered = filtered.filter(ev => {
      if (!filterValue) return true;
      if (filterValue === "routing") return ev.id.startsWith("routing-");
      if (filterValue === "production") return !ev.id.startsWith("routing-") && !ev.id.startsWith("comp-");
      if (filterValue === "component") return ev.id.startsWith("comp-");
      return true;
    });

    if (finalFiltered.length === 0) {
      alert('ไม่พบรายการที่ค้นหา');
      return;
    }

    if (finalFiltered.length === 1) {
      // ถ้ามีผลลัพธ์เดียว ไปยังวันนั้นและไฮไลต์
      goToEventAndHighlight(finalFiltered[0]);
      return;
    }

    // ลบ popup เก่า (ถ้ามี)
    document.querySelectorAll('.custom-popup-modal')?.forEach(m => m.remove());
    
    // แสดง popup ให้เลือก event
    showSearchResultsPopup(finalFiltered, keyword);
  }
});

// ฟังก์ชันแสดง popup ผลการค้นหา
function showSearchResultsPopup(results, searchTerm) {
  const modal = document.createElement("div");
  modal.classList.add("custom-popup-modal");
  modal.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 9999;
    max-height: 500px;
    overflow-y: auto;
    min-width: 400px;
    max-width: 90vw;
    padding: 20px;
    font-family: 'Inter', sans-serif;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
  `;

  const title = document.createElement("h3");
  title.textContent = `พบ ${results.length} รายการ สำหรับ "${searchTerm}"`;
  title.style.cssText = `
    margin: 0;
    color: #333;
    font-size: 18px;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "❌";
  closeBtn.style.cssText = `
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 4px;
  `;
  closeBtn.addEventListener("click", () => modal.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // รายการผลลัพธ์
  const resultsList = document.createElement("div");
  resultsList.style.cssText = `
    max-height: 350px;
    overflow-y: auto;
  `;

  results.forEach((ev, index) => {
    const item = document.createElement("div");
    const start = new Date(ev.start);
    const dateStr = start.toLocaleDateString('th-TH');
    const timeStr = start.toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'});
    
    item.innerHTML = `
      <div style="font-weight: bold; color: #0078D4;">${ev.title}</div>
      <div style="font-size: 14px; color: #666; margin-top: 4px;">
        📅 ${dateStr} ${timeStr}
      </div>
      ${ev.extendedProps?.description ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${ev.extendedProps.description}</div>` : ''}
    `;
    
    item.style.cssText = `
      cursor: pointer;
      padding: 12px 16px;
      margin: 4px 0;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: #fafafa;
    `;

    item.addEventListener("mouseover", () => {
      item.style.backgroundColor = "#e3f2fd";
      item.style.borderColor = "#2196f3";
      item.style.transform = "translateY(-1px)";
    });
    
    item.addEventListener("mouseout", () => {
      item.style.backgroundColor = "#fafafa";
      item.style.borderColor = "#e9ecef";
      item.style.transform = "translateY(0)";
    });

    item.addEventListener("click", () => {
      modal.remove();
      goToEventAndHighlight(ev);
    });

    resultsList.appendChild(item);
  });

  modal.appendChild(resultsList);
  document.body.appendChild(modal);

  // ปิด modal เมื่อคลิกข้างนอก
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ฟังก์ชันไปยัง event และไฮไลต์
function goToEventAndHighlight(targetEvent) {
  // ไปยังวันที่มี event นั้น
  calendar.gotoDate(targetEvent.start);
  
  setTimeout(() => {
    // หาและไฮไลต์ event หรือแสดงรายละเอียด
    highlightEventInCalendar(targetEvent);
    
    // แสดงรายละเอียด event โดยอัตโนมัติ
    showEventDetails(targetEvent);
  }, 500);
}

// ฟังก์ชันไฮไลต์ event ในปฏิทิน
function highlightEventInCalendar(targetEvent) {
  // ลองหา element ของ event
  let eventElement = document.querySelector(`[data-event-id="${targetEvent.id}"]`) || 
                    document.getElementById(targetEvent.id);
  
  if (!eventElement) {
    // ถ้าไม่เจอ element (อาจจะอยู่ใน +more) ให้ค้นหาจากทุก event elements
    const allEventElements = document.querySelectorAll('.fc-event');
    for (let el of allEventElements) {
      const fcEvent = calendar.getEventById(targetEvent.id);
      if (fcEvent && el.textContent.includes(fcEvent.title)) {
        eventElement = el;
        break;
      }
    }
  }
  
  if (!eventElement) {
    // ถ้ายังไม่เจอ ให้ไฮไลต์วันที่มี event นั้น
    const targetDate = new Date(targetEvent.start);
    const dayElements = document.querySelectorAll('.fc-daygrid-day');
    
    dayElements.forEach(dayEl => {
      const dayDate = dayEl.getAttribute('data-date');
      if (dayDate === targetEvent.start.split('T')[0]) {
        highlightElement(dayEl, "วันที่มี event ที่คุณค้นหา");
        
        // ถ้าวันนั้นมี +more ให้คลิกเพื่อแสดง popup
        const moreLink = dayEl.querySelector('.fc-daygrid-more-link');
        if (moreLink) {
          setTimeout(() => {
            moreLink.click();
          }, 1000);
        }
        return;
      }
    });
  } else {
    // ถ้าเจอ element ของ event ให้ไฮไลต์
    highlightElement(eventElement, "นี่คือ event ที่คุณค้นหา");
  }
}

// ฟังก์ชันไฮไลต์ element
function highlightElement(element, message) {
  // เพิ่ม rainbow glow effect
  element.classList.add("rainbow-glow");
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  // แสดงข้อความแจ้งเตือน
  const note = document.createElement("div");
  note.textContent = `👉 ${message}`;
  note.classList.add("highlighted-event-note");

  const rect = element.getBoundingClientRect();
  note.style.position = "fixed";
  note.style.top = `${rect.top - 40}px`;
  note.style.left = `${rect.left}px`;
  note.style.background = "#fff8c6";
  note.style.padding = "6px 12px";
  note.style.border = "2px solid #ffd700";
  note.style.borderRadius = "8px";
  note.style.fontSize = "14px";
  note.style.fontWeight = "bold";
  note.style.zIndex = "10001";
  note.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  document.body.appendChild(note);

  // ลบ effect หลัง 5 วินาที
  setTimeout(() => {
    element.classList.remove("rainbow-glow");
    note.remove();
  }, 5000);
}

// เพิ่ม CSS สำหรับ rainbow glow effect (ถ้ายังไม่มี)
if (!document.querySelector('#rainbow-glow-style')) {
  const glowStyle = document.createElement("style");
  glowStyle.id = "rainbow-glow-style";
  glowStyle.innerHTML = `
    .rainbow-glow {
      animation: rainbow-glow 2s linear infinite;
      position: relative;
      z-index: 1000;
    }
    
    @keyframes rainbow-glow {
      0% {
        box-shadow:
          0 0 5px red,
          0 0 10px orange,
          0 0 15px yellow,
          0 0 20px green,
          0 0 25px blue,
          0 0 30px indigo,
          0 0 35px violet;
      }
      50% {
        box-shadow:
          0 0 10px violet,
          0 0 15px indigo,
          0 0 20px blue,
          0 0 25px green,
          0 0 30px yellow,
          0 0 35px orange,
          0 0 40px red;
      }
      100% {
        box-shadow:
          0 0 5px red,
          0 0 10px orange,
          0 0 15px yellow,
          0 0 20px green,
          0 0 25px blue,
          0 0 30px indigo,
          0 0 35px violet;
      }
    }
    
    .highlighted-event-note {
      animation: fadeinout 5s ease forwards;
    }
    
    @keyframes fadeinout {
      0% { opacity: 0; transform: translateY(10px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(glowStyle);
}
  // รวมกับ filterSelect กรองตามประเภทด้วย (ถ้ามี)
  const filterValue = filterSelect.value;
  const finalFiltered = filtered.filter(ev => {
    if (!filterValue) return true;
    if (filterValue === "routing") return ev.id.startsWith("routing-");
    if (filterValue === "production") return !ev.id.startsWith("routing-");
    return true;
  });

  calendar.removeAllEvents();
  calendar.addEventSource(finalFiltered);
});

// สร้างปุ่มรีเซ็ตฟิลด์ค้นหา
const searchResetBtn = document.createElement("button");
// searchResetBtn.textContent = "✖";
searchResetBtn.textContent = "❌";
searchResetBtn.title = "ล้างการค้นหา";
searchResetBtn.style.marginLeft = "4px";
searchResetBtn.style.cursor = "pointer";
searchResetBtn.style.border = "none";
// searchResetBtn.style.background = "transparent"; //ใส
searchResetBtn.style.background = "#f4f5f5ff"; 
searchResetBtn.style.fontSize = "16px";
searchResetBtn.style.color = "#888";

searchResetBtn.addEventListener("click", () => {
  searchInput.value = "";
  applyFilter(filterSelect.value); // เรียกกรองใหม่ตาม select
  searchInput.blur();
  searchWrapper.style.width = "30px";
});

// เพิ่ม element ลงใน container
filterContainer.appendChild(filterSelect);
filterContainer.appendChild(searchWrapper);
filterContainer.appendChild(searchResetBtn);

// themeSwitcher.appendChild(filterContainer);

const resetButton = document.createElement("button");
resetButton.textContent = "🔄 เคลียร์";
// สไตล์ให้ดูสวยแบบกลมๆ สีฟ้า
resetButton.style.borderRadius = "16px";
resetButton.style.padding = "8px 16px";
resetButton.style.backgroundColor = "#0078D4"; // สีฟ้า Office-style
resetButton.style.color = "white";
resetButton.style.border = "none";
resetButton.style.cursor = "pointer";
resetButton.style.fontSize = "14px";
resetButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
resetButton.style.transition = "background-color 0.3s";

// เพิ่ม effect เวลา hover
resetButton.addEventListener("mouseover", () => {
  resetButton.style.backgroundColor = "#005A9E"; // สีฟ้าเข้ม
});
resetButton.addEventListener("mouseout", () => {
  resetButton.style.backgroundColor = "#0078D4"; // กลับมาเดิม
});
resetButton.addEventListener("click", () => {
  filterSelect.value = "";
  applyFilter("");
});

// filterContainer.appendChild(filterSelect);
filterContainer.appendChild(resetButton);

// ✅ ตอนนี้ themeSwitcher มีตัวตนแล้ว จึงสามารถเพิ่ม filterContainer เข้าไปได้
themeSwitcher.appendChild(filterContainer);

  // สร้าง Calendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 650,
    selectable: true,
    editable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    eventDidMount: function(info) {
    // เพิ่ม listener คลิกขวา
    info.el.setAttribute("id", info.event.id);
    info.el.addEventListener('contextmenu', function(ev) {
      ev.preventDefault(); // ป้องกันเมนูบราวเซอร์
      openDatePrompt(info.event);
    });
  },
    dayMaxEvents: 3, // แสดง +n more เมื่อเกิน 4 event ต่อวัน
    select: function (info) {
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("DateSelected", [
        info.startStr,
        info.endStr,
      ]);
    },
    eventClick: function (info) {
  const event = info.event;
  const eventId = event.id; // รูปแบบ: "ProdOrderNo|LineNo" เช่น "101008|1002"
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventClicked", [eventId]);

  showEventDetails(event);
},
    eventDrop: function (info) {
      const event = info.event;
      const newDate = event.startStr;
      const lineNo = event.id;
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventMoved", [
        lineNo,
        newDate,
      ]);
    },
    events: [],
  });

  calendar.render();

  // โหลดธีม default ตอนเริ่ม
  setTheme("default");
});

// โหลด event เข้า calendar (เคลียร์ของเก่าแล้วเพิ่มใหม่)
function LoadEvents(jsonText) {
  const events = JSON.parse(jsonText);
  allEvents = events; // ⭐️ เก็บข้อมูลต้นฉบับ
  calendar.removeAllEvents();
  calendar.addEventSource(events);
}Microsoft.Dynamics.NAV.RegisterAddInMethod("LoadEvents", LoadEvents);

// เพิ่ม Routing Events เข้าไปโดยไม่ลบ event เดิม
function AddRoutingEvents(jsonText) {
  const events = JSON.parse(jsonText);

  // ลบ Routing event เดิมก่อน (ถ้ามี)
  calendar.getEvents().forEach((event) => {
    if (event.id.startsWith("routing-")) event.remove();
  });

  // เพิ่ม Routing Events ใหม่
  events.forEach((event) => {
    calendar.addEvent(event);
  });
}

// แสดงข้อมูล event ใน tab รายละเอียด
function showEventDetails(event) {
  SelectedProdOrderNo = event.id.split("|")[0]; // ปรับตามรูปแบบ id จริง
  const title = event.title || "(ไม่มีชื่อ)";
  const start = event.start
    ? event.start.toLocaleDateString("th-TH")
    : "(ไม่มีวันที่)";
  const id = event.id || "";
  const desc = event.extendedProps.description || "";
  const quantity = event.extendedProps.quantity || "(ไม่มีจำนวน)";
  const startDT = event.extendedProps.startingDateTime || "(ไม่มีเวลาเริ่ม)";
  const endDT = event.extendedProps.endingDateTime || "(ไม่มีเวลาสิ้นสุด)";
  const other = event.extendedProps.other || "(ไม่มีข้อมูลอื่น)";

  tabContentDetail.innerHTML = `
    <b>${title}</b><br/>
    <b>ID:</b> ${id}<br/>
    <b>วันที่เริ่ม:</b> ${start}<br/>
    <b>จำนวน:</b> ${quantity}<br/>
    <b>เวลาเริ่มต้น:</b> ${startDT}<br/>
    <b>เวลาสิ้นสุด:</b> ${endDT}<br/>
    <b>อื่น ๆ :</b> ${other}<br/>
    <p>${desc}</p>
    <button onclick="viewProdOrder('${id}')" style="margin-top:5px;">🔍</button>
  `;
// ตัวอย่าง: เปิดแท็บ "รายละเอียด" (📄 รายละเอียด) ก่อน
  // eventDetailTab.classList.add("active");
  // routingTab.classList.remove("active");
  // tabContentDetail.style.display = "block";
  // tabContentRouting.style.display = "none";
  // เปิดแท็บ Routing ก่อน
  // routingTab.classList.add("active");
  // eventDetailTab.classList.remove("active");
  // tabContentDetail.style.display = "none";
  // tabContentRouting.style.display = "block";
  showDetailPanel();
  LoadComponentEvents(SelectedProdOrderNo);
    // ✅ Scroll ไปให้เห็นแผง detailPanel
  const panel = document.getElementById("eventDetailPanel");
  if (panel) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("LoadRoutingDetails", []);
}
function viewProdOrder(id) {
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewProdOrder", [id]);
}
function viewComponents(prodOrderNo) {
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewComponents", [prodOrderNo]);
}
// แสดงแผงด้านซ้ายแบบสมูท
function showDetailPanel() {
  detailPanel.style.left = "0";
}

// ซ่อนแผงด้านซ้าย
function hideDetailPanel() {
  detailPanel.style.left = "-340px";
}

// เปลี่ยนธีมด้วยการเพิ่ม class
function setTheme(themeName) {
  const el = document.getElementById("controlAddIn");
  el.classList.remove("theme-default", "theme-halloween", "theme-love");
  el.classList.add(`theme-${themeName}`);
}

// ให้ AL เรียกใช้
function SwitchTheme(themeName) {
  setTheme(themeName);
  // แสดงรูปแยกตามธีมที่เลือก (ถ้ามี)
  if (themeName === "love") {
    // ShowImageToast("https://cdn-icons-png.flaticon.com/512/833/833472.png"); // ตัวอย่างรูปหัวใจ
    ShowImageToast("https://i.imgur.com/tMFMSA8.gif");
  } else if (themeName === "halloween") {
    // ShowImageToast("https://cdn-icons-png.flaticon.com/512/616/616408.png"); // ตัวอย่างรูปฟักทอง
    ShowImageToast("https://i.pinimg.com/originals/17/a9/00/17a900d73f0a8091413037a6f8ffb5f1.gif");
  } else if (themeName === "default") {
    // ShowImageToast("https://cdn-icons-png.flaticon.com/512/190/190411.png"); // ตัวอย่างรูป default
    ShowImageToast("https://i.redd.it/i3h64r89k0bb1.gif");
  }
}

// ฟังก์ชันแสดงรูปแบบ Toast 3 วิ
function ShowImageToast(imageUrl) {
  const imgToast = document.createElement("div");
  imgToast.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); /* แบล็กโปร่งแสง */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeInOutImage 3s ease-out forwards;
  `;

  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.borderRadius = "12px";
  img.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";

  imgToast.appendChild(img);
  document.body.appendChild(imgToast);

  setTimeout(() => {
    imgToast.remove();
  }, 3000);
}


// ให้ AL เรียกใช้เพื่อส่งข้อมูล Routing กลับมาแสดง
function SetRoutingText(eventsJson, filterProdOrderNo) {
  const events = JSON.parse(eventsJson);

  if (!tabContentRouting) return;

  // กรอง event ที่ prodOrderNo ตรงกับ filterProdOrderNo (หรือถ้าไม่ส่งมาก็แสดงทั้งหมด)
  const filteredEvents = filterProdOrderNo
    ? events.filter(ev => ev.prodOrderNo === filterProdOrderNo)
    : events;

  if (filteredEvents.length === 0) {
    tabContentRouting.innerHTML = '<p>(ไม่มีรายการ Routing)</p>';
  } else {
    let html = '<ul style="padding-left: 20px;">';
    filteredEvents.forEach(ev => {
      // html += `<li><b>${ev.title}</b><br/><small>${ev.description || ''}</small></li>`;
      html += `<li>
      ${ev.title}<br/>
      <small>${ev.description || ''}</small><br/>
      <button onclick="viewRouting('${ev.prodOrderNo}')" style="margin-top:5px;">🔍</button>
    </li>`;
    });
    html += '</ul>';

    tabContentRouting.innerHTML = html;
  }
  // eventDetailTab.classList.add("active");
  // routingTab.classList.remove("active");
  // tabContentDetail.style.display = "block";
  // tabContentRouting.style.display = "none";
  // routingTab.classList.add("active");
  // eventDetailTab.classList.remove("active");
  // tabContentDetail.style.display = "none";
  // tabContentRouting.style.display = "block";

  showDetailPanel();
}
Microsoft.Dynamics.NAV.RegisterAddInMethod("SetRoutingText", SetRoutingText);

function viewRouting(prodOrderNo) {
   Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewRouting", [prodOrderNo]);
}

function ShowUndoSuccessToast(message) {
    // ✅ Toast แบบง่าย
    const toast = document.createElement("div");
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        font-size: 14px;
        z-index: 9999;
        animation: fadeInOut 3s ease-out forwards;
    `;
    document.body.appendChild(toast);

    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    audio.play();

    // 🔁 ลบออกหลัง 3 วินาที
    setTimeout(() => toast.remove(), 3000);
}

// 📦 animation (ใส่ใน CSS หรือ JS ก็ได้)
// const style = document.createElement("style");
// style.innerHTML = `
// @keyframes fadeInOut {
//     0% { opacity: 0; transform: translateY(20px); }
//     10% { opacity: 1; transform: translateY(0); }
//     90% { opacity: 1; }
//     100% { opacity: 0; transform: translateY(-10px); }
// }`;
// document.head.appendChild(style);

// ตัวอย่าง animation keyframes (ถ้ายังไม่มี)
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInOutImage {
  0% { opacity: 0; transform: scale(0.8); }
  10% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: scale(0.8); }
}
`;
document.head.appendChild(style);

function applyFilter(filterType) {
  const filteredEvents = allEvents.filter(ev => {
    if (!filterType) return true; // แสดงทั้งหมด
    if (filterType === "routing") return ev.id.startsWith("routing-");
    if (filterType === "production") return !ev.id.startsWith("routing-");
    if (filterType === "component") return ev.id.startsWith("comp-");
    return true;
  });

  calendar.removeAllEvents();
  calendar.addEventSource(filteredEvents);
}

function SetComponentText(jsonText) {
  const tabContentComponents = document.getElementById("tabContentComponents");

  let components = [];
  try {
    components = JSON.parse(jsonText);
  } catch (e) {
    console.error("❌ JSON แปลงไม่ได้:", e);
    tabContentComponents.innerHTML = `<p style="color:red;">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล Component</p>`;
    return;
  }

  if (!components || components.length === 0) {
    tabContentComponents.innerHTML = `<p>🔍 ไม่พบ Component สำหรับรายการนี้</p>`;
    return;
  }

  // สร้างรายการ Components พร้อมปุ่มเปิดหน้า Component Page
  let html = '<ul>';
  components.forEach(comp => {
    // comp ต้องมี prodOrderNo (หรือ ProdOrderNo) เพื่อใช้ในปุ่ม
    const prodOrderNo = comp.prodOrderNo || comp.ProdOrderNo || ""; 

    if (prodOrderNo) {
  html += `<li>
    <strong>${comp.ItemNo}</strong>: ${comp.Description} (Qty: ${comp.QuantityPer})
    <br/><strong>Due Date : ${comp.DueDate}</strong><br/>
    <button onclick="viewComponents('${prodOrderNo}')" style="margin-top:5px;">🔍</button>
  </li>`;
} else {
  html += `<li>
    <strong>${comp.ItemNo}</strong>: ${comp.Description} (Qty: ${comp.QuantityPer})
    <br/><small style="color:red;">⚠️ ไม่มีเลข ProdOrderNo</small>
  </li>`;
}
  });
  html += '</ul>';

  tabContentComponents.innerHTML = html;
}

componentsTab.addEventListener("click", () => {
  setActiveTab("tabComponents");
  LoadComponentEvents(SelectedProdOrderNo); // <- ตรงนี้ต้องไปเรียก AL: LoadProdOrderComponents
});

function LoadComponentEvents(prodOrderNo) {
  // if (window.parent && window.parent.LoadProdOrderComponents)
  if (prodOrderNo && Microsoft && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
    // window.parent.LoadProdOrderComponents(prodOrderNo);
   Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("LoadProdOrderComponents", [prodOrderNo]);
  }
}
function openDatePrompt(event) {
  // ใช้ prompt ง่าย ๆ แค่ขอวันที่ในรูปแบบ yyyy-mm-dd
  const currentDateStr = event.startStr; // เช่น "2025-07-18"
  const newDate = prompt("กรุณาใส่วันที่ใหม่ (yyyy-mm-dd):", currentDateStr);
  if (newDate) {
    // ตรวจสอบรูปแบบเบื้องต้น (ถ้าต้องการ)
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      // อัปเดต event ในปฏิทิน
      event.setStart(newDate);
      
      // ส่งข้อมูลไป AL (เหมือน eventDrop)
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("EventMoved", [
        event.id,
        newDate
      ]);
    } else {
      alert("รูปแบบวันที่ไม่ถูกต้อง กรุณาใส่แบบ yyyy-mm-dd");
    }
  }
}
