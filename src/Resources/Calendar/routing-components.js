// routing-components.js - Routing and components management

// ให้ AL เรียกใช้เพื่อส่งข้อมูล Routing กลับมาแสดง
function SetRoutingText(eventsJson, filterProdOrderNo) {
  const events = JSON.parse(eventsJson);
  if (!tabContentRouting) return;

  const filteredEvents = filterProdOrderNo
    ? events.filter(ev => ev.prodOrderNo === filterProdOrderNo)
    : events;

  if (filteredEvents.length === 0) {
    tabContentRouting.innerHTML = '<p>(ไม่มีรายการ Routing)</p>';
    return;
  }

  let html = `
    <h2 class="routing-header mb-4 custom-blue">
      <i class="fas fa-route me-2"></i> ขั้นตอนการผลิต
    </h2>
    <div class="timeline">
  `;

  filteredEvents.forEach((ev, i) => {
    const index = i + 1;
    const detailId = `routing-detail-${i}`;

    let statusClass = "pending";
    let statusLabel = "รอดำเนินการ";
    let icon = "fa-clock";
    let progress = 0;

    switch (ev.Status) {
      case "Planned":
        statusClass = "pending";
        statusLabel = "วางแผนไว้";
        icon = "fa-clock";
        progress = 0;
        break;
      case "In Progress":
        statusClass = "inprogress";
        statusLabel = "กำลังดำเนินการ";
        icon = "fa-sync-alt fa-spin";
        progress = 65;
        break;
      case "Finished":
        statusClass = "completed";
        statusLabel = "เสร็จสมบูรณ์";
        icon = "fa-check-circle";
        progress = 100;
        break;
      default:
        statusClass = "pending";
        statusLabel = "ไม่ทราบสถานะ";
        icon = "fa-question-circle";
        progress = 0;
    }

    html += `
      <div class="timeline-step ${statusClass}" onclick="viewRouting('${ev.prodOrderNo}')">
        <div class="step-number">${index}</div>
        <div class="step-content">
          <h3 class="step-title">${ev.title}</h3>
          <div class="step-status">
            <i class="fas ${icon} status-icon me-2"></i>
            <span class="status-label">${statusLabel}</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%;"></div>
          </div>
          <button class="btn btn-sm btn-toggle mt-2" onclick="event.stopPropagation(); toggleRoutingDetail('${detailId}', this)">
            แสดงรายละเอียด
          </button>
          <div id="${detailId}" class="routing-detail mt-2" style="display:none;">
            ${ev.other}
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  tabContentRouting.innerHTML = html;
  showDetailPanel();
}

function toggleRoutingDetail(id, button) {
  const el = document.getElementById(id);
  if (el) {
    const isHidden = el.style.display === "none" || el.style.display === "";
    el.style.display = isHidden ? "block" : "none";
    button.textContent = isHidden ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด";
  }
}


Microsoft.Dynamics.NAV.RegisterAddInMethod("SetRoutingText", SetRoutingText);

function viewRouting(prodOrderNo) {
   Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewRouting", [prodOrderNo]);
}

function viewProdOrder(id) {
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewProdOrder", [id]);
}

function viewComponents(prodOrderNo) {
  Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewComponents", [prodOrderNo]);
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

  // 🏷️ แผนที่หน่วยนับ (รหัส → ภาษาไทย)
  const unitNameMap = {
    "PCS": "ชิ้น",
    "PIECE": "ชิ้น",
    "PACK": "แพ็ค",
    "PALLET": "พาเลท",
    "SET": "ชุด",
    "TONNE": "ตัน",
    "KG": "กิโลกรัม",
    "GR": "กรัม",
    "L": "ลิตร",
    "ML": "มิลลิลิตร"
  };
  // 🎯 แผนที่ไอคอนแบบเคลื่อนไหวตามหน่วยนับ
  const unitIconMap = {
    "ชิ้น": "fas fa-cube fa-bounce",           // ชิ้น/piece - กระดอน
    "แพ็ค": "fas fa-box fa-shake",             // แพ็ค - สั่น
    "พาเลท": "fas fa-pallet fa-flip",          // พาเลท - พลิก
    "ชุด": "fas fa-layer-group fa-fade",       // ชุด/set - จางหาย
    "ตัน": "fas fa-weight-hanging fa-bounce",  // ตัน - กระดอน
    "กิโลกรัม": "fas fa-balance-scale fa-beat", // กิโลกรัม - เต้น
    "กรัม": "fas fa-feather-alt fa-beat-fade", // กรัม - เต้นจางหาย
    "ลิตร": "fas fa-flask fa-shake",           // ลิตร - สั่น
    "มิลลิลิตร": "fas fa-tint fa-bounce",      // มิลลิลิตร - กระดอน
    "ไม่ระบุ": "fas fa-question-circle fa-spin" // ไม่ระบุ - หมุน
  };

  // 🔢 รวมยอดตามหน่วยนับ
  const unitTotals = {};
  let latestDate = "";

  components.forEach(c => {
    const qty = parseFloat(c.QuantityPer || 0);
    const unit = (c.UnitofMeasure || "").toUpperCase();
    const unitName = unitNameMap[unit] || unit || "ไม่ระบุ";

    if (!unitTotals[unitName]) unitTotals[unitName] = 0;
    unitTotals[unitName] += qty;

    if (c.DueDate && (!latestDate || c.DueDate > latestDate)) {
      latestDate = c.DueDate;
    }
  });

  // 🔤 สร้างข้อความรวมยอดตามหน่วย
  const unitSummary = Object.entries(unitTotals)
    .map(([unitName, total]) => `${total} ${unitName}`)
    .join(", ");

  let html = `
    <h2 class="custom-blue">
      <i class="fas fa-boxes me-2"></i> ส่วนประกอบที่ใช้
    </h2>
    <p class="text-muted mb-3">
      รวมทั้งหมด: <strong>${unitSummary}</strong> | Due Date ล่าสุด: <strong>${latestDate || "-"}</strong>
    </p>
    <ul class="component-list">
  `;

  components.forEach((comp, i) => {
    const id = `component-detail-${i}`;
    const desc = comp.Description || comp.ItemNo || "(ไม่ระบุ)";
    const prodOrderNo = comp.prodOrderNo || comp.ProdOrderNo || "";
    const quantity = comp.QuantityPer || "-";
    const due = comp.DueDate || "-";
    const unit = (comp.UnitofMeasure || "").toUpperCase();
    const unitName = unitNameMap[unit] || unit || "ไม่ระบุ";
    // 🎯 เลือกไอคอนตามหน่วยนับ
    const iconClass = unitIconMap[unitName] || unitIconMap["ไม่ระบุ"];

    html += `
      <li class="component-card" onclick="viewComponents('${prodOrderNo}')">
        <div class="component-icon"><i class="${iconClass}"></i></div>
        <div class="flex-grow-1">
          <div class="fw-bold">${desc}</div>
          <div class="text-muted small">Due Date: ${due}</div>
          <button class="btn btn-sm btn-toggle mt-2" onclick="event.stopPropagation(); toggleComponentDetail('${id}', this)">แสดงรายละเอียด</button>
          <div id="${id}" class="routing-detail mt-2" style="display:none;">
            <div><strong>Item No:</strong> ${comp.ItemNo}</div>
            <div><strong>Qty per:</strong> ${quantity} ${unitName}</div>
            <div><strong>Due Date:</strong> ${due}</div>
            <div><strong>Prod Order No:</strong> ${prodOrderNo || '<span style="color:red;">ไม่มี</span>'}</div>
          </div>
        </div>
      </li>
    `;
  });

  html += '</ul>';
  tabContentComponents.innerHTML = html;
}

function toggleComponentDetail(id, button) {
  const el = document.getElementById(id);
  if (el) {
    const isHidden = el.style.display === "none" || el.style.display === "";
    el.style.display = isHidden ? "block" : "none";
    button.textContent = isHidden ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด";
  }
}

function LoadComponentEvents(prodOrderNo) {
  if (prodOrderNo && Microsoft && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("LoadProdOrderComponents", [prodOrderNo]);
  }
}