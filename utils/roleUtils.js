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


const USER_ROLES = [
  'student',
  'external'
];


const ALL_ROLES = [...ADMIN_ROLES, ...USER_ROLES];

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}


function isUserRole(role) {
  return USER_ROLES.includes(role);
}

function isValidRole(role) {
  return ALL_ROLES.includes(role);
}


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

module.exports = {
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  isAdminRole,
  isUserRole,
  isValidRole,
  getRoleDisplayName,
  getCollegeFromRole
};
