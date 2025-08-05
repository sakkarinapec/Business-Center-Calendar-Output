// utilities.js - Utility functions and AL integration methods

// Register AL methods
Microsoft.Dynamics.NAV.RegisterAddInMethod("SetComponentText", SetComponentText);
Microsoft.Dynamics.NAV.RegisterAddInMethod("ShowUndoSuccessToast", ShowUndoSuccessToast);

// Additional utility functions can be added here as needed
function formatDate(dateString) {
  if (!dateString) return "(ไม่มีวันที่)";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH");
  } catch (e) {
    return "(รูปแบบวันที่ไม่ถูกต้อง)";
  }
}

function formatTime(timeString) {
  if (!timeString) return "(ไม่มีเวลา)";
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'});
  } catch (e) {
    return "(รูปแบบเวลาไม่ถูกต้อง)";
  }
}

function safeJsonParse(jsonString, defaultValue = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON parsing error:", e);
    return defaultValue;
  }
}

// Debug helper function
function debugLog(message, data = null) {
  if (window.console && window.console.log) {
    if (data) {
      console.log(`[Calendar Debug] ${message}:`, data);
    } else {
      console.log(`[Calendar Debug] ${message}`);
    }
  }
}

// Error handling helper
function handleError(operation, error) {
  console.error(`Error in ${operation}:`, error);
  // Could show user-friendly error message here
}