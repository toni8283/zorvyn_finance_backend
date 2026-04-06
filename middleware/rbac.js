const { ForbiddenError } = require('../utils/errors');

const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  VIEW_RECORDS: [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.ANALYST, ROLES.ADMIN],
  CREATE_RECORD: [ROLES.ADMIN],
  UPDATE_RECORD: [ROLES.ADMIN],
  DELETE_RECORD: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN]
};

const checkPermission = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role '${req.user.role}' is not authorized for this action`));
    }

    next();
  };
};

// Shorthand guards used by the route files.
const requireViewer = checkPermission(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN);
const requireAnalyst = checkPermission(ROLES.ANALYST, ROLES.ADMIN);
const requireAdmin = checkPermission(ROLES.ADMIN);

// Non-admins should only be able to look at their own records.
const canAccessUserData = (req, res, next) => {
  const targetUserId = parseInt(req.params.userId) || req.query.userId;
  
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }
  
  if (targetUserId && targetUserId !== req.user.id) {
    return next(new ForbiddenError('You can only access your own data'));
  }
  
  next();
};

module.exports = {
  ROLES,
  PERMISSIONS,
  checkPermission,
  requireViewer,
  requireAnalyst,
  requireAdmin,
  canAccessUserData
};
