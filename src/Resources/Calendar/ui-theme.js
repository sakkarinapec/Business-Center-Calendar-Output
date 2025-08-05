// ui-theme.js - Theme switcher and visual effects

function initializeThemeSwitcher(container) {
  // สร้างปุ่มเปลี่ยนธีม
  const themeSwitcher = document.createElement("div");
  themeSwitcher.classList.add("theme-buttons");
  themeSwitcher.style.position = "absolute";
  themeSwitcher.style.top = "5px";
  themeSwitcher.style.right = "5px";
  themeSwitcher.style.zIndex = "999";

  const btnDefault = document.createElement("button");
  btnDefault.textContent = "🧾 Default";
  btnDefault.classList.add("default-btn");
  btnDefault.addEventListener("click", () => SwitchTheme("default"));

  const btnHalloween = document.createElement("button");
  btnHalloween.textContent = "🎃 Halloween";
  btnHalloween.classList.add("halloween-btn");
  btnHalloween.addEventListener("click", () => SwitchTheme("halloween"));

  const btnLove = document.createElement("button");
  btnLove.textContent = "💕 Love";
  btnLove.classList.add("love-btn");
  btnLove.addEventListener("click", () => SwitchTheme("love"));

  themeSwitcher.appendChild(btnDefault);
  themeSwitcher.appendChild(btnHalloween);
  themeSwitcher.appendChild(btnLove);

  // ปุ่มสลับภาษา
  const langToggleBtn = document.createElement("button");
  langToggleBtn.textContent = "🌐 ภาษาไทย";
  langToggleBtn.classList.add("lang-toggle");
  langToggleBtn.dataset.lang = "en"; // เริ่มต้นเป็นภาษาไทย
  langToggleBtn.addEventListener("click", () => {
    const currentLang = langToggleBtn.dataset.lang;
    const newLang = currentLang === "th" ? "en" : "th";
    langToggleBtn.dataset.lang = newLang;
    langToggleBtn.textContent = newLang === "en" ? "🌐 ภาษาไทย" : "🌐 English";

    calendar.setOption("locale", newLang);
  });
  themeSwitcher.appendChild(langToggleBtn);

  container.prepend(themeSwitcher);
}

// เปลี่ยนธีมด้วยการเพิ่ม class
function setTheme(themeName) {
  const el = document.getElementById("controlAddIn");
  el.classList.remove("theme-default", "theme-halloween", "theme-love");
  el.classList.add(`theme-${themeName}`);
}

// ให้ AL เรียกใช้
function SwitchTheme(themeName) {
  setTheme(themeName);
  // แสดงรูปแยกตามธีมที่เลือก (ถ้ามี)
  if (themeName === "love") {
    ShowImageToast("https://i.imgur.com/tMFMSA8.gif");
  } else if (themeName === "halloween") {
    ShowImageToast("https://i.pinimg.com/originals/17/a9/00/17a900d73f0a8091413037a6f8ffb5f1.gif");
  } else if (themeName === "default") {
    ShowImageToast("https://i.redd.it/i3h64r89k0bb1.gif");
  }
}

// ฟังก์ชันแสดงรูปแบบ Toast 3 วิ
function ShowImageToast(imageUrl) {
  const imgToast = document.createElement("div");
  imgToast.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); /* แบล็กโปร่งแสง */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    
  `;

  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.borderRadius = "12px";
  img.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";

  imgToast.appendChild(img);
  document.body.appendChild(imgToast);

  setTimeout(() => {
    imgToast.remove();
  }, 3000);
}

function ShowUndoSuccessToast(message) {
  // ✅ Toast แบบง่าย
  const toast = document.createElement("div");
  toast.innerHTML = message;
  toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      font-size: 14px;
      z-index: 9999;
      animation: fadeInOut 3s ease-out forwards;
  `;
  document.body.appendChild(toast);

  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
  audio.play();

  // 🔁 ลบออกหลัง 3 วินาที
  setTimeout(() => toast.remove(), 3000);
}

// Initialize theme animations
function initializeThemeAnimations() {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeInOutImage {
      0% { opacity: 0; transform: scale(0.8); }
      10% { opacity: 1; transform: scale(1); }
      90% { opacity: 1; }
      100% { opacity: 0; transform: scale(0.8); }
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(20px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize theme animations when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeAnimations);
} else {
  initializeThemeAnimations();
}