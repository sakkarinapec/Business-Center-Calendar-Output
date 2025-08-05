// ui-filter.js - Filter and search functionality

function initializeFilterContainer(container) {
  const themeSwitcher = container.querySelector('.theme-buttons') || container;

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

  filterSelect.style.borderRadius = "16px";
  filterSelect.style.padding = "8px 12px";
  filterSelect.style.fontSize = "14px";
  filterSelect.style.border = "1px solid #ccc";
  filterSelect.style.backgroundColor = "#f9f9f9";
  filterSelect.style.cursor = "pointer";
  filterSelect.style.outline = "none";
  filterSelect.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
  filterSelect.style.color = "#333";

  const searchWrapper = document.createElement("div");
  searchWrapper.style.position = "relative";
  searchWrapper.style.width = "30px";
  searchWrapper.style.height = "28px";
  searchWrapper.style.transition = "width 0.3s ease";
  searchWrapper.style.overflow = "hidden";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.style.width = "100%";
  searchInput.style.height = "28px";
  searchInput.style.border = "1px solid #ccc";
  searchInput.style.borderRadius = "4px";
  searchInput.style.padding = "4px 28px 4px 8px";
  searchInput.style.fontSize = "14px";
  searchInput.style.transition = "width 0.3s ease";
  searchInput.style.outline = "none";

  const searchIcon = document.createElement("span");
  searchIcon.textContent = "🔍";
  searchIcon.style.position = "absolute";
  searchIcon.style.right = "6px";
  searchIcon.style.top = "50%";
  searchIcon.style.transform = "translateY(-50%)";
  searchIcon.style.pointerEvents = "none";

  searchWrapper.appendChild(searchInput);
  searchWrapper.appendChild(searchIcon);

  searchInput.addEventListener("focus", () => {
    searchWrapper.style.width = "180px";
    searchInput.placeholder = "ค้นหา...";
  });
  searchInput.addEventListener("blur", () => {
    if (!searchInput.value) {
      searchWrapper.style.width = "30px";
      searchInput.placeholder = "";
    }
  });
  searchWrapper.addEventListener("mouseenter", () => {
    searchWrapper.style.width = "180px";
    if (!searchInput.value) searchInput.placeholder = "ค้นหา...";
  });
  searchWrapper.addEventListener("mouseleave", () => {
    if (document.activeElement !== searchInput && !searchInput.value) {
      searchWrapper.style.width = "30px";
      searchInput.placeholder = "";
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) return;

      const filtered = allEvents.filter(ev => {
        const title = (ev.title || "").toLowerCase();
        const desc = (ev.extendedProps?.description || "").toLowerCase();
        const id = (ev.id || "").toLowerCase();
        return title.includes(keyword) || desc.includes(keyword) || id.includes(keyword);
      });

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
        goToEventAndHighlight(finalFiltered[0]);
        return;
      }

      document.querySelectorAll('.custom-popup-modal')?.forEach(m => m.remove());
      showSearchResultsPopup(finalFiltered, keyword);
    }
  });

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
      applyFilter(filterSelect.value);
      return;
    }

    const filtered = allEvents.filter(ev => {
      const title = (ev.title || "").toLowerCase();
      const desc = (ev.extendedProps?.description || "").toLowerCase();
      const id = (ev.id || "").toLowerCase();
      return title.includes(keyword) || desc.includes(keyword) || id.includes(keyword);
    });

    const filterValue = filterSelect.value;
    const finalFiltered = filtered.filter(ev => {
      if (!filterValue) return true;
      if (filterValue === "routing") return ev.id.startsWith("routing-");
      if (filterValue === "production") return !ev.id.startsWith("routing-") && !ev.id.startsWith("comp-");
      if (filterValue === "component") return ev.id.startsWith("comp-");
      return true;
    });

    calendar.removeAllEvents();
    calendar.addEventSource(finalFiltered);
    autoClickMoreLinks();
  });

  // ✅ ปุ่มล้าง ❌
  const searchResetBtn = document.createElement("button");
  searchResetBtn.textContent = "❌";
  searchResetBtn.title = "ล้างการค้นหา";
  searchResetBtn.style.marginLeft = "4px";
  searchResetBtn.style.cursor = "pointer";
  searchResetBtn.style.border = "none";
  searchResetBtn.style.background = "#f4f5f5ff";
  searchResetBtn.style.fontSize = "16px";
  searchResetBtn.style.color = "#888";

  searchResetBtn.addEventListener("click", () => {
    searchInput.value = "";
    applyFilter(filterSelect.value);
    searchInput.blur();
    searchWrapper.style.width = "30px";
  });

  // ✅ เพิ่มเข้า container
  filterContainer.appendChild(filterSelect);
  filterContainer.appendChild(searchWrapper);
  filterContainer.appendChild(searchResetBtn);

  if (themeSwitcher) {
    themeSwitcher.appendChild(filterContainer);
  }
}
