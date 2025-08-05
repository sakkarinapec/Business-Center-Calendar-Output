// event-highlight.js - Event highlighting and search functionality (แก้ไขแล้ว)

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

// ฟังก์ชันไฮไลต์ event ในปฏิทิน (แก้ไขแล้ว)
function highlightEventInCalendar(targetEvent) {
  // ลองหา element ของ event ในปฏิทินก่อน
  let eventElement = findEventElement(targetEvent);
  
  if (eventElement) {
    // ถ้าเจอ event element ให้ไฮไลต์เลย
    highlightElement(eventElement, "นี่คือ event ที่คุณค้นหา");
    return;
  }
  
  // ถ้าไม่เจอ element แสดงว่าอาจอยู่ใน +more popup
  // ให้หาวันที่มี event นั้นและเปิด +more
  const targetDateStr = targetEvent.start.split('T')[0]; // เช่น "2025-07-18"
  
  // ลองหา +more link ด้วย selector หลายแบบ
  const possibleMoreSelectors = [
    '.fc-daygrid-more-link',
    '.fc-more-link', 
    '.fc-more',
    'a[class*="more"]',
    '[class*="fc-more"]'
  ];
  
  let foundDay = false;
  let moreLink = null;
  
  // หาวันที่ตรงกับ target date
  const dayElements = document.querySelectorAll('.fc-daygrid-day, [data-date]');
  
  for (let dayEl of dayElements) {
    const dayDate = dayEl.getAttribute('data-date');
    if (dayDate === targetDateStr) {
      foundDay = true;
      console.log('Found target day:', dayDate, dayEl);
      
      // ลองหา +more link ด้วยหลาย selector
      for (let selector of possibleMoreSelectors) {
        moreLink = dayEl.querySelector(selector);
        if (moreLink) {
          console.log('Found more link with selector:', selector, moreLink);
          break;
        }
      }
      
      // ถ้าไม่เจอใน day element ให้ลองหาใน parent หรือ sibling
      if (!moreLink) {
        const dayContent = dayEl.querySelector('.fc-daygrid-day-events, .fc-daygrid-day-frame');
        if (dayContent) {
          for (let selector of possibleMoreSelectors) {
            moreLink = dayContent.querySelector(selector);
            if (moreLink) {
              console.log('Found more link in day content:', selector, moreLink);
              break;
            }
          }
        }
      }
      
      break;
    }
  }
  
  if (foundDay && moreLink) {
    console.log('Clicking more link...', moreLink);
    
    // เพิ่ม highlight ให้วันนั้นก่อน
    const dayElement = document.querySelector(`[data-date="${targetDateStr}"]`);
    if (dayElement) {
      dayElement.style.backgroundColor = '#ffffcc';
      dayElement.style.border = '2px solid #ffd700';
    }
    
    // คลิก +more link
    moreLink.click();
    
    // รอให้ popup เปิดแล้วค้นหา event
    setTimeout(() => {
      console.log('Searching in popup...');
      findAndHighlightInPopup(targetEvent);
    }, 500); // เพิ่มเวลารอเป็น 500ms
    
  } else if (foundDay && !moreLink) {
    // ถ้าเจอวันแต่ไม่มี +more link
    const dayElement = document.querySelector(`[data-date="${targetDateStr}"]`);
    if (dayElement) {
      highlightElement(dayElement, "วันที่มี event ที่คุณค้นหา (ไม่มี +more)");
    }
    console.log('Found day but no more link');
    
  } else {
    // ถ้าไม่เจอวันที่เลย
    showNotification("ไม่พบวันที่ของ event ในปฏิทิน", "warning");
    console.log('Day not found:', targetDateStr);
  }
}

// ฟังก์ชันหา event element ในปฏิทิน
function findEventElement(targetEvent) {
  // วิธีที่ 1: หาจาก data-event-id หรือ id
  let eventElement = document.querySelector(`[data-event-id="${targetEvent.id}"]`) || 
                    document.getElementById(targetEvent.id);
  
  if (eventElement) return eventElement;
  
  // วิธีที่ 2: หาจากทุก event elements ที่มี title ตรงกัน
  const allEventElements = document.querySelectorAll('.fc-event');
  for (let el of allEventElements) {
    const fcEvent = calendar.getEventById(targetEvent.id);
    if (fcEvent && el.textContent.includes(fcEvent.title)) {
      return el;
    }
  }
  
  return null;
}

// ฟังก์ชันหาและไฮไลต์ event ใน popup ที่เปิดแล้ว
function findAndHighlightInPopup(targetEvent) {
  console.log('Looking for popups...');
  
  // หา popup ที่เปิดอยู่ - ลองหลาย selector
  const possiblePopupSelectors = [
    '.fc-popover',
    '.fc-more-popover', 
    '.fc-daygrid-popover',
    '[class*="popover"]',
    '[class*="fc-popover"]',
    '.fc-popover-body',
    '.fc-popover-content'
  ];
  
  let popup = null;
  for (let selector of possiblePopupSelectors) {
    popup = document.querySelector(selector);
    if (popup) {
      console.log('Found popup with selector:', selector, popup);
      break;
    }
  }
  
  // ถ้าไม่เจอ popup ให้ลองหาอีกครั้งใน body
  if (!popup) {
    const allElements = document.querySelectorAll('*');
    for (let el of allElements) {
      if (el.className && (
        el.className.includes('popover') || 
        el.className.includes('more') ||
        el.className.includes('fc-')
      ) && el.style.display !== 'none' && el.offsetHeight > 0) {
        console.log('Found potential popup:', el.className, el);
        popup = el;
        break;
      }
    }
  }
  
  if (!popup) {
    console.log('No popup found, searching in main calendar again...');
    // ถ้าไม่เจอ popup ให้ลองหาใน main calendar อีกครั้ง
    setTimeout(() => {
      const eventElement = findEventElement(targetEvent);
      if (eventElement) {
        highlightElement(eventElement, "นี่คือ event ที่คุณค้นหา");
      } else {
        showNotification("เปิด popup แล้วแต่ไม่เจอ event", "warning");
      }
    }, 200);
    return;
  }
  
  // หา event elements ใน popup
  const eventSelectors = [
    '.fc-event',
    '.fc-daygrid-event',
    '.fc-list-event',
    '[class*="event"]'
  ];
  
  let foundInPopup = false;
  
  for (let selector of eventSelectors) {
    const eventElements = popup.querySelectorAll(selector);
    console.log(`Found ${eventElements.length} events with selector ${selector}`);
    
    eventElements.forEach((el, index) => {
      console.log(`Checking event ${index}:`, el.textContent, el);
      
      // ตรวจสอบว่า element นี้คือ event ที่เรากำลังหาหรือไม่
      if (isTargetEventElement(el, targetEvent)) {
        console.log('Found target event in popup!', el);
        foundInPopup = true;
        highlightElement(el, "นี่คือ event ที่คุณค้นหา");
        
        // เลื่อน popup ให้เห็น event (ถ้า popup มี scrollbar)
        el.scrollIntoView({ 
          behavior: "smooth", 
          block: "center",
          inline: "center" 
        });
      }
    });
    
    if (foundInPopup) break;
  }
  
  if (!foundInPopup) {
    console.log('Event not found in popup, trying main calendar...');
    // ถ้ายังไม่เจอใน popup ให้ลองหาอีกครั้งในปฏิทินหลัก
    setTimeout(() => {
      const eventElement = findEventElement(targetEvent);
      if (eventElement) {
        highlightElement(eventElement, "นี่คือ event ที่คุณค้นหา");
      } else {
        // ไฮไลต์วันแทน
        const targetDateStr = targetEvent.start.split('T')[0];
        const dayElement = document.querySelector(`[data-date="${targetDateStr}"]`);
        if (dayElement) {
          highlightElement(dayElement, "วันที่มี event ที่คุณค้นหา");
        }
      }
    }, 200);
  }
}

// ฟังก์ชันตรวจสอบว่า element นี้คือ target event หรือไม่
function isTargetEventElement(element, targetEvent) {
  console.log('Checking element:', element.textContent, 'vs target:', targetEvent.title);
  
  // วิธีที่ 1: เช็คจาก id หรือ data attributes
  if (element.id === targetEvent.id || 
      element.getAttribute('data-event-id') === targetEvent.id) {
    console.log('Match by ID');
    return true;
  }
  
  // วิธีที่ 2: เช็คจาก title ที่แสดงใน element
  const fcEvent = calendar.getEventById(targetEvent.id);
  if (fcEvent && element.textContent.trim().includes(fcEvent.title.trim())) {
    console.log('Match by FC event title');
    return true;
  }
  
  // วิธีที่ 3: เช็คจาก title ใน targetEvent
  if (targetEvent.title && element.textContent.trim().includes(targetEvent.title.trim())) {
    console.log('Match by target event title');
    return true;
  }
  
  // วิธีที่ 4: เช็คจาก partial match (สำหรับกรณีที่ text อาจมีข้อมูลเพิ่มเติม)
  if (targetEvent.title) {
    const elementText = element.textContent.toLowerCase().trim();
    const targetTitle = targetEvent.title.toLowerCase().trim();
    
    if (elementText.includes(targetTitle) || targetTitle.includes(elementText)) {
      console.log('Match by partial text');
      return true;
    }
  }
  
  return false;
}

// ฟังก์ชันไฮไลต์ element (ปรับปรุงแล้ว)
function highlightElement(element, message) {
  // เพิ่ม rainbow glow effect
  element.classList.add("rainbow-glow");
  
  // เลื่อน element ให้อยู่ตรงกลางหน้าจอ
  element.scrollIntoView({ 
    behavior: "smooth", 
    block: "center",
    inline: "center" 
  });

  // แสดงข้อความแจ้งเตือน
  const note = document.createElement("div");
  note.textContent = `👉 ${message}`;
  note.classList.add("highlighted-event-note");

  const rect = element.getBoundingClientRect();
  note.style.position = "fixed";
  note.style.top = `${Math.max(10, rect.top - 40)}px`; // ป้องกันไม่ให้เกินขอบบน
  note.style.left = `${Math.max(10, rect.left)}px`; // ป้องกันไม่ให้เกินขอบซ้าย
  note.style.background = "#fff8c6";
  note.style.padding = "6px 12px";
  note.style.border = "2px solid #ffd700";
  note.style.borderRadius = "8px";
  note.style.fontSize = "14px";
  note.style.fontWeight = "bold";
  note.style.zIndex = "10001";
  note.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  note.style.maxWidth = "200px";
  note.style.wordWrap = "break-word";

  document.body.appendChild(note);

  // ลบ effect หลัง 5 วินาที
  setTimeout(() => {
    element.classList.remove("rainbow-glow");
    if (note.parentNode) {
      note.remove();
    }
  }, 5000);
}

// ฟังก์ชันแสดงการแจ้งเตือนทั่วไป
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.textContent = message;
  
  // กำหนดสีตาม type
  let backgroundColor, borderColor;
  switch(type) {
    case "success": backgroundColor = "#d4edda"; borderColor = "#28a745"; break;
    case "warning": backgroundColor = "#fff3cd"; borderColor = "#ffc107"; break;
    case "error": backgroundColor = "#f8d7da"; borderColor = "#dc3545"; break;
    default: backgroundColor = "#d1ecf1"; borderColor = "#17a2b8"; break;
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    border: 2px solid ${borderColor};
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    z-index: 10002;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // ลบการแจ้งเตือนหลัง 3 วินาที
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

// ฟังก์ชันแสดง popup ผลการค้นหา (เดิม - ไม่เปลี่ยน)
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

// เพิ่ม CSS สำหรับ rainbow glow effect และ animations
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
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
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