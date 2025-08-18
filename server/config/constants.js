module.exports = {
  ROLES: {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
  },
  PERMISSIONS: {
    ADMIN: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'courses:manage'
    ],
    INSTRUCTOR: [
      'courses:create',
      'courses:update',
      'students:manage'
    ],
    STUDENT: [
      'courses:enroll',
      'profile:manage'
    ]
  },
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME: 15 * 60 * 1000, // 15 minutes
    PASSWORD_RESET_EXPIRES: 10 * 60 * 1000 // 10 minutes
  },
  CACHE_KEYS: {
    USER_STATS: 'user-stats',
    COURSE_STATS: 'course-stats'
  }
};