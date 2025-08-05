window.EventHandlers = {
    attachClickEvents: function (info) {
        const props = info.event.extendedProps || {};
        info.el.title = `📦 Order: ${props.prodOrderNo || ''}\n🔢 Line: ${props.lineNo || ''}\n📝 ${props.description || ''}`;

        let clickTimer = null;
        info.el.addEventListener("click", function () {
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("OpenEventPage", [info.event.id]);
            } else {
                clickTimer = setTimeout(() => {
                    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod("ViewEventDetail", [info.event.id]);
                    clickTimer = null;
                }, 300);
            }
        });
    }
};
