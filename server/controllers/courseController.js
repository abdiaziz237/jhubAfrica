const Course = require('../models/Course');
const CourseInterest = require('../models/CourseInterest');
const { logSecurityEvent } = require('../utils/securityLogger');
const { sendCourseInterestConfirmation } = require('../services/emailService');
const mongoose = require('mongoose');

module.exports = {
  /**
   * @desc    Get all courses
   * @route   GET /api/v1/courses
   * @access  Public
   */
  async getAllCourses(req, res) {
    try {
      console.log('Public: Fetching active courses...');
      
      const courses = await Course.find({ status: 'active' })
        .sort({ createdAt: -1 });

      console.log(`Public: Found ${courses.length} active courses:`, courses.map(c => ({ id: c._id, title: c.title, status: c.status })));

      res.json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      console.error('Get Courses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }
  },

  /**
   * @desc    Get single course
   * @route   GET /api/v1/courses/:id
   * @access  Public
   */
  async getCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);

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
      console.error('Get Course Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course'
      });
    }
  },

  /**
   * @desc    Create new course
   * @route   POST /api/v1/courses
   * @access  Private (Admin/Instructor)
   */
  async createCourse(req, res) {
    try {
      const { title, description, category, image, points, price, maxStudents } = req.body;

      // Validate required fields
      if (!title || !description || !category || !image) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, category, and image are required'
        });
      }

      const course = new Course({
        title,
        description,
        category,
        image,
        points: points || 0,
        price: price || 0,
        maxStudents: maxStudents || 100,
        createdBy: req.userId
      });

      await course.save();

      logSecurityEvent('COURSE_CREATED', {
        userId: req.userId,
        courseId: course._id,
        courseTitle: course.title
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Create Course Error:', error);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create course'
      });
    }
  },

  /**
   * @desc    Update course
   * @route   PUT /api/v1/courses/:id
   * @access  Private (Admin/Instructor - creator only)
   */
  async updateCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if user is creator or admin
      if (course.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this course'
        });
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      logSecurityEvent('COURSE_UPDATED', {
        userId: req.userId,
        courseId: course._id,
        courseTitle: course.title
      });

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    } catch (error) {
      console.error('Update Course Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course'
      });
    }
  },

  /**
   * @desc    Delete course
   * @route   DELETE /api/v1/courses/:id
   * @access  Private (Admin/Instructor - creator only)
   */
  async deleteCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if user is creator or admin
      if (course.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this course'
        });
      }

      await Course.findByIdAndDelete(req.params.id);

      logSecurityEvent('COURSE_DELETED', {
        userId: req.userId,
        courseId: course._id,
        courseTitle: course.title
      });

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Delete Course Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete course'
      });
    }
  },

  /**
   * @desc    Enroll in course
   * @route   POST /api/v1/courses/:id/enroll
   * @access  Private
   */
  async enrollInCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      const Enrollment = require('../models/Enrollment');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if course is active
      if (course.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Course is not available for enrollment'
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: req.user.id,
        course: course._id
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check if course is full
      const enrollmentCount = await Enrollment.countDocuments({
        course: course._id,
        status: { $in: ['active', 'completed'] }
      });

      if (enrollmentCount >= course.maxStudents) {
        return res.status(409).json({
          success: false,
          message: 'Course is full'
        });
      }

      // Create new enrollment
      const enrollment = new Enrollment({
        student: req.user.id,
        course: course._id,
        status: 'active',
        progress: 0
      });

      await enrollment.save();

      // Award points to user
      const user = await User.findById(req.user.id);
      user.points += course.points;
      await user.save();

      logSecurityEvent('COURSE_ENROLLED', {
        userId: req.user.id,
        courseId: course._id,
        courseTitle: course.title,
        pointsEarned: course.points
      });

      res.json({
        success: true,
        message: 'Successfully enrolled in course',
        data: {
          courseId: course._id,
          enrollmentId: enrollment._id,
          pointsEarned: course.points,
          totalPoints: user.points
        }
      });
    } catch (error) {
      console.error('Enroll Course Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course'
      });
    }
  },

  /**
   * @desc    Unenroll from course
   * @route   DELETE /api/v1/courses/:id/enroll
   * @access  Private
   */
  async unenrollFromCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      const Enrollment = require('../models/Enrollment');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Find and remove enrollment
      const enrollment = await Enrollment.findOneAndDelete({
        student: req.user.id,
        course: course._id
      });

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: 'Not enrolled in this course'
        });
      }

      // Deduct points from user
      const user = await User.findById(req.user.id);
      user.points = Math.max(0, user.points - course.points);
      await user.save();

      logSecurityEvent('COURSE_UNENROLLED', {
        userId: req.user.id,
        courseId: course._id,
        courseTitle: course.title,
        pointsDeducted: course.points
      });

      res.json({
        success: true,
        message: 'Successfully unenrolled from course',
        data: {
          courseId: course._id,
          pointsDeducted: course.points,
          totalPoints: user.points
        }
      });
    } catch (error) {
      console.error('Unenroll Course Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unenroll from course'
      });
    }
  },

  /**
   * @desc    Get user's enrolled courses
   * @route   GET /api/v1/courses/enrolled
   * @access  Private
   */
  async getEnrolledCourses(req, res) {
    try {
      const Enrollment = require('../models/Enrollment');
      
      const enrollments = await Enrollment.find({
        student: req.user.id,
        status: { $in: ['active', 'completed'] }
      }).populate({
        path: 'course',
        select: 'title description category image points duration status'
      });

      const enrolledCourses = enrollments.map(enrollment => ({
        ...enrollment.course.toObject(),
        enrollmentId: enrollment._id,
        progress: enrollment.progress,
        enrollmentDate: enrollment.enrollmentDate,
        lastAccessed: enrollment.lastAccessed
      }));

      res.json({
        success: true,
        data: enrolledCourses
      });
    } catch (error) {
      console.error('Get Enrolled Courses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrolled courses'
      });
    }
  },

  /**
   * @desc    Get courses by category
   * @route   GET /api/v1/courses/category/:category
   * @access  Public
   */
  async getCoursesByCategory(req, res) {
    try {
      const { category } = req.params;
      const courses = await Course.find({
        category: category,
        status: 'active'
      });

      res.json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      console.error('Get Courses by Category Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses by category'
      });
    }
  },

  /**
   * @desc    Search courses
   * @route   GET /api/v1/courses/search
   * @access  Public
   */
  async searchCourses(req, res) {
    try {
      const { q, category, minPoints, maxPoints } = req.query;

      let query = { status: 'active' };

      // Text search
      if (q) {
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      // Category filter
      if (category && category !== 'all') {
        query.category = category;
      }

      // Points range filter
      if (minPoints || maxPoints) {
        query.points = {};
        if (minPoints) query.points.$gte = parseInt(minPoints);
        if (maxPoints) query.points.$lte = parseInt(maxPoints);
      }

      const courses = await Course.find(query)
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      console.error('Search Courses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search courses'
      });
    }
  },

  /**
   * @desc    Submit course interest
   * @route   POST /api/v1/courses/interest
   * @access  Public
   */
  async submitCourseInterest(req, res) {
    console.log('=== COURSE INTEREST SUBMISSION START ===');
    
    try {
      // Log the request
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', req.headers);
      
      // Extract and validate required fields
      const {
        courseId,
        courseTitle,
        fullName,
        email,
        phone,
        education,
        experience,
        motivation,
        preferredStartDate
      } = req.body;

      console.log('Extracted data:', {
        courseId,
        courseTitle,
        fullName,
        email,
        phone,
        education,
        experience,
        motivation,
        preferredStartDate
      });

      // Validate required fields
      const requiredFields = ['courseId', 'courseTitle', 'fullName', 'email', 'motivation'];
      const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
      
      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate courseId format (MongoDB ObjectId)
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('Invalid courseId format:', courseId);
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID format'
        });
      }

      console.log('Basic validation passed');

      // Check if course exists
      console.log('Finding course with ID:', courseId);
      const course = await Course.findById(courseId);
      if (!course) {
        console.log('Course not found:', courseId);
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      console.log('Course found:', course.title);

      // Check if user already submitted interest for this course
      console.log('Checking for duplicate interest...');
      const existingInterest = await CourseInterest.findOne({
        courseId,
        email
      });

      if (existingInterest) {
        console.log('Duplicate interest found for:', email, 'in course:', courseId);
        return res.status(400).json({
          success: false,
          message: 'You have already expressed interest in this course'
        });
      }
      console.log('No duplicate interest found');

      console.log('Creating new course interest...');

      // Debug: Check CourseInterest model
      console.log('CourseInterest model type:', typeof CourseInterest);
      console.log('CourseInterest schema fields:', Object.keys(CourseInterest.schema.paths));
      console.log('preferredStartDate field type:', CourseInterest.schema.paths.preferredStartDate?.instance);

      // Prepare course interest data with defaults
      const courseInterestData = {
        courseId,
        courseTitle: courseTitle.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        motivation: motivation.trim(),
        // Optional fields with defaults
        phone: phone ? phone.trim() : undefined,
        education: education || 'Other',
        experience: experience || 'No Experience',
        preferredStartDate: preferredStartDate && preferredStartDate.trim() !== '' ? preferredStartDate.trim() : undefined
      };

      console.log('Prepared course interest data:', courseInterestData);

      // Create new course interest
      console.log('Creating CourseInterest model...');
      const courseInterest = new CourseInterest(courseInterestData);
      console.log('Course interest model created successfully');

      // Save to database
      console.log('Attempting to save course interest...');
      await courseInterest.save();
      console.log('Course interest saved successfully with ID:', courseInterest._id);

      // Send confirmation email (non-blocking)
      try {
        // Check if email service is properly configured
        if (process.env.EMAIL_USER && process.env.BASE_URL) {
          console.log('Attempting to send confirmation email to:', email);
          await sendCourseInterestConfirmation(email, fullName, courseTitle);
          console.log('Confirmation email sent successfully');
        } else {
          console.log('Email service not configured, skipping email send');
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        console.error('Email error details:', {
          message: emailError.message,
          stack: emailError.stack,
          email: email,
          fullName: fullName,
          courseTitle: courseTitle
        });
        // Don't fail the request if email fails
      }

      // Log security event (non-blocking)
      try {
        // Check if security logger is properly configured
        if (process.env.LOGTAIL_SOURCE_TOKEN || process.env.NODE_ENV === 'development') {
          logSecurityEvent('COURSE_INTEREST_SUBMITTED', {
            courseId,
            courseTitle,
            email,
            fullName
          });
          console.log('Security event logged successfully');
        } else {
          console.log('Security logger not configured, skipping security event');
        }
      } catch (securityLogError) {
        console.error('Failed to log security event:', securityLogError);
        // Don't fail the request if security logging fails
      }

      console.log('Course interest submission completed successfully');

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Interest submitted successfully. Admin will review and contact you soon.',
        data: {
          id: courseInterest._id,
          status: courseInterest.status,
          submittedAt: courseInterest.createdAt
        }
      });

    } catch (error) {
      console.error('=== COURSE INTEREST SUBMISSION ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.errors) {
        console.error('Validation errors:', Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message,
          value: error.errors[key].value
        })));
      }
      
      // Return appropriate error response
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid data format provided'
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry found'
        });
      }
      
      // Generic error response
      res.status(500).json({
        success: false,
        message: 'Failed to submit interest. Please try again.'
      });
    }
  },

  /**
   * @desc    Get approved course interests for authenticated user
   * @route   GET /api/v1/courses/interest/approved
   * @access  Private
   */
  async getApprovedCourseInterests(req, res) {
    try {
      console.log('Getting approved course interests for user:', req.userId);
      
      // Find approved course interests for the authenticated user
      const approvedInterests = await CourseInterest.find({
        email: req.user.email,
        status: 'approved'
      }).populate('courseId', 'title description category image price');

      console.log(`Found ${approvedInterests.length} approved interests`);

      // Transform the data to include course information
      const transformedInterests = approvedInterests.map(interest => ({
        _id: interest._id,
        courseId: interest.courseId._id,
        courseTitle: interest.courseTitle,
        courseImage: interest.courseId?.image,
        courseDescription: interest.courseId?.description,
        courseCategory: interest.courseId?.category,
        coursePrice: interest.courseId?.price,
        fullName: interest.fullName,
        email: interest.email,
        status: interest.status,
        adminNotes: interest.adminNotes,
        adminResponse: interest.adminResponse,
        responseDate: interest.responseDate,
        submittedAt: interest.createdAt,
        updatedAt: interest.updatedAt
      }));

      res.json({
        success: true,
        count: transformedInterests.length,
        data: transformedInterests
      });

    } catch (error) {
      console.error('Get Approved Course Interests Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approved course interests'
      });
    }
  },

  /**
   * @desc    Join course waitlist
   * @route   POST /api/v1/courses/:id/waitlist
   * @access  Private
   */
  async joinWaitlist(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      const Waitlist = require('../models/Waitlist');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if course is active and waitlist is enabled
      if (!course.isWaitlistOpen()) {
        return res.status(400).json({
          success: false,
          message: 'Waitlist is not available for this course'
        });
      }

      // Check if already enrolled
      const Enrollment = require('../models/Enrollment');
      const existingEnrollment = await Enrollment.findOne({
        student: req.user.id,
        course: course._id
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check if already on waitlist
      const existingWaitlist = await Waitlist.findOne({
        user: req.user.id,
        course: course._id,
        status: { $in: ['waiting', 'notified'] }
      });

      if (existingWaitlist) {
        return res.status(400).json({
          success: false,
          message: 'Already on waitlist for this course'
        });
      }

      // Create waitlist entry
      const waitlistEntry = new Waitlist({
        user: req.user.id,
        course: course._id,
        status: 'waiting'
      });

      await waitlistEntry.save();

      // Get waitlist position
      const position = await Waitlist.countDocuments({
        course: course._id,
        joinDate: { $lt: waitlistEntry.joinDate },
        status: 'waiting'
      });

      logSecurityEvent('WAITLIST_JOINED', {
        userId: req.user.id,
        courseId: course._id,
        courseTitle: course.title,
        position: position + 1
      });

      res.json({
        success: true,
        message: 'Successfully joined waitlist',
        data: {
          courseId: course._id,
          waitlistId: waitlistEntry._id,
          position: position + 1,
          courseTitle: course.title
        }
      });
    } catch (error) {
      console.error('Join Waitlist Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to join waitlist'
      });
    }
  },

  /**
   * @desc    Leave course waitlist
   * @route   DELETE /api/v1/courses/:id/waitlist
   * @access  Private
   */
  async leaveWaitlist(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      const Waitlist = require('../models/Waitlist');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Find and remove waitlist entry
      const waitlistEntry = await Waitlist.findOneAndDelete({
        user: req.user.id,
        course: course._id,
        status: { $in: ['waiting', 'notified'] }
      });

      if (!waitlistEntry) {
        return res.status(400).json({
          success: false,
          message: 'Not on waitlist for this course'
        });
      }

      logSecurityEvent('WAITLIST_LEFT', {
        userId: req.user.id,
        courseId: course._id,
        courseTitle: course.title
      });

      res.json({
        success: true,
        message: 'Successfully left waitlist',
        data: {
          courseId: course._id,
          courseTitle: course.title
        }
      });
    } catch (error) {
      console.error('Leave Waitlist Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to leave waitlist'
      });
    }
  },

  /**
   * @desc    Get user's waitlist status
   * @route   GET /api/v1/courses/:id/waitlist
   * @access  Private
   */
  async getWaitlistStatus(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      const Waitlist = require('../models/Waitlist');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if user is on waitlist
      const waitlistEntry = await Waitlist.findOne({
        user: req.user.id,
        course: course._id,
        status: { $in: ['waiting', 'notified'] }
      });

      if (!waitlistEntry) {
        return res.json({
          success: true,
          data: {
            onWaitlist: false,
            courseId: course._id
          }
        });
      }

      // Get waitlist position
      const position = await Waitlist.countDocuments({
        course: course._id,
        joinDate: { $lt: waitlistEntry.joinDate },
        status: 'waiting'
      });

      res.json({
        success: true,
        data: {
          onWaitlist: true,
          courseId: course._id,
          waitlistId: waitlistEntry._id,
          position: position + 1,
          joinDate: waitlistEntry.joinDate,
          status: waitlistEntry.status,
          courseTitle: course.title
        }
      });
    } catch (error) {
      console.error('Get Waitlist Status Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get waitlist status'
      });
    }
  },

  /**
   * @desc    Get user's waitlisted courses
   * @route   GET /api/v1/courses/waitlisted
   * @access  Private
   */
  async getWaitlistedCourses(req, res) {
    try {
      const Waitlist = require('../models/Waitlist');
      
      const waitlistEntries = await Waitlist.find({
        user: req.user.id,
        status: { $in: ['waiting', 'notified'] }
      }).populate({
        path: 'course',
        select: 'title description category image points duration status cohortStatus'
      });

      const waitlistedCourses = waitlistEntries.map(entry => ({
        ...entry.course.toObject(),
        waitlistId: entry._id,
        waitlistPosition: entry.position,
        joinDate: entry.joinDate,
        waitlistStatus: entry.status
      }));

      res.json({
        success: true,
        data: waitlistedCourses
      });
    } catch (error) {
      console.error('Get Waitlisted Courses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch waitlisted courses'
      });
    }
  }
};
