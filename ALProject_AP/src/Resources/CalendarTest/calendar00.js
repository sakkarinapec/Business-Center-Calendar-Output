let calendar;
let currentEvents = [];
let routingHtml = '';
let componentData = [];

// Initialize the calendar when the page loads
function initializeCalendar() {
    const calendarEl = document.getElementById('controlAddIn');
    
    if (!calendarEl) {
        console.error('Calendar container not found');
        return;
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'th', // Thai locale
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        height: 'auto',
        aspectRatio: 1.35,
        
        // Event handling
        eventClick: function(info) {
            handleEventClick(info);
        },
        
        // Event drag and drop
        editable: true,
        eventDrop: function(info) {
            handleEventDrop(info);
        },
        
        // Date selection
        selectable: true,
        select: function(info) {
            handleDateSelect(info);
        },
        
        // Event rendering customization
        eventDidMount: function(info) {
            customizeEventAppearance(info);
        },
        
        // Button text customization
        buttonText: {
            today: 'วันนี้',
            month: 'เดือน',
            week: 'สัปดาห์',
            day: 'วัน',
            list: 'รายการ'
        },
        
        // Day names in Thai
        dayHeaderFormat: { weekday: 'short' },
        
        // Event content customization
        eventContent: function(arg) {
            return createEventContent(arg);
        }
    });

    calendar.render();
    
    // Add filter buttons
    addFilterButtons();
    
    // Add theme switcher
    addThemeSwitcher();
    
    console.log('Calendar initialized successfully');
}

// Handle event clicks
function handleEventClick(info) {
    const eventId = info.event.id;
    const extendedProps = info.event.extendedProps;
    
    // Create detailed popup
    showEventDetails(info.event);
    
    // Trigger AL event
    if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('EventClicked', [eventId]);
    }
}

// Handle event drag and drop
function handleEventDrop(info) {
    const eventId = info.event.id;
    const newDate = info.event.start.toISOString().split('T')[0];
    
    // Show confirmation dialog
    if (confirm(`ต้องการย้าย "${info.event.title}" ไปยังวันที่ ${formatDateThai(info.event.start)} หรือไม่?`)) {
        // Trigger AL event
        if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('EventMoved', [eventId, newDate]);
        }
    } else {
        // Revert the event position
        info.revert();
    }
}

// Handle date selection
function handleDateSelect(info) {
    const startDate = info.startStr;
    const endDate = info.endStr;
    
    if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('DateSelected', [startDate, endDate]);
    }
}

// Customize event appearance
function customizeEventAppearance(info) {
    const event = info.event;
    const element = info.el;
    
    // Add custom classes based on event type
    if (event.classNames.includes('production')) {
        element.style.backgroundColor = '#3498db';
        element.style.borderColor = '#2980b9';
        element.style.color = 'white';
    } else if (event.classNames.includes('routing')) {
        element.style.backgroundColor = '#e74c3c';
        element.style.borderColor = '#c0392b';
        element.style.color = 'white';
    } else if (event.classNames.includes('component-event')) {
        element.style.backgroundColor = '#f39c12';
        element.style.borderColor = '#e67e22';
        element.style.color = 'white';
    }
    
    // Add tooltip
    element.title = event.title;
}

// Create custom event content
function createEventContent(arg) {
    const event = arg.event;
    const extendedProps = event.extendedProps;
    
    const content = document.createElement('div');
    content.innerHTML = `
        <div class="event-content">
            <div class="event-title">${event.title}</div>
            ${extendedProps.quantity ? `<div class="event-quantity">จำนวน: ${extendedProps.quantity}</div>` : ''}
        </div>
    `;
    
    return { domNodes: [content] };
}

// Show event details in a popup
function showEventDetails(event) {
    const extendedProps = event.extendedProps;
    
    let detailsHtml = `
        <div class="event-details-popup">
            <h3>${event.title}</h3>
            <p><strong>วันที่:</strong> ${formatDateThai(event.start)}</p>
    `;
    
    if (extendedProps.description) {
        detailsHtml += `<p><strong>รายละเอียด:</strong> ${extendedProps.description}</p>`;
    }
    
    if (extendedProps.quantity) {
        detailsHtml += `<p><strong>จำนวน:</strong> ${extendedProps.quantity}</p>`;
    }
    
    if (extendedProps.status) {
        detailsHtml += `<p><strong>สถานะ:</strong> ${extendedProps.status}</p>`;
    }
    
    // Add action buttons
    detailsHtml += `
        <div class="event-actions">
            <button onclick="viewRouting('${event.id}')" class="btn-routing">ดู Routing</button>
            <button onclick="viewProdOrder('${event.id}')" class="btn-prodorder">ดู Production Order</button>
            <button onclick="viewComponents('${event.id}')" class="btn-components">ดู Components</button>
        </div>
    `;
    
    detailsHtml += `</div>`;
    
    // Create and show modal
    showModal(detailsHtml);
}

// Add filter buttons to the calendar
function addFilterButtons() {
    const toolbar = document.querySelector('.fc-toolbar-chunk:last-child');
    if (!toolbar) return;
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-buttons';
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="production">Production</button>
        <button class="filter-btn" data-filter="routing">Routing</button>
        <button class="filter-btn" data-filter="component">Component</button>
        <button class="filter-btn" data-filter="all">ทั้งหมด</button>
    `;
    
    toolbar.appendChild(filterContainer);
    
    // Add event listeners
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Trigger filter change
            const filterValue = this.dataset.filter;
            if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('FilterChanged', [filterValue]);
            }
        });
    });
}

// Add theme switcher
function addThemeSwitcher() {
    const toolbar = document.querySelector('.fc-toolbar-chunk:first-child');
    if (!toolbar) return;
    
    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-switcher';
    themeContainer.innerHTML = `
        <select id="theme-select">
            <option value="default">ธีมปกติ</option>
            <option value="dark">ธีมมืด</option>
            <option value="colorful">ธีมสีสัน</option>
            <option value="minimal">ธีมเรียบง่าย</option>
        </select>
    `;
    
    toolbar.insertBefore(themeContainer, toolbar.firstChild);
    
    document.getElementById('theme-select').addEventListener('change', function() {
        switchTheme(this.value);
    });
}

// Switch calendar theme
function switchTheme(themeName) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-colorful', 'theme-minimal');
    
    // Add new theme class
    if (themeName !== 'default') {
        body.classList.add(`theme-${themeName}`);
    }
    
    console.log(`Switched to theme: ${themeName}`);
}

// Format date in Thai
function formatDateThai(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        locale: 'th-TH'
    };
    return new Date(date).toLocaleDateString('th-TH', options);
}

// Show modal dialog
function showModal(content) {
    // Remove existing modal
    const existingModal = document.querySelector('.event-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'event-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
    
    // Show modal
    setTimeout(() => modal.classList.add('show'), 10);
}

// Show success toast
function showUndoSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Action button handlers
function viewRouting(eventId) {
    const prodOrderNo = eventId.split('|')[0];
    if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('ViewRouting', [prodOrderNo]);
    }
}

function viewProdOrder(eventId) {
    if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('ViewProdOrder', [eventId]);
    }
}

function viewComponents(eventId) {
    const prodOrderNo = eventId.split('|')[0];
    if (typeof Microsoft !== 'undefined' && Microsoft.Dynamics && Microsoft.Dynamics.NAV) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('ViewComponents', [prodOrderNo]);
    }
}

// AL Interface Functions
function LoadEvents(jsonText) {
    try {
        const events = JSON.parse(jsonText);
        currentEvents = events;
        
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(events);
            console.log(`Loaded ${events.length} events`);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function SetRoutingText(msgText) {
    routingHtml = msgText;
    console.log('Routing data updated');
    
    // Show routing details in sidebar or popup
    showRoutingDetails(msgText);
}

function SetComponentText(msgText) {
    try {
        componentData = JSON.parse(msgText);
        console.log('Component data updated:', componentData);
        
        // Show component details in sidebar or popup
        showComponentDetails(componentData);
    } catch (error) {
        console.error('Error parsing component data:', error);
    }
}

function SwitchTheme(themeName) {
    switchTheme(themeName);
}

function ShowUndoSuccessToast(message) {
    showUndoSuccessToast(message);
}

// Show routing details
function showRoutingDetails(jsonText) {
    try {
        const routingData = JSON.parse(jsonText);
        
        const sidebar = document.querySelector('.routing-sidebar') || createSidebar('routing');
        sidebar.innerHTML = `
            <h3>Routing Details</h3>
            <div class="routing-content">
        `;
        
        routingData.forEach(routing => {
            sidebar.innerHTML += `
                <div class="routing-item">
                    <h4>${routing.title}</h4>
                    <p>Production Order: ${routing.prodOrderNo}</p>
                    <p>Line No: ${routing.lineNo}</p>
                    <p>Description: ${routing.description}</p>
                </div>
            `;
        });
        
        sidebar.innerHTML += `</div>`;
    } catch (error) {
        console.error('Error showing routing details:', error);
    }
}

// Show component details
function showComponentDetails(componentData) {
    const sidebar = document.querySelector('.component-sidebar') || createSidebar('component');
    sidebar.innerHTML = `
        <h3>Component Details</h3>
        <div class="component-content">
    `;
    
    componentData.forEach(component => {
        sidebar.innerHTML += `
            <div class="component-item">
                <h4>${component.ItemNo}</h4>
                <p>Description: ${component.Description}</p>
                <p>Quantity Per: ${component.QuantityPer}</p>
                <p>Due Date: ${component.DueDate}</p>
            </div>
        `;
    });
    
    sidebar.innerHTML += `</div>`;
}

// Create sidebar
function createSidebar(type) {
    const sidebar = document.createElement('div');
    sidebar.className = `${type}-sidebar sidebar`;
    document.body.appendChild(sidebar);
    return sidebar;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if FullCalendar is loaded
    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar library not loaded');
        return;
    }
    
    initializeCalendar();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCalendar);
} else {
    initializeCalendar();
}