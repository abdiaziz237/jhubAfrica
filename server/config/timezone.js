// config/timezone.js
// Timezone configuration for JHUB Africa platform

const timezones = {
  // African timezones (primary focus)
  'Africa/Nairobi': {
    name: 'Nairobi (UTC+3)',
    offset: '+03:00',
    country: 'Kenya',
    isDefault: true
  },
  'Africa/Lagos': {
    name: 'Lagos (UTC+1)',
    offset: '+01:00',
    country: 'Nigeria',
    isDefault: false
  },
  'Africa/Cairo': {
    name: 'Cairo (UTC+2)',
    offset: '+02:00',
    country: 'Egypt',
    isDefault: false
  },
  'Africa/Johannesburg': {
    name: 'Johannesburg (UTC+2)',
    offset: '+02:00',
    country: 'South Africa',
    isDefault: false
  },
  'Africa/Casablanca': {
    name: 'Casablanca (UTC+0)',
    offset: '+00:00',
    country: 'Morocco',
    isDefault: false
  },
  'Africa/Algiers': {
    name: 'Algiers (UTC+1)',
    offset: '+01:00',
    country: 'Algeria',
    isDefault: false
  },
  
  // Additional African timezones
  'Africa/Addis_Ababa': {
    name: 'Addis Ababa (UTC+3)',
    offset: '+03:00',
    country: 'Ethiopia',
    isDefault: false
  },
  'Africa/Dar_es_Salaam': {
    name: 'Dar es Salaam (UTC+3)',
    offset: '+03:00',
    country: 'Tanzania',
    isDefault: false
  },
  'Africa/Kampala': {
    name: 'Kampala (UTC+3)',
    offset: '+03:00',
    country: 'Uganda',
    isDefault: false
  },
  'Africa/Khartoum': {
    name: 'Khartoum (UTC+2)',
    offset: '+02:00',
    country: 'Sudan',
    isDefault: false
  },
  'Africa/Tunis': {
    name: 'Tunis (UTC+1)',
    offset: '+01:00',
    country: 'Tunisia',
    isDefault: false
  }
};

// Get default timezone
const getDefaultTimezone = () => {
  return Object.keys(timezones).find(key => timezones[key].isDefault) || 'Africa/Nairobi';
};

// Get timezone info
const getTimezoneInfo = (timezone) => {
  return timezones[timezone] || timezones[getDefaultTimezone()];
};

// Get all available timezones
const getAllTimezones = () => {
  return timezones;
};

// Format current time in specified timezone
const formatTimeInTimezone = (timezone, date = new Date()) => {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error(`Error formatting time for timezone ${timezone}:`, error);
    // Fallback to default timezone
    return date.toLocaleString('en-US', {
      timeZone: getDefaultTimezone(),
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }
};

// Get current time in Nairobi timezone
const getNairobiTime = () => {
  return formatTimeInTimezone('Africa/Nairobi');
};

// Validate timezone
const isValidTimezone = (timezone) => {
  return timezones.hasOwnProperty(timezone);
};

module.exports = {
  timezones,
  getDefaultTimezone,
  getTimezoneInfo,
  getAllTimezones,
  formatTimeInTimezone,
  getNairobiTime,
  isValidTimezone
};
