// ui-filter.js - Enhanced Filter and search functionality

function initializeFilterContainer(container) {
  const themeSwitcher = container.querySelector('.theme-buttons') || container;

  const filterContainer = document.createElement("div");
  filterContainer.style.marginTop = "12px";
  filterContainer.style.display = "flex";
  filterContainer.style.alignItems = "center";
  filterContainer.style.gap = "12px";
  filterContainer.style.height = "100%";
  filterContainer.style.padding = "0";

  // ✨ Custom Animated Dropdown
  const dropdownContainer = document.createElement("div");
  dropdownContainer.style.position = "relative";
  dropdownContainer.style.display = "inline-block";

  const dropdownButton = document.createElement("button");
  dropdownButton.innerHTML = `<span>🏭 ผลิต</span> <span class="arrow">▼</span>`;
  dropdownButton.style.borderRadius = "20px";
  dropdownButton.style.padding = "12px 20px";
  dropdownButton.style.fontSize = "14px";
  dropdownButton.style.fontWeight = "600";
  dropdownButton.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  dropdownButton.style.border = "none";
  dropdownButton.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  dropdownButton.style.color = "white";
  dropdownButton.style.cursor = "pointer";
  dropdownButton.style.outline = "none";
  dropdownButton.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.35)";
  dropdownButton.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  dropdownButton.style.minWidth = "150px";
  dropdownButton.style.display = "flex";
  dropdownButton.style.justifyContent = "space-between";
  dropdownButton.style.alignItems = "center";
  dropdownButton.style.gap = "8px";

  const dropdownMenu = document.createElement("div");
  dropdownMenu.style.position = "absolute";
  dropdownMenu.style.top = "calc(100% + 8px)";
  dropdownMenu.style.left = "0";
  dropdownMenu.style.right = "0";
  dropdownMenu.style.background = "rgba(255, 255, 255, 0.95)";
  dropdownMenu.style.backdropFilter = "blur(20px)";
  dropdownMenu.style.borderRadius = "16px";
  dropdownMenu.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
  dropdownMenu.style.border = "1px solid rgba(255, 255, 255, 0.2)";
  dropdownMenu.style.overflow = "hidden";
  dropdownMenu.style.opacity = "0";
  dropdownMenu.style.visibility = "hidden";
  dropdownMenu.style.transform = "translateY(-10px) scale(0.95)";
  dropdownMenu.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  dropdownMenu.style.zIndex = "1000";

  const options = [
    { value: "production", text: "🏭 ผลิต", selected: true },
    { value: "routing", text: "🧪 Routing", selected: false },
    { value: "component", text: "🔩 Component", selected: false },
    { value: "", text: "🔎 ทั้งหมด", selected: false }
  ];

  let selectedValue = "production";
  let isOpen = false;

  options.forEach((option, index) => {
    const menuItem = document.createElement("div");
    menuItem.textContent = option.text;
    menuItem.style.padding = "12px 20px";
    menuItem.style.cursor = "pointer";
    menuItem.style.fontSize = "14px";
    menuItem.style.fontWeight = "500";
    menuItem.style.color = "#4a5568";
    menuItem.style.transition = "all 0.2s ease";
    menuItem.style.borderBottom = index < options.length - 1 ? "1px solid rgba(0, 0, 0, 0.05)" : "none";
    menuItem.style.display = "flex";
    menuItem.style.alignItems = "center";
    menuItem.style.transform = "translateX(-20px)";
    menuItem.style.opacity = "0";

    menuItem.addEventListener("mouseenter", () => {
      menuItem.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
      menuItem.style.color = "white";
      menuItem.style.transform = "translateX(0) scale(1.02)";
    });

    menuItem.addEventListener("mouseleave", () => {
      menuItem.style.background = "transparent";
      menuItem.style.color = "#4a5568";
      menuItem.style.transform = "translateX(0) scale(1)";
    });

    menuItem.addEventListener("click", () => {
      selectedValue = option.value;
      dropdownButton.innerHTML = `<span>${option.text}</span> <span class="arrow">▼</span>`;
      closeDropdown();
      
      // Trigger original functionality
      applyFilter(selectedValue);
      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("FilterChanged", [selectedValue]);
    });

    dropdownMenu.appendChild(menuItem);
  });

  function openDropdown() {
    isOpen = true;
    dropdownMenu.style.opacity = "1";
    dropdownMenu.style.visibility = "visible";
    dropdownMenu.style.transform = "translateY(0) scale(1)";
    dropdownButton.querySelector('.arrow').style.transform = "rotate(180deg)";
    dropdownButton.style.background = "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)";
    
    // Animate menu items
    const items = dropdownMenu.children;
    Array.from(items).forEach((item, index) => {
      setTimeout(() => {
        item.style.transform = "translateX(0)";
        item.style.opacity = "1";
      }, index * 50);
    });
  }

  function closeDropdown() {
    isOpen = false;
    dropdownMenu.style.opacity = "0";
    dropdownMenu.style.visibility = "hidden";
    dropdownMenu.style.transform = "translateY(-10px) scale(0.95)";
    dropdownButton.querySelector('.arrow').style.transform = "rotate(0deg)";
    dropdownButton.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    
    // Reset menu items animation
    const items = dropdownMenu.children;
    Array.from(items).forEach((item) => {
      item.style.transform = "translateX(-20px)";
      item.style.opacity = "0";
    });
  }

  dropdownButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target) && isOpen) {
      closeDropdown();
    }
  });

  // Button hover effects
  dropdownButton.addEventListener("mouseenter", () => {
    if (!isOpen) {
      dropdownButton.style.transform = "translateY(-3px) scale(1.02)";
      dropdownButton.style.boxShadow = "0 15px 35px rgba(102, 126, 234, 0.45)";
      dropdownButton.style.background = "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)";
    }
  });
  dropdownButton.addEventListener("mouseleave", () => {
    if (!isOpen) {
      dropdownButton.style.transform = "translateY(0) scale(1)";
      dropdownButton.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.35)";
      dropdownButton.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  });

  // Arrow rotation styling
  const arrowElement = dropdownButton.querySelector('.arrow');
  if (arrowElement) {
    arrowElement.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    arrowElement.style.fontSize = "12px";
  }

  dropdownContainer.appendChild(dropdownButton);
  dropdownContainer.appendChild(dropdownMenu);

  // ✨ Enhanced Search Wrapper
  const searchWrapper = document.createElement("div");
  searchWrapper.style.position = "relative";
  searchWrapper.style.width = "40px";
  searchWrapper.style.height = "40px";
  searchWrapper.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
  searchWrapper.style.overflow = "hidden";
  searchWrapper.style.borderRadius = "20px";
  searchWrapper.style.background = "rgba(255, 255, 255, 0.95)";
  searchWrapper.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
  searchWrapper.style.backdropFilter = "blur(10px)";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.style.width = "100%";
  searchInput.style.height = "40px";
  searchInput.style.border = "none";
  searchInput.style.borderRadius = "20px";
  searchInput.style.padding = "0 45px 0 16px";
  searchInput.style.fontSize = "14px";
  searchInput.style.fontWeight = "400";
  searchInput.style.transition = "all 0.3s ease";
  searchInput.style.outline = "none";
  searchInput.style.background = "transparent";
  searchInput.style.color = "#4a5568";

  // ✨ Animated Search Icon
  const searchIcon = document.createElement("span");
  searchIcon.innerHTML = "🔍";
  searchIcon.style.position = "absolute";
  searchIcon.style.right = "12px";
  searchIcon.style.top = "50%";
  searchIcon.style.transform = "translateY(-50%)";
  searchIcon.style.fontSize = "16px";
  searchIcon.style.pointerEvents = "none";
  searchIcon.style.transition = "all 0.3s ease";
  searchIcon.style.zIndex = "2";

  searchWrapper.appendChild(searchInput);
  searchWrapper.appendChild(searchIcon);

  // Enhanced search interactions
  searchInput.addEventListener("focus", () => {
    searchWrapper.style.width = "220px";
    searchWrapper.style.transform = "translateY(-2px)";
    searchWrapper.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.25)";
    searchWrapper.style.background = "rgba(255, 255, 255, 1)";
    searchIcon.style.color = "#667eea";
    searchInput.placeholder = "🔎 ค้นหารายการ...";
  });

  searchInput.addEventListener("blur", () => {
    if (!searchInput.value) {
      searchWrapper.style.width = "40px";
      searchWrapper.style.transform = "translateY(0)";
      searchWrapper.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
      searchWrapper.style.background = "rgba(255, 255, 255, 0.95)";
      searchIcon.style.color = "#718096";
      searchInput.placeholder = "";
    }
  });

  searchWrapper.addEventListener("mouseenter", () => {
    if (document.activeElement !== searchInput) {
      searchWrapper.style.width = "220px";
      searchWrapper.style.transform = "translateY(-2px)";
      searchWrapper.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.25)";
      searchWrapper.style.background = "rgba(255, 255, 255, 1)";
      searchIcon.style.color = "#667eea";
      if (!searchInput.value) searchInput.placeholder = "🔎 ค้นหารายการ...";
    }
  });

  searchWrapper.addEventListener("mouseleave", () => {
    if (document.activeElement !== searchInput && !searchInput.value) {
      searchWrapper.style.width = "40px";
      searchWrapper.style.transform = "translateY(0)";
      searchWrapper.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
      searchWrapper.style.background = "rgba(255, 255, 255, 0.95)";
      searchIcon.style.color = "#718096";
      searchInput.placeholder = "";
    }
  });

  // Keep original search functionality
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

  // ✨ Enhanced Reset Button
  const searchResetBtn = document.createElement("button");
  searchResetBtn.innerHTML = "✨";
  searchResetBtn.title = "ล้างการค้นหา";
  searchResetBtn.style.width = "40px";
  searchResetBtn.style.height = "40px";
  searchResetBtn.style.cursor = "pointer";
  searchResetBtn.style.border = "none";
  searchResetBtn.style.borderRadius = "20px";
  searchResetBtn.style.background = "rgba(255, 255, 255, 0.95)";
  searchResetBtn.style.fontSize = "16px";
  searchResetBtn.style.color = "#e53e3e";
  searchResetBtn.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  searchResetBtn.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
  searchResetBtn.style.backdropFilter = "blur(10px)";
  searchResetBtn.style.display = "flex";
  searchResetBtn.style.alignItems = "center";
  searchResetBtn.style.justifyContent = "center";

  searchResetBtn.addEventListener("mouseenter", () => {
    searchResetBtn.style.transform = "translateY(-2px) scale(1.05)";
    searchResetBtn.style.boxShadow = "0 8px 25px rgba(229, 62, 62, 0.25)";
    searchResetBtn.style.background = "rgba(255, 255, 255, 1)";
    searchResetBtn.innerHTML = "🗑️";
  });

  searchResetBtn.addEventListener("mouseleave", () => {
    searchResetBtn.style.transform = "translateY(0) scale(1)";
    searchResetBtn.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
    searchResetBtn.style.background = "rgba(255, 255, 255, 0.95)";
    searchResetBtn.innerHTML = "✨";
  });

  searchResetBtn.addEventListener("click", () => {
    // Add click animation
    searchResetBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
      searchResetBtn.style.transform = "scale(1)";
    }, 150);

    searchInput.value = "";
    applyFilter(filterSelect.value);
    searchInput.blur();
    searchWrapper.style.width = "40px";
    searchWrapper.style.transform = "translateY(0)";
    searchWrapper.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
    searchWrapper.style.background = "rgba(255, 255, 255, 0.95)";
    searchIcon.style.color = "#718096";
  });

  // ✅ Add to container with enhanced layout
  filterContainer.appendChild(dropdownContainer);
  filterContainer.appendChild(searchWrapper);
  filterContainer.appendChild(searchResetBtn);

  if (themeSwitcher) {
    themeSwitcher.appendChild(filterContainer);
  }

  // Add subtle entrance animation
  filterContainer.style.opacity = "0";
  filterContainer.style.transform = "translateY(-10px)";
  setTimeout(() => {
    filterContainer.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    filterContainer.style.opacity = "1";
    filterContainer.style.transform = "translateY(0)";
  }, 100);
}