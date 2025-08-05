// routing-components.js - Routing and components management

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
      html += `<li>
      ${ev.title}<br/>
      <small>${ev.description || ''}</small><br/>
      <button onclick="viewRouting('${ev.prodOrderNo}')" style="margin-top:5px;">🔍</button>
    </li>`;
    });
    html += '</ul>';

    tabContentRouting.innerHTML = html;
  }

  showDetailPanel();
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

function LoadComponentEvents(prodOrderNo) {
  if (prodOrderNo && Microsoft && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("LoadProdOrderComponents", [prodOrderNo]);
  }
}