// server/controllers/adminController.js
const User = require('../models/user');
const Course = require('../models/Course');
const CourseInterest = require('../models/CourseInterest');
const { sendCourseInterestStatusUpdate } = require('../services/emailService');
const { logSecurityEvent } = require('../utils/securityLogger');

module.exports = {
  // @route   GET /api/v1/admin/users
  // @desc    List all users
  // @access  Admin only
  async listUsers(req, res) {
    try {
      console.log('🔍 Admin: Listing all users');
      console.log('🔍 Admin: User making request:', req.user._id);
      
      const users = await User.find({})
        .select('-password -tokens');
      
      console.log('🔍 Admin: Found users:', users.length);
      users.forEach(user => {
        console.log(`   - ${user._id}: ${user.email} (${user.role})`);
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('🔍 Admin: Error listing users:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/users
  // @desc    Create new user
  // @access  Admin only
  async createUser(req, res) {
    try {
      // console.log('Admin createUser called with body:', req.body);
      
      // Validate required fields
      if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use. Please use a different email address.'
        });
      }

      // Prepare user data
      const userData = {
        name: `${req.body.firstName} ${req.body.lastName}`.trim(),
        email: req.body.email,
        password: req.body.password,
        role: req.body.role && ['admin', 'instructor', 'student'].includes(req.body.role) ? req.body.role : 'student',
        status: 'active', // Admin-created users are automatically active
        emailVerified: true, // Admin-created users are automatically verified
        // No verification status needed - users are verified by email only
        profileComplete: true
      };

      // Add optional fields if provided
      if (req.body.phone) userData.phone = req.body.phone;
      if (req.body.location) userData.location = req.body.location;

      // console.log('Prepared user data:', userData);

      // Create user
      const user = new User(userData);
      // console.log('User model instance created, attempting to save...');
      
      await user.save();
      // console.log('User saved successfully with ID:', user._id);

      // Remove sensitive data before sending response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.passwordConfirm;
      delete userResponse.tokens;

      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Admin createUser error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.errors) {
        console.error('Validation errors:', Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message,
          value: error.errors[key].value
        })));
      }
      
      // Handle specific validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Handle duplicate email error
      if (error.code === 11000 && error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  },

  // @route   GET /api/v1/admin/users/:userId
  // @desc    Get single user
  // @access  Admin only
  async getUser(req, res) {
    try {
      console.log('🔍 Admin: Getting user with ID:', req.params.userId);
      console.log('🔍 Admin: User making request:', req.user._id);
      
      const user = await User.findById(req.params.userId)
        .select('-password -tokens');

      console.log('🔍 Admin: Found user:', user ? user._id : 'null');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('🔍 Admin: Error getting user:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   PUT /api/v1/admin/users/:userId
  // @desc    Update user
  // @access  Admin only
  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      ).select('-password -tokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   DELETE /api/v1/admin/users/:userId
  // @desc    Delete user
  // @access  Admin only
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   GET /api/v1/admin/courses
  // @desc    List all courses
  // @access  Admin only
  async listCourses(req, res) {
    try {
      // console.log('Admin: Fetching all courses...');
      
      // Fetch ALL courses regardless of status - this should include your 6 courses
      const courses = await Course.find({})
        .sort({ createdAt: -1 });
      
      // console.log(`Admin: Found ${courses.length} courses:`, courses.map(c => ({ id: c._id, title: c.title, status: c.status })));
      
      // If no courses found, try to seed some
      if (courses.length === 0) {
        // console.log('No courses found, attempting to seed...');
        // You can run node seedCourses.js manually if needed
      }
      
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Admin: Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/courses
  // @desc    Create new course
  // @access  Admin only
  async createCourse(req, res) {
    try {
      // console.log('Creating course with data:', req.body);
      // console.log('User ID from token:', req.userId);
      
      // Remove level field if it exists (not in Course model)
      const { level, ...courseData } = req.body;
      
      // Ensure required fields are set with defaults and proper types
      const finalCourseData = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        image: courseData.image || 'https://via.placeholder.com/400x300?text=Course+Image',
        points: parseInt(courseData.points) || 0,
        price: parseInt(courseData.price) || 0,
        maxStudents: parseInt(courseData.maxStudents) || 100,
        duration: courseData.duration || '8-12 weeks',
        prerequisites: courseData.prerequisites || 'None',
        learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : [],
        tags: Array.isArray(courseData.tags) ? courseData.tags : [],
        waitlistEnabled: courseData.waitlistEnabled !== undefined ? courseData.waitlistEnabled : true,
        cohortStatus: courseData.cohortStatus || 'planning',
        cohortReadyThreshold: parseInt(courseData.cohortReadyThreshold) || 10,
        status: 'active', // Ensure course is active
        createdBy: req.userId
      };

      // console.log('Final course data:', finalCourseData);

      const course = new Course(finalCourseData);
      await course.save();

      // console.log('Course created successfully:', course._id);

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Create Course Error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.errors) {
        console.error('Validation errors:', Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message,
          value: error.errors[key].value
        })));
      }
      
      // Provide more detailed error messages
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   GET /api/v1/admin/courses/:courseId
  // @desc    Get single course
  // @access  Admin only
  async getCourse(req, res) {
    try {
      const course = await Course.findById(req.params.courseId)
        .populate('createdBy', 'name email');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   PUT /api/v1/admin/courses/:courseId
  // @desc    Update course
  // @access  Admin only
  async updateCourse(req, res) {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.courseId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   DELETE /api/v1/admin/courses/:courseId
  // @desc    Delete course
  // @access  Admin only
  async deleteCourse(req, res) {
    try {
      const course = await Course.findByIdAndDelete(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   GET /api/v1/admin/status
  // @desc    Get system status
  // @access  Admin only
  async getStatus(req, res) {
    try {
      const stats = {
        users: await User.countDocuments(),
        courses: await Course.countDocuments(),
        uptime: process.uptime()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/maintenance
  // @desc    Toggle maintenance mode
  // @access  Admin only
  async toggleMaintenance(req, res) {
    try {
      // Example maintenance mode toggle
      const { enabled } = req.body;
      // TODO: persist this setting somewhere (DB, config service, etc.)
      
      res.json({
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/test-user-creation
  // @desc    Test user creation with sample data
  // @access  Admin only
  async testUserCreation(req, res) {
    try {
      const testUserData = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "Test123!@#",
        role: "student"
      };

      const user = new User(testUserData);
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.passwordConfirm;
      delete userResponse.tokens;

      res.json({
        success: true,
        data: userResponse,
        message: 'Test user created successfully'
      });
    } catch (error) {
      console.error('Test user creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.toString()
      });
    }
  },

  // @route   GET /api/v1/admin/course-interests
  // @desc    Get all course interests
  // @access  Admin only
  async getCourseInterests(req, res) {
    try {
      const { status, courseId, page = 1, limit = 20 } = req.query;
      
      let query = {};
      if (status) query.status = status;
      if (courseId) query.courseId = courseId;

      const skip = (page - 1) * limit;
      
      const interests = await CourseInterest.find(query)
        .populate('courseId', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await CourseInterest.countDocuments(query);

      res.json({
        success: true,
        data: interests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   PUT /api/v1/admin/course-interests/:id
  // @desc    Update course interest status
  // @access  Admin only
  async updateCourseInterest(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes, adminResponse } = req.body;

      const interest = await CourseInterest.findByIdAndUpdate(
        id,
        {
          status,
          adminNotes,
          adminResponse,
          responseDate: new Date(),
          isContacted: status === 'contacted',
          contactDate: status === 'contacted' ? new Date() : undefined
        },
        { new: true, runValidators: true }
      );

      if (!interest) {
        return res.status(404).json({
          success: false,
          message: 'Course interest not found'
        });
      }

      // Send status update email
      try {
        await sendCourseInterestStatusUpdate(
          interest.email,
          interest.fullName,
          interest.courseTitle,
          status,
          adminResponse
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        data: interest,
        message: 'Course interest updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   DELETE /api/v1/admin/course-interests/:id
  // @desc    Delete course interest
  // @access  Admin only
  async deleteCourseInterest(req, res) {
    try {
      const { id } = req.params;
      
      const interest = await CourseInterest.findByIdAndDelete(id);

      if (!interest) {
        return res.status(404).json({
          success: false,
          message: 'Course interest not found'
        });
      }

      res.json({
        success: true,
        message: 'Course interest deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   PATCH /api/v1/admin/users/:userId/status
  // @desc    Update user status
  // @access  Admin only
  async updateUserStatus(req, res) {
    try {
      const { status } = req.body;
      
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, inactive, or suspended'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: status === 'active' },
        { new: true }
      ).select('-password -tokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User status updated successfully'
      });
    } catch (error) {
      console.error('Admin updateUserStatus error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user status'
      });
    }
  },

  // @route   PATCH /api/v1/admin/users/:userId/role
  // @desc    Update user role
  // @access  Admin only
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be student, instructor, or admin'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { role },
        { new: true }
      ).select('-password -tokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Admin updateUserRole error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user role'
      });
    }
  },

  /**
   * @desc    Get course waitlist
   * @route   GET /api/v1/admin/courses/:courseId/waitlist
   * @access  Admin only
   */
  async getCourseWaitlist(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);
      const Waitlist = require('../models/Waitlist');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const waitlist = await Waitlist.getCourseWaitlist(course._id);
      const waitlistStats = await course.getWaitlistStats();

      res.json({
        success: true,
        data: {
          course: {
            id: course._id,
            title: course.title,
            cohortStatus: course.cohortStatus,
            cohortReadyThreshold: course.cohortReadyThreshold,
            maxStudents: course.maxStudents
          },
          waitlist,
          stats: waitlistStats
        }
      });
    } catch (error) {
      console.error('Get Course Waitlist Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course waitlist'
      });
    }
  },

  /**
   * @desc    Start course cohort
   * @route   POST /api/v1/admin/courses/:courseId/start-cohort
   * @access  Admin only
   */
  async startCohort(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);
      const Waitlist = require('../models/Waitlist');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.cohortStatus !== 'ready') {
        return res.status(400).json({
          success: false,
          message: 'Cohort is not ready to start'
        });
      }

      // Get waitlist students
      const waitlistStudents = await Waitlist.find({
        course: course._id,
        status: 'waiting'
      }).populate('user', 'name email');

      if (waitlistStudents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No students on waitlist to start cohort'
        });
      }

      // Start the cohort
      await course.startCohort();

      // Notify waitlist students
      for (const waitlistEntry of waitlistStudents) {
        await waitlistEntry.notifyUser();
      }

      res.json({
        success: true,
        message: 'Cohort started successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          studentsNotified: waitlistStudents.length,
          cohortStartDate: course.cohortStartDate
        }
      });
    } catch (error) {
      console.error('Start Cohort Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start cohort'
      });
    }
  },

  /**
   * @desc    Complete course cohort
   * @route   POST /api/v1/admin/courses/:courseId/complete-cohort
   * @access  Admin only
   */
  async completeCohort(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.cohortStatus !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Cohort is not in progress'
        });
      }

      await course.completeCohort();

      res.json({
        success: true,
        message: 'Cohort completed successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          completionDate: new Date()
        }
      });
    } catch (error) {
      console.error('Complete Cohort Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete cohort'
      });
    }
  },

  /**
   * @desc    Open new cohort for course
   * @route   POST /api/v1/admin/courses/:courseId/open-cohort
   * @access  Admin only
   */
  async openNewCohort(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.cohortStatus === 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Cannot open new cohort while current one is in progress'
        });
      }

      await course.openNewCohort();

      res.json({
        success: true,
        message: 'New cohort opened successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          cohortStatus: course.cohortStatus
        }
      });
    } catch (error) {
      console.error('Open New Cohort Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to open new cohort'
      });
    }
  },

  /**
   * @desc    Update course cohort settings
   * @route   PUT /api/v1/admin/courses/:courseId/cohort-settings
   * @access  Admin only
   */
  async updateCohortSettings(req, res) {
    try {
      const { cohortReadyThreshold, waitlistEnabled } = req.body;
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Update cohort settings
      if (cohortReadyThreshold !== undefined) {
        course.cohortReadyThreshold = Math.max(1, parseInt(cohortReadyThreshold));
      }

      if (waitlistEnabled !== undefined) {
        course.waitlistEnabled = waitlistEnabled;
      }

      await course.save();

      res.json({
        success: true,
        message: 'Cohort settings updated successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          cohortReadyThreshold: course.cohortReadyThreshold,
          waitlistEnabled: course.waitlistEnabled
        }
      });
    } catch (error) {
      console.error('Update Cohort Settings Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cohort settings'
      });
    }
  },

  /**
   * @desc    Update course interest status
   * @route   PATCH /api/v1/admin/course-interests/:id/status
   * @access  Admin only
   */
  async updateCourseInterestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'reviewed', 'approved', 'rejected', 'contacted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, reviewed, approved, rejected, contacted'
        });
      }
      const updateData = { status };
      if (status === 'approved') {
        updateData.responseDate = new Date();
      }
      
      const courseInterest = await CourseInterest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('courseId', 'title category');

      if (!courseInterest) {
        return res.status(404).json({
          success: false,
          message: 'Course interest not found'
        });
      }

      console.log('✅ Course interest status updated to:', status);

      res.json({
        success: true,
        message: 'Course interest status updated successfully',
        data: courseInterest
      });
    } catch (error) {
      console.error('Update Course Interest Status Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course interest status'
      });
    }
  },

  // All verification functions removed - system is purely email-based
};
