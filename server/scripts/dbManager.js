#!/usr/bin/env node

/**
 * 🗄️ JHUB Africa Database Manager
 * Production-ready database management system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user');
const Course = require('../models/Course');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.backupDir = path.join(__dirname, '../backups');
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
      console.log(`📊 Database: ${this.connection.connection.name}`);
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async healthCheck() {
    try {
      console.log('\n🏥 Database Health Check\n');
      
      // Check connection
      if (mongoose.connection.readyState === 1) {
        console.log('🔌 Connection: Connected');
      } else {
        console.log('🔌 Connection: Disconnected');
        return false;
      }

      // Get database stats
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      console.log(`💾 Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)}MB`);
      
      // Get collection counts
      const userCount = await User.countDocuments();
      const courseCount = await Course.countDocuments();
      
      console.log(`👥 Users: ${userCount}`);
      console.log(`📚 Courses: ${courseCount}`);
      console.log(`📊 Collections: ${stats.collections}`);
      
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }

  async createBackup() {
    try {
      console.log('💾 Creating database backup...');
      
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const filePath = path.join(this.backupDir, filename);
      
      // Export data
      const users = await User.find({}).lean();
      const courses = await Course.find({}).lean();
      
      const backupData = {
        timestamp: new Date(),
        users,
        courses,
        metadata: {
          version: '1.0.0',
          totalUsers: users.length,
          totalCourses: courses.length
        }
      };
      
      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
      
      const stats = await fs.stat(filePath);
      console.log(`✅ Backup created: ${filename} (${Math.round(stats.size / 1024)}KB)`);
      
      return { filename, size: stats.size, timestamp: backupData.timestamp };
    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      return null;
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            filename: file,
            size: Math.round(stats.size / 1024),
            created: stats.birthtime
          });
        }
      }
      
      // Sort by creation date (newest first)
      backups.sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      return [];
    }
  }

  async restoreBackup(filename) {
    try {
      console.log(`🔄 Restoring backup: ${filename}`);
      
      const filePath = path.join(this.backupDir, filename);
      const backupData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      // Clear existing data
      await User.deleteMany({});
      await Course.deleteMany({});
      
      // Restore data
      if (backupData.users && backupData.users.length > 0) {
        await User.insertMany(backupData.users);
        console.log(`✅ Restored ${backupData.users.length} users`);
      }
      
      if (backupData.courses && backupData.courses.length > 0) {
        await Course.insertMany(backupData.courses);
        console.log(`✅ Restored ${backupData.courses.length} courses`);
      }
      
      console.log('✅ Backup restoration completed');
      return true;
    } catch (error) {
      console.error('❌ Backup restoration failed:', error.message);
      return false;
    }
  }

  async listUsers(role = null, limit = 20) {
    try {
      const query = role ? { role } : {};
      const users = await User.find(query)
        .select('name email role points isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      console.log(`\n👥 Users${role ? ` (${role})` : ''} (${users.length}):\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   📧 ${user.email}`);
        console.log(`   👤 ${user.role}`);
        console.log(`   ⭐ ${user.points} points`);
        console.log(`   ✅ ${user.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   📅 ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
      
      return users;
    } catch (error) {
      console.error('❌ Failed to list users:', error.message);
      return [];
    }
  }

  async listCourses(status = null, limit = 20) {
    try {
      const query = status ? { status } : {};
      const courses = await Course.find(query)
        .select('title category points maxStudents status cohortStatus cohortReadyThreshold waitlistEnabled createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      console.log(`\n📚 Courses${status ? ` (${status})` : ''} (${courses.length}):\n`);
      
      // Get enrollment and waitlist counts for each course
      const Enrollment = require('../models/Enrollment');
      const Waitlist = require('../models/Waitlist');
      
      for (const course of courses) {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
          status: { $in: ['active', 'completed'] }
        });
        
        const waitlistCount = await Waitlist.countDocuments({
          course: course._id,
          status: 'waiting'
        });
        
        console.log(`${courses.indexOf(course) + 1}. ${course.title}`);
        console.log(`   📂 ${course.category}`);
        console.log(`   ⭐ ${course.points} points`);
        console.log(`   👥 ${enrollmentCount}/${course.maxStudents} students`);
        console.log(`   📋 Waitlist: ${waitlistCount} (Threshold: ${course.cohortReadyThreshold})`);
        console.log(`   🚀 Cohort: ${course.cohortStatus}`);
        console.log(`   ✅ ${course.status}`);
        console.log(`   📅 ${course.createdAt.toLocaleDateString()}`);
        console.log('');
      }
      
      return courses;
    } catch (error) {
      console.error('❌ Failed to list courses:', error.message);
      return [];
    }
  }

  async showStats() {
    try {
      const userCount = await User.countDocuments();
      const courseCount = await Course.countDocuments();
      
      // Get enrollment stats from Enrollment model
      const Enrollment = require('../models/Enrollment');
      const enrollmentStats = await Enrollment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        }
      ]);

      // Get waitlist stats
      const Waitlist = require('../models/Waitlist');
      const waitlistStats = await Waitlist.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
            notified: { $sum: { $cond: [{ $eq: ['$status', 'notified'] }, 1, 0] } }
          }
        }
      ]);

      console.log('\n📊 Database Statistics:');
      console.log('========================');
      console.log(`👥 Users: ${userCount}`);
      console.log(`📚 Courses: ${courseCount}`);
      console.log(`📝 Total Enrollments: ${enrollmentStats[0]?.total || 0}`);
      console.log(`   Active: ${enrollmentStats[0]?.active || 0}`);
      console.log(`   Completed: ${enrollmentStats[0]?.completed || 0}`);
      console.log(`📋 Total Waitlist: ${waitlistStats[0]?.total || 0}`);
      console.log(`   Waiting: ${waitlistStats[0]?.waiting || 0}`);
      console.log(`   Notified: ${waitlistStats[0]?.notified || 0}`);

      return { 
        userCount, 
        courseCount, 
        totalEnrollments: enrollmentStats[0]?.total || 0,
        totalWaitlist: waitlistStats[0]?.total || 0
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      return { userCount: 0, courseCount: 0, totalEnrollments: 0, totalWaitlist: 0 };
    }
  }

  async cleanupBackups(daysToKeep = 30) {
    try {
      console.log(`🧹 Cleaning up backups older than ${daysToKeep} days...`);
      
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          const filePath = path.join(this.backupDir, backup.filename);
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`🗑️  Deleted: ${backup.filename}`);
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ Cleanup completed: ${deletedCount} backups deleted`);
      } else {
        console.log('✅ No old backups to clean up');
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      return 0;
    }
  }
}

// CLI Interface
async function showMenu() {
  console.log('\n🗄️  JHUB Africa Database Manager');
  console.log('================================\n');
  console.log('1. 🏥 Health Check');
  console.log('2. 💾 Create Backup');
  console.log('3. 📋 List Backups');
  console.log('4. 🔄 Restore Backup');
  console.log('5. 👥 List Users');
  console.log('6. 📚 List Courses');
  console.log('7. 📊 Show Statistics');
  console.log('8. 🧹 Cleanup Old Backups');
  console.log('0. 🚪 Exit\n');
}

async function main() {
  const manager = new DatabaseManager();
  
  if (!await manager.connect()) {
    process.exit(1);
  }
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
  
  try {
    while (true) {
      await showMenu();
      const choice = await question('Select option: ');
      
      switch (choice) {
        case '1':
          await manager.healthCheck();
          break;
          
        case '2':
          await manager.createBackup();
          break;
          
        case '3':
          const backups = await manager.listBackups();
          if (backups.length === 0) {
            console.log('❌ No backups found');
          } else {
            console.log('\n📋 Available backups:');
            backups.forEach((backup, index) => {
              console.log(`${index + 1}. ${backup.filename} (${backup.size}KB)`);
            });
          }
          break;
          
        case '4':
          const backupList = await manager.listBackups();
          if (backupList.length === 0) {
            console.log('❌ No backups available');
          } else {
            console.log('\n📋 Available backups:');
            backupList.forEach((backup, index) => {
              console.log(`${index + 1}. ${backup.filename} (${backup.size}KB)`);
            });
            
            const backupChoice = await question('Select backup to restore (number): ');
            const selectedBackup = backupList[parseInt(backupChoice) - 1];
            
            if (selectedBackup) {
              const confirm = await question(`Are you sure you want to restore ${selectedBackup.filename}? (y/N): `);
              if (confirm.toLowerCase() === 'y') {
                await manager.restoreBackup(selectedBackup.filename);
              }
            }
          }
          break;
          
        case '5':
          await manager.listUsers();
          break;
          
        case '6':
          await manager.listCourses();
          break;
          
        case '7':
          await manager.showStats();
          break;
          
        case '8':
          const days = await question('Enter days to keep (default 30): ');
          const daysToKeep = parseInt(days) || 30;
          await manager.cleanupBackups(daysToKeep);
          break;
          
        case '0':
          console.log('👋 Goodbye!');
          await manager.disconnect();
          rl.close();
          process.exit(0);
          
        default:
          console.log('❌ Invalid option. Please try again.');
      }
      
      if (choice !== '0') {
        await question('\nPress Enter to continue...');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    await manager.disconnect();
    rl.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;
