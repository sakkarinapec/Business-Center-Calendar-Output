// ui-calendar.js - Calendar UI setup and event handling (Updated for Bootstrap Panel)

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
  const status = event.extendedProps.status || "";
  const UnitofMeasure = event.extendedProps.UnitofMeasure || "";
  const idPO = event.extendedProps.idPO || "";
  const finishedQty = parseFloat(event.extendedProps.FinishedQty || 0);
  const remainingQty = parseFloat(event.extendedProps.RemainingQty || 0);

  let progress = 0;
  const totalQty = finishedQty + remainingQty;
  if (totalQty > 0) {
    progress = Math.round((finishedQty / totalQty) * 100);
  }
  // สร้าง HTML ใหม่ตามรูปแบบ Bootstrap
  tabContentDetail.innerHTML = `
    <div class="detail-card">
      <h5><i class="fas fa-clipboard-list me-2"></i> ข้อมูลคำสั่งผลิต</h5>
      <div class="detail-row">
        <div class="detail-label">ชื่อรายการ:</div>
        <div class="detail-value">${title}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">เลขที่คำสั่งผลิต:</div>
        <div class="detail-value">${idPO}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">วันที่เริ่ม:</div>
        <div class="detail-value">${start}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">จำนวน:</div>
        <div class="detail-value">${quantity} ${UnitofMeasure}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">เวลาเริ่มต้น:</div>
        <div class="detail-value">${startDT}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">เวลาสิ้นสุด:</div>
        <div class="detail-value">${endDT}</div>
      </div>
      <div class="detail-row">
          <div class="detail-label">สถานะ:</div>
          <div class="detail-value">${getStatusBadge(status)}</div>
       </div>
      <div class="detail-row">
        <div class="detail-label">อื่น ๆ:</div>
        <div class="detail-value">${other}</div>
      </div>       
    </div>
    
    ${desc ? `
    <div class="detail-card">
      <h5><i class="fas fa-tasks me-2"></i> ความคืบหน้า</h5>
  <div class="detail-row">
    <div class="detail-label">เสร็จสมบูรณ์:</div>
    <div class="detail-value">${progress}% (${finishedQty} จาก ${totalQty})</div>
  </div>
  <div class="progress-container">
    <div class="progress-bar" style="width: ${progress}%"></div>
  </div>
      <p class="text-muted mb-0">${desc}</p>
    </div>
    ` : ''}
    
    <div class="detail-card">
      <h5><i class="fas fa-tools me-2"></i> รายละเอียดเพิ่มเติม</h5>
      <button class="btn btn-primary btn-sm" onclick="viewProdOrder('${id}')">
        🔍
      </button>
    </div>
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

// ฟังก์ชันเพิ่มเติมสำหรับจัดการสถานะ (Business Central Status)
function getStatusBadge(status) {
  // Handle both number and string values
  const statusValue = typeof status === 'number' ? status : parseInt(status);
  
  switch(statusValue) {
    case 0: // Simulated
      return '<span class="status-badge status-simulated">Simulated</span>';
    case 1: // Planned
      return '<span class="status-badge status-planned">Planned</span>';
    case 2: // Firm Planned
      return '<span class="status-badge status-firm-planned">Firm Planned</span>';
    case 3: // Released
      return '<span class="status-badge status-released">Released</span>';
    case 4: // Finished
      return '<span class="status-badge status-finished">Finished</span>';
    default:
      // Fallback for string values
      switch(status?.toLowerCase()) {
        case 'simulated':
          return '<span class="status-badge status-simulated">Simulated</span>';
        case 'planned':
          return '<span class="status-badge status-planned">Planned</span>';
        case 'firm planned':
          return '<span class="status-badge status-firm-planned">Firm Planned</span>';
        case 'released':
          return '<span class="status-badge status-released">Released</span>';
        case 'finished':
          return '<span class="status-badge status-finished">Finished</span>';
        default:
          return '<span class="status-badge status-unknown">ไม่ระบุสถานะ</span>';
      }
  }
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