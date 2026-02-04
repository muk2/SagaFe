/**
 * Format time string to 12-hour format
 * @param {string} timeString - Time in format "HH:MM:SS" or "HH:MM"
 * @returns {string} Formatted time like "8:00 AM"
 */
export const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Handle if it's already formatted (contains AM/PM)
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    // Parse HH:MM:SS or HH:MM format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    
    // Convert to 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minute} ${period}`;
  };

  export const formatToEastern = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  /**
 * Convert various date formats to YYYY-MM-DD for HTML date inputs
 * @param {string} dateStr - Date in MM/DD/YYYY, YYYY-MM-DD, or ISO format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const toDateInputFormat = (dateStr) => {
    if (!dateStr) return '';
    
    // Already in correct format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    // Convert MM/DD/YYYY to YYYY-MM-DD
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try parsing as Date object (handles ISO format, etc.)
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Invalid date format:', dateStr);
    }
    
    return '';
  };

 