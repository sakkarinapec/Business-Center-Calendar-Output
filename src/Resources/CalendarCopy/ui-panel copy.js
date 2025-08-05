// ui-panel.js - Detail panel setup and management

function initializeDetailPanel(container) {
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

  // Setup tab functionality
  setupTabFunctionality();
}

function setupTabFunctionality() {
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
}

// แสดงแผงด้านซ้ายแบบสมูท
function showDetailPanel() {
  detailPanel.style.left = "0";
}

// ซ่อนแผงด้านซ้าย
function hideDetailPanel() {
  detailPanel.style.left = "-340px";
}