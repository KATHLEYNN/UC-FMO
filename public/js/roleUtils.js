/**
 * Frontend Role Utility Functions for UC FMO System
 */

// Define all admin roles - keep this in sync with backend utils/roleUtils.js
const ADMIN_ROLES = [
  'master-admin',
  'citcs-admin', 
  'coa-admin',
  'cas-admin',
  'cba-admin',
  'cea-admin',
  'cht-admin',
  'con-admin',
  'cte-admin'
];

// Define user roles
const USER_ROLES = [
  'student',
  'external'
];

// All valid roles
const ALL_ROLES = [...ADMIN_ROLES, ...USER_ROLES];

/**
 * Check if a role is an admin role
 * @param {string} role - The role to check
 * @returns {boolean} - True if role is admin, false otherwise
 */
function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

/**
 * Check if a role is a user role (student or external)
 * @param {string} role - The role to check
 * @returns {boolean} - True if role is user, false otherwise
 */
function isUserRole(role) {
  return USER_ROLES.includes(role);
}

/**
 * Check if a role is valid
 * @param {string} role - The role to check
 * @returns {boolean} - True if role is valid, false otherwise
 */
function isValidRole(role) {
  return ALL_ROLES.includes(role);
}

/**
 * Get role display name
 * @param {string} role - The role
 * @returns {string} - Display name for the role
 */
function getRoleDisplayName(role) {
  const roleNames = {
    'master-admin': 'Master Administrator',
    'citcs-admin': 'CITCS Administrator',
    'coa-admin': 'COA Administrator',
    'cas-admin': 'CAS Administrator',
    'cba-admin': 'CBA Administrator',
    'cea-admin': 'CEA Administrator',
    'cht-admin': 'CHT Administrator',
    'con-admin': 'CON Administrator',
    'cte-admin': 'CTE Administrator',
    'student': 'Student',
    'external': 'External User'
  };
  
  return roleNames[role] || role;
}

/**
 * Get college/department from admin role
 * @param {string} role - The admin role
 * @returns {string} - College/department name
 */
function getCollegeFromRole(role) {
  const colleges = {
    'master-admin': 'All Colleges',
    'citcs-admin': 'College of Information Technology and Computer Science',
    'coa-admin': 'College of Accountancy',
    'cas-admin': 'College of Arts and Sciences',
    'cba-admin': 'College of Business Administration',
    'cea-admin': 'College of Engineering and Architecture',
    'cht-admin': 'College of Hospitality and Tourism',
    'con-admin': 'College of Nursing',
    'cte-admin': 'College of Teacher Education'
  };
  
  return colleges[role] || 'Unknown';
}

// Make functions available globally
window.ADMIN_ROLES = ADMIN_ROLES;
window.USER_ROLES = USER_ROLES;
window.ALL_ROLES = ALL_ROLES;
window.isAdminRole = isAdminRole;
window.isUserRole = isUserRole;
window.isValidRole = isValidRole;
window.getRoleDisplayName = getRoleDisplayName;
window.getCollegeFromRole = getCollegeFromRole;
