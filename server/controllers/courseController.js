const Course = require('../models/Course');
const User = require('../models/user');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

module.exports = {
  /**
   * @desc    Get all courses (listing only, no content)
   * @route   GET /api/v1/courses
   * @access  Public
   */
  async listCourses(req, res) {
    try {
      const { category, level, sort } = req.query;

      const query = {};
      if (category) query.category = category;
      if (level) query.level = level;

      const sortOptions = {};
      if (sort === 'newest') sortOptions.createdAt = -1;
      if (sort === 'highest-rated') sortOptions.averageRating = -1;

      const courses = await Course.find(query)
        .select('-content') // don’t send course content in list
        .sort(sortOptions)
        .populate('instructor', 'name email avatar');

      res.status(200).json({
        success: true,
        count: courses.length,
        courses,
      });
    } catch (err) {
      console.error('List Courses Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
      });
    }
  },

  /**
   * @desc    Get full course content
   * @route   GET /api/v1/courses/:id/content
   * @access  Public (or Private later)
   */
  async getCourseContent(req, res) {
    try {
      const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email avatar')
        .populate('reviews.user', 'name avatar');

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (err) {
      console.error('Get Course Content Error:', err);
      if (err instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course',
      });
    }
  },

  /**
   * @desc    Create course
   * @route   POST /api/v1/courses
   * @access  Private/Instructor
   */
  async createCourse(req, res) {
    try {
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only instructors can create courses');
      }

      const course = new Course({
        ...req.body,
        instructor: req.user.id,
      });

      await course.save();

      await User.findByIdAndUpdate(req.user.id, {
        $push: { coursesCreated: course._id },
      });

      res.status(201).json({
        success: true,
        course,
      });
    } catch (err) {
      console.error('Create Course Error:', err);
      if (err instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          message: err.message,
        });
      }
      res.status(400).json({
        success: false,
        message: 'Failed to create course',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  },

  /**
   * @desc    Update course
   * @route   PUT /api/v1/courses/:id
   * @access  Private/Instructor
   */
  async updateCourse(req, res) {
    try {
      let course = await Course.findById(req.params.id);

      if (!course) throw new NotFoundError('Course not found');

      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        throw new ForbiddenError('Not authorized to update this course');
      }

      course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        course,
      });
    } catch (err) {
      console.error('Update Course Error:', err);
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof ForbiddenError) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(400).json({ success: false, message: 'Failed to update course' });
    }
  },

  /**
   * @desc    Delete course
   * @route   DELETE /api/v1/courses/:id
   * @access  Private/Instructor
   */
  async deleteCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) throw new NotFoundError('Course not found');

      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        throw new ForbiddenError('Not authorized to delete this course');
      }

      await course.remove();

      await User.findByIdAndUpdate(course.instructor, {
        $pull: { coursesCreated: course._id },
      });

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (err) {
      console.error('Delete Course Error:', err);
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof ForbiddenError) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
  },

  /**
   * @desc    Enroll in course
   * @route   POST /api/v1/courses/:id/enroll
   * @access  Private/Student
   */
  async enrollCourse(req, res) {
    try {
      if (req.user.role !== 'student') {
        throw new ForbiddenError('Only students can enroll in courses');
      }

      const course = await Course.findById(req.params.id);
      if (!course) throw new NotFoundError('Course not found');

      if (course.students.includes(req.user.id)) {
        return res
          .status(400)
          .json({ success: false, message: 'Already enrolled in this course' });
      }

      course.students.push(req.user.id);
      await course.save();

      await User.findByIdAndUpdate(req.user.id, {
        $push: { coursesEnrolled: course._id },
      });

      res.status(200).json({ success: true, message: 'Enrolled successfully' });
    } catch (err) {
      console.error('Enroll Course Error:', err);
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof ForbiddenError) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Failed to enroll' });
    }
  },

  /**
   * @desc    Add course review
   * @route   POST /api/v1/courses/:id/reviews
   * @access  Private/Student
   */
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) throw new NotFoundError('Course not found');
      if (!course.students.includes(req.user.id)) {
        throw new ForbiddenError('You must enroll before reviewing');
      }

      const existingReview = course.reviews.find(
        (r) => r.user.toString() === req.user.id
      );
      if (existingReview) {
        return res
          .status(400)
          .json({ success: false, message: 'Already reviewed this course' });
      }

      const review = { user: req.user.id, rating, comment };
      course.reviews.push(review);

      course.averageRating =
        course.reviews.reduce((acc, r) => r.rating + acc, 0) /
        course.reviews.length;

      await course.save();

      res.status(201).json({ success: true, message: 'Review added' });
    } catch (err) {
      console.error('Add Review Error:', err);
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof ForbiddenError) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Failed to add review' });
    }
  },
};
