// controllers/index.js
const User = require('../models/user');
const Course = require('../models/Course');

module.exports = {
  // Admin Controller
  adminController: {
    listUsers: async (req, res, next) => {
      try {
        const { page = 1, limit = 10, role, search } = req.query;
        
        const filter = {};
        if (role) filter.role = role;
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }

        const users = await User.find(filter)
          .select('-password -__v')
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ createdAt: -1 });

        const count = await User.countDocuments(filter);

        res.json({
          success: true,
          data: users,
          pagination: {
            total: count,
            page: +page,
            limit: +limit,
            totalPages: Math.ceil(count / limit)
          }
        });
      } catch (err) {
        next(err);
      }
    },

    createUser: async (req, res, next) => {
      try {
        const user = new User(req.body);
        await user.save();
        
        res.status(201).json({
          success: true,
          data: user.toObject({ versionKey: false })
        });
      } catch (err) {
        next(err);
      }
    }
  },

  // Course Controller
  courseController: {
    listCourses: async (req, res, next) => {
      try {
        const { page = 1, limit = 10, category, status } = req.query;
        
        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;

        const courses = await Course.find(filter)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ createdAt: -1 });

        const count = await Course.countDocuments(filter);

        res.json({
          success: true,
          data: courses,
          pagination: {
            total: count,
            page: +page,
            limit: +limit,
            totalPages: Math.ceil(count / limit)
          }
        });
      } catch (err) {
        next(err);
      }
    }
  },

  // Dashboard Controller
  dashboardController: {
    getStats: async (req, res, next) => {
      try {
        const stats = {
          users: await User.countDocuments(),
          courses: await Course.countDocuments(),
          activeCourses: await Course.countDocuments({ status: 'active' })
        };
        res.json({ success: true, data: stats });
      } catch (err) {
        next(err);
      }
    }
  },

  // System Controller
  systemController: {
    getStatus: (req, res) => {
      res.json({ 
        success: true, 
        data: { 
          status: 'operational',
          version: process.env.npm_package_version,
          environment: process.env.NODE_ENV
        }
      });
    },
    
    toggleMaintenance: async (req, res, next) => {
      try {
        // Your maintenance mode toggle logic here
        res.json({ success: true, data: { maintenance: true } });
      } catch (err) {
        next(err);
      }
    }
  }
};