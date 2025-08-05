// ui-calendar.js - Calendar UI setup and event handling

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
    <b>เลขที่คำสั่งผลิต:</b> ${id}<br/>
    <b>วันที่เริ่ม:</b> ${start}<br/>
    <b>จำนวน:</b> ${quantity}<br/>
    <b>เวลาเริ่มต้น:</b> ${startDT}<br/>
    <b>เวลาสิ้นสุด:</b> ${endDT}<br/>
    <b>อื่น ๆ :</b> ${other}<br/>
    <p>${desc}</p>
    <button onclick="viewProdOrder('${id}')" style="margin-top:5px;">🔍</button>
  `;

  showDetailPanel();
  LoadComponentEvents(SelectedProdOrderNo);
  
  // ✅ Scroll ไปให้เห็นแผง detailPanel
  const panel = document.getElementById("eventDetailPanel");
  if (panel) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("LoadRoutingDetails", []);
}

// ฟังก์ชันกรองการแสดงผล events
function applyFilter(filterType) {
  const filteredEvents = allEvents.filter(ev => {
    if (!filterType) return true; // แสดงทั้งหมด
    if (filterType === "routing") return ev.id.startsWith("routing-");
    if (filterType === "production") return !ev.id.startsWith("routing-") && !ev.id.startsWith("comp-");
    if (filterType === "component") return ev.id.startsWith("comp-");
    return true;
  });

  calendar.removeAllEvents();
  calendar.addEventSource(filteredEvents);
  autoClickMoreLinks(); // 👈 เปิด "n more" หลังกรอง
}

