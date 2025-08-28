const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

class RealAdminSetup {
  constructor() {
    this.connection = null;
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

  async createRealAdminUsers() {
    try {
      console.log('👑 Setting up real admin users...\n');

      // Check if admin users already exist
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log('⚠️  Admin user already exists. Skipping admin creation.');
        return false;
      }

      // Create primary admin user
      const adminPassword = await bcrypt.hash('JHUB-Admin-2024!@#', 12);
      const primaryAdmin = new User({
        name: 'JHUB Africa Administrator',
        email: 'admin@jhub.africa',
        password: adminPassword,
        role: 'admin',
        status: 'active',
        isActive: true,
        profile: {
          bio: 'Primary Platform Administrator',
          phone: '+234-800-JHUB-AFRICA',
          location: 'Lagos, Nigeria',
          website: 'https://jhub.africa',
          expertise: ['Platform Management', 'System Administration', 'User Management'],
          experience: '10+ years in e-learning platform management'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          passwordHistory: []
        }
      });

      await primaryAdmin.save();
      console.log('✅ Created Primary Admin: admin@jhub.africa');

      // Create secondary admin user
      const secondaryAdminPassword = await bcrypt.hash('JHUB-SecAdmin-2024!@#', 12);
      const secondaryAdmin = new User({
        name: 'Sarah Okechukwu',
        email: 'sarah.okechukwu@jhub.africa',
        password: secondaryAdminPassword,
        role: 'admin',
        status: 'active',
        isActive: true,
        profile: {
          bio: 'Senior Platform Administrator & Content Manager',
          phone: '+234-801-234-5678',
          location: 'Abuja, Nigeria',
          website: 'https://jhub.africa',
          expertise: ['Content Management', 'Course Administration', 'User Support'],
          experience: '8+ years in educational technology'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          passwordHistory: []
        }
      });

      await secondaryAdmin.save();
      console.log('✅ Created Secondary Admin: sarah.okechukwu@jhub.africa');

      // Create system operations admin
      const sysAdminPassword = await bcrypt.hash('JHUB-SysAdmin-2024!@#', 12);
      const sysAdmin = new User({
        name: 'Michael Adebayo',
        email: 'michael.adebayo@jhub.africa',
        password: sysAdminPassword,
        role: 'admin',
        status: 'active',
        isActive: true,
        profile: {
          bio: 'System Operations & Technical Administrator',
          phone: '+234-802-345-6789',
          location: 'Port Harcourt, Nigeria',
          website: 'https://jhub.africa',
          expertise: ['System Operations', 'Technical Support', 'Database Management'],
          experience: '12+ years in IT infrastructure and operations'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          passwordHistory: []
        }
      });

      await sysAdmin.save();
      console.log('✅ Created System Admin: michael.adebayo@jhub.africa');

      console.log('\n🎉 Real admin users setup completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Admin setup failed:', error.message);
      throw error;
    }
  }

  async createRealInstructors() {
    try {
      console.log('\n👨‍🏫 Setting up real instructor users...\n');

      // Check if instructor users already exist
      const existingInstructor = await User.findOne({ role: 'instructor' });
      if (existingInstructor) {
        console.log('⚠️  Instructor users already exist. Skipping instructor creation.');
        return false;
      }

      const instructorPassword = await bcrypt.hash('JHUB-Instructor-2024!@#', 12);

      // Create professional instructors
      const instructors = [
        {
          name: 'Aisha Bello',
          email: 'aisha.bello@jhub.africa',
          password: instructorPassword,
          role: 'instructor',
          status: 'active',
          isActive: true,
          profile: {
            bio: 'Senior Web Development & Digital Literacy Instructor',
            phone: '+234-803-456-7890',
            location: 'Kano, Nigeria',
            website: 'https://jhub.africa/instructors/aisha-bello',
            expertise: ['Web Development', 'JavaScript', 'React', 'Digital Literacy'],
            experience: '15+ years in software development and education',
            education: 'PhD Computer Science, University of Lagos',
            certifications: ['Microsoft Certified Educator', 'Google Certified Trainer']
          }
        },
        {
          name: 'David Okonkwo',
          email: 'david.okonkwo@jhub.africa',
          password: instructorPassword,
          role: 'instructor',
          status: 'active',
          isActive: true,
          profile: {
            bio: 'Data Science & Python Programming Expert',
            phone: '+234-804-567-8901',
            location: 'Enugu, Nigeria',
            website: 'https://jhub.africa/instructors/david-okonkwo',
            expertise: ['Data Science', 'Python', 'Machine Learning', 'Statistics'],
            experience: '18+ years in data analytics and academic research',
            education: 'PhD Mathematics, University of Ibadan',
            certifications: ['IBM Data Science Professional', 'AWS Machine Learning Specialist']
          }
        },
        {
          name: 'Fatima Hassan',
          email: 'fatima.hassan@jhub.africa',
          password: instructorPassword,
          role: 'instructor',
          status: 'active',
          isActive: true,
          profile: {
            bio: 'Business Communication & Entrepreneurship Specialist',
            phone: '+234-805-678-9012',
            location: 'Kaduna, Nigeria',
            website: 'https://jhub.africa/instructors/fatima-hassan',
            expertise: ['Business Communication', 'Entrepreneurship', 'Digital Marketing'],
            experience: '12+ years in business consulting and education',
            education: 'MBA Business Administration, Lagos Business School',
            certifications: ['Certified Business Communication Professional', 'Digital Marketing Institute']
          }
        },
        {
          name: 'Chukwudi Eze',
          email: 'chukwudi.eze@jhub.africa',
          password: instructorPassword,
          role: 'instructor',
          status: 'active',
          isActive: true,
          profile: {
            bio: 'Cybersecurity & Networking Infrastructure Expert',
            phone: '+234-806-789-0123',
            location: 'Anambra, Nigeria',
            website: 'https://jhub.africa/instructors/chukwudi-eze',
            expertise: ['Cybersecurity', 'Network Security', 'Cisco Technologies', 'Ethical Hacking'],
            experience: '14+ years in cybersecurity and network infrastructure',
            education: 'MSc Information Security, Covenant University',
            certifications: ['CISSP', 'CCNA Security', 'CEH', 'CompTIA Security+']
          }
        }
      ];

      for (const instructorData of instructors) {
        const instructor = new User(instructorData);
        await instructor.save();
        console.log(`✅ Created Instructor: ${instructorData.email}`);
      }

      console.log('\n🎉 Real instructor users setup completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Instructor setup failed:', error.message);
      throw error;
    }
  }

  async setupDatabaseIndexes() {
    try {
      console.log('\n🔧 Setting up database indexes...');

      // Create indexes for better performance
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ role: 1 });
      await User.collection.createIndex({ status: 1 });
      await User.collection.createIndex({ isActive: 1 });
      await User.collection.createIndex({ 'profile.expertise': 1 });

      console.log('✅ Database indexes created successfully');
      return true;
    } catch (error) {
      console.error('❌ Index creation failed:', error.message);
      return false;
    }
  }

  async verifySetup() {
    try {
      console.log('\n🔍 Verifying admin setup...\n');

      const adminCount = await User.countDocuments({ role: 'admin' });
      const instructorCount = await User.countDocuments({ role: 'instructor' });
      const totalUsers = await User.countDocuments();

      console.log('📊 Setup Verification Results:');
      console.log('============================');
      console.log(`👑 Admins: ${adminCount}`);
      console.log(`👨‍🏫 Instructors: ${instructorCount}`);
      console.log(`👥 Total Users: ${totalUsers}`);

      if (adminCount >= 3 && instructorCount >= 4) {
        console.log('\n✅ Admin setup validation passed');
        return true;
      } else {
        console.log('\n❌ Admin setup validation failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
  }

  async runFullSetup() {
    try {
      await this.createRealAdminUsers();
      await this.createRealInstructors();
      await this.setupDatabaseIndexes();
      await this.verifySetup();

      console.log('\n🎉 Real admin setup completed successfully!');
      
      console.log('\n🔐 Admin Login Credentials:');
      console.log('============================');
      console.log('Primary Admin: admin@jhub.africa / JHUB-Admin-2024!@#');
      console.log('Secondary Admin: sarah.okechukwu@jhub.africa / JHUB-SecAdmin-2024!@#');
      console.log('System Admin: michael.adebayo@jhub.africa / JHUB-SysAdmin-2024!@#');
      
      console.log('\n👨‍🏫 Instructor Login Credentials:');
      console.log('==================================');
      console.log('Web Dev: aisha.bello@jhub.africa / JHUB-Instructor-2024!@#');
      console.log('Data Science: david.okonkwo@jhub.africa / JHUB-Instructor-2024!@#');
      console.log('Business: fatima.hassan@jhub.africa / JHUB-Instructor-2024!@#');
      console.log('Cybersecurity: chukwudi.eze@jhub.africa / JHUB-Instructor-2024!@#');
      
      console.log('\n📝 Next Steps:');
      console.log('   1. Test admin login credentials');
      console.log('   2. Create real courses with these instructors');
      console.log('   3. Set up waitlist thresholds');
      console.log('   4. Configure platform settings');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new RealAdminSetup();
  
  setup.connect()
    .then(() => setup.runFullSetup())
    .then(() => setup.disconnect())
    .catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = RealAdminSetup;
