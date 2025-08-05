// event-highlight.js - Event highlighting and search functionality

// ฟังก์ชันไปยัง event และไฮไลต์
function goToEventAndHighlight(targetEvent) {
  const eventDate = targetEvent.start.split("T")[0]; // yyyy-mm-dd

  // 👉 ใส่วันที่ในช่อง input date (จากระบบ show more)
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.value = eventDate;
    dateInput.dispatchEvent(new Event("change"));
  }
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

// เพิ่ม CSS สำหรับ rainbow glow effect (ถ้ายังไม่มี)
function initializeHighlightStyles() {
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
}

// Initialize highlight styles when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHighlightStyles);
} else {
  initializeHighlightStyles();
}

