// ui-panel.js - Detail panel setup and management

function initializeDetailPanel(container) {
  // สร้างแผงด้านซ้าย (ซ่อนไว้ก่อน)
  detailPanel = document.createElement("div");
  detailPanel.id = "eventDetailPanel";
  Object.assign(detailPanel.style, {
    width: "360px",
    maxWidth: "400px",
    padding: "10px",
    borderRight: "1px solid #ccc",
    height: "100%",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Inter', sans-serif",
    position: "absolute",
    left: "-380px",
    top: "0",
    transition: "left 0.3s ease",
    zIndex: "1000"
  });

  detailPanel.innerHTML = `
    <style>
      .tab-container {
        display: flex;
        background-color: #f8f9fa;
        border-radius: 12px;
        padding: 8px 16px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        margin-top: 10px;
        transition: all 0.3s ease;
        gap: 2px;
      }

      .tab-btn {
        background: transparent;
        border: none;
        margin: 0 6px;
        padding: 10px 20px;
        font-size: 1rem;
        border-radius: 8px;
        cursor: pointer;
        color: #333;
        transition: all 0.3s ease;
        text-align: center;
      }

      .tab-btn.active {
        background-color: #002ac0ff;
        color: white;
      }

      .tab-btn:hover:not(.active) {
        background-color: #e2e6ea;
      }

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
      }

      .close-btn {
        border: none;
        background: none;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .close-btn:hover {
        color: #f44336;
      }
    </style>

    <div class="detail-header">
      <span>📌 รายละเอียด</span>
      <button id="closePanel" class="close-btn">✖</button>
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

  // ดึงปุ่มและ content ที่เกี่ยวข้อง
  eventDetailTab = document.getElementById("tabDetail");
  routingTab = document.getElementById("tabRouting");
  tabContentDetail = document.getElementById("tabContentDetail");
  tabContentRouting = document.getElementById("tabContentRouting");

  // ปุ่มปิด panel
  document.getElementById("closePanel").addEventListener("click", hideDetailPanel);

  // เรียกใช้ฟังก์ชันจัดการ tab
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
      if (tab.id === "tabComponents") {
        LoadComponentEvents(SelectedProdOrderNo);
      }
    });
  });
}

// แสดงแผงด้านซ้ายแบบสมูท
function showDetailPanel() {
  detailPanel.style.left = "0";
}

// ซ่อนแผงด้านซ้าย
function hideDetailPanel() {
  detailPanel.style.left = "-380px";
}
