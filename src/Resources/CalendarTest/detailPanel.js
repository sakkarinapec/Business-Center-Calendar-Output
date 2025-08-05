// detailPanel.js

export let detailPanel;

export function createDetailPanel(container) {
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
  detailPanel.style.left = "-340px"; // เริ่มซ่อน
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
    <button id="tabDetail" class="tab-btn active">📄 3333รายละเอียด</button>
    <button id="tabRouting" class="tab-btn">🧪</button>
    <button id="tabComponents" class="tab-btn">📦</button>
  </div>

  <div id="tabContentDetail" style="margin-top: 10px;"></div>
  <div id="tabContentRouting" style="margin-top: 10px; display: none;"></div>
  <div id="tabContentComponents" style="margin-top: 10px; display: none;"></div>
  `;

  container.appendChild(detailPanel);
}

export function hideDetailPanel() {
  if (detailPanel) {
    detailPanel.style.left = "-340px";
  }
}

export function showDetailPanel() {
  if (detailPanel) {
    detailPanel.style.left = "0";
  }
}
