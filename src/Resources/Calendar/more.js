// more.js

function createShowMoreByDateControl(container) {
  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "10px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.padding = "6px";
  dateInput.style.borderRadius = "8px";
  dateInput.style.border = "1px solid #ccc";

  function openMoreForDate(date) {
    if (!date) return;

    // 👉 เลื่อนไปยังวันที่ใน calendar
    if (typeof calendar !== "undefined") {
      calendar.gotoDate(date);
    }

    // 👉 รอให้ calendar render เสร็จก่อนค่อยคลิก more (เช่น 100ms)
    setTimeout(() => {
      const cell = document.querySelector(`.fc-daygrid-day[data-date="${date}"]`);
      if (!cell) return;

      const moreLink = cell.querySelector(".fc-daygrid-more-link");
      if (moreLink) {
        moreLink.click();
      }
    }, 100); // ปรับ delay ตามความเร็ว rendering ของคุณ
  }

  // เมื่อเปลี่ยนวันที่ → เลื่อนไป และเปิด more
  dateInput.addEventListener("change", () => {
    openMoreForDate(dateInput.value);
  });

  wrapper.appendChild(dateInput);
  container.appendChild(wrapper);
}
