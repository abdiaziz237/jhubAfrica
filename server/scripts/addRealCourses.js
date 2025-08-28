const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/user');

class RealCoursesSetup {
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

  async getInstructors() {
    try {
      const instructors = await User.find({ role: 'instructor' });
      console.log(`✅ Found ${instructors.length} instructors`);
      return instructors;
    } catch (error) {
      console.error('❌ Error fetching instructors:', error.message);
      return [];
    }
  }

  async createRealCourses() {
    try {
      console.log('📚 Creating real courses...\n');

      const instructors = await this.getInstructors();
      if (instructors.length === 0) {
        console.log('❌ No instructors found. Please run admin setup first.');
        return false;
      }

      // Get specific instructors by expertise
      const webDevInstructor = instructors.find(i => i.name === 'Aisha Bello');
      const dataScienceInstructor = instructors.find(i => i.name === 'David Okonkwo');
      const businessInstructor = instructors.find(i => i.name === 'Fatima Hassan');
      const cybersecurityInstructor = instructors.find(i => i.name === 'Chukwudi Eze');

      const realCourses = [
        {
          title: 'Digital Literacy Fundamentals',
          description: 'Master essential digital skills for the modern workplace. Learn computer basics, internet safety, Microsoft Office, and digital communication tools. Perfect for beginners and career changers.',
          category: 'Digital Literacy & Office Productivity',
          price: 25000,
          duration: '8 weeks',
          maxStudents: 50,
          createdBy: webDevInstructor._id,
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
          waitlistEnabled: true,
          cohortStatus: 'recruiting',
          cohortReadyThreshold: 15,
          modules: [
            {
              title: 'Computer Basics & Operating Systems',
              description: 'Introduction to computers, operating systems, and basic navigation',
              duration: '1 week',
              content: 'Learn about different types of computers, operating systems (Windows, Mac, Linux), and basic computer navigation.'
            },
            {
              title: 'Internet & Email Communication',
              description: 'Safe internet browsing, email setup, and online communication',
              duration: '1 week',
              content: 'Master internet safety, email etiquette, and effective online communication tools.'
            },
            {
              title: 'Microsoft Word & Document Creation',
              description: 'Professional document creation, formatting, and collaboration',
              duration: '1 week',
              content: 'Create professional documents, reports, and collaborative documents using Microsoft Word.'
            },
            {
              title: 'Microsoft Excel & Data Management',
              description: 'Spreadsheet basics, formulas, charts, and data analysis',
              duration: '1 week',
              content: 'Learn Excel fundamentals, create spreadsheets, use formulas, and analyze data.'
            },
            {
              title: 'Microsoft PowerPoint & Presentations',
              description: 'Creating engaging presentations and visual communication',
              duration: '1 week',
              content: 'Design professional presentations, use templates, and deliver effective presentations.'
            },
            {
              title: 'Digital Communication Tools',
              description: 'Video conferencing, collaboration platforms, and digital teamwork',
              duration: '1 week',
              content: 'Master Zoom, Teams, Slack, and other digital collaboration tools.'
            },
            {
              title: 'Online Safety & Cybersecurity',
              description: 'Protecting yourself online, password security, and privacy',
              duration: '1 week',
              content: 'Learn about online threats, password management, and protecting your digital identity.'
            },
            {
              title: 'Final Project & Certification',
              description: 'Apply all skills in a real-world project and earn certification',
              duration: '1 week',
              content: 'Complete a comprehensive project demonstrating all learned skills and earn your certificate.'
            }
          ],
          learningOutcomes: [
            'Navigate computers and operating systems confidently',
            'Use the internet safely and effectively',
            'Create professional documents and presentations',
            'Manage data using spreadsheets',
            'Collaborate online using digital tools',
            'Protect yourself from online threats',
            'Earn a recognized digital literacy certificate'
          ],
          requirements: [
            'Basic computer access',
            'Internet connection',
            'No prior experience required',
            'Commitment to 8 weeks of learning'
          ]
        },
        {
          title: 'Web Development Bootcamp',
          description: 'Complete web development course covering HTML, CSS, JavaScript, React, and modern development practices. Build real projects and launch your tech career.',
          category: 'Programming & App Development',
          price: 45000,
          duration: '12 weeks',
          maxStudents: 30,
          createdBy: webDevInstructor._id,
          image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
          waitlistEnabled: true,
          cohortStatus: 'recruiting',
          cohortReadyThreshold: 12,
          modules: [
            {
              title: 'HTML Fundamentals & Structure',
              description: 'Learn HTML basics, semantic markup, and document structure',
              duration: '1.5 weeks',
              content: 'Master HTML elements, semantic tags, forms, and accessibility best practices.'
            },
            {
              title: 'CSS Styling & Layout',
              description: 'CSS fundamentals, flexbox, grid, and responsive design',
              duration: '1.5 weeks',
              content: 'Learn CSS styling, modern layout techniques, and responsive design principles.'
            },
            {
              title: 'JavaScript Basics & DOM',
              description: 'JavaScript fundamentals, DOM manipulation, and event handling',
              duration: '2 weeks',
              content: 'Master JavaScript syntax, functions, objects, and DOM manipulation.'
            },
            {
              title: 'React Components & State',
              description: 'React fundamentals, components, hooks, and state management',
              duration: '2 weeks',
              content: 'Build interactive user interfaces using React components and hooks.'
            },
            {
              title: 'API Integration & Data Fetching',
              description: 'Working with APIs, async operations, and data management',
              duration: '1.5 weeks',
              content: 'Integrate external APIs, handle asynchronous operations, and manage application state.'
            },
            {
              title: 'Responsive Design & Mobile',
              description: 'Mobile-first design, progressive web apps, and optimization',
              duration: '1.5 weeks',
              content: 'Create mobile-responsive designs and optimize for performance.'
            },
            {
              title: 'Deployment & Hosting',
              description: 'Deploy applications, version control, and hosting platforms',
              duration: '1 week',
              content: 'Deploy your applications using Git, GitHub, and modern hosting platforms.'
            },
            {
              title: 'Final Project Portfolio',
              description: 'Build a complete web application and create your portfolio',
              duration: '1 week',
              content: 'Develop a full-stack web application and showcase your skills in a professional portfolio.'
            }
          ],
          learningOutcomes: [
            'Build responsive websites from scratch',
            'Create interactive web applications with React',
            'Integrate APIs and handle data',
            'Deploy applications to the web',
            'Understand modern web development practices',
            'Build a professional portfolio',
            'Prepare for web development careers'
          ],
          requirements: [
            'Basic computer skills',
            'Internet connection',
            'Commitment to 12 weeks of intensive learning',
            'Willingness to practice coding daily'
          ]
        },
        {
          title: 'Data Science & Python Programming',
          description: 'Learn Python programming, data analysis, machine learning fundamentals, and statistical analysis. Perfect for data-driven careers and research.',
          category: 'Programming & App Development',
          price: 55000,
          duration: '16 weeks',
          maxStudents: 25,
          createdBy: dataScienceInstructor._id,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
          waitlistEnabled: true,
          cohortStatus: 'recruiting',
          cohortReadyThreshold: 10,
          modules: [
            {
              title: 'Python Fundamentals',
              description: 'Python basics, data types, control structures, and functions',
              duration: '2 weeks',
              content: 'Learn Python syntax, data types, control flow, and function definition.'
            },
            {
              title: 'Data Structures & Algorithms',
              description: 'Lists, dictionaries, sets, and basic algorithms',
              duration: '2 weeks',
              content: 'Master Python data structures and implement basic algorithms.'
            },
            {
              title: 'Data Manipulation with Pandas',
              description: 'Data cleaning, transformation, and analysis with Pandas',
              duration: '2 weeks',
              content: 'Use Pandas for data manipulation, cleaning, and basic analysis.'
            },
            {
              title: 'Data Visualization',
              description: 'Creating charts, graphs, and interactive visualizations',
              duration: '2 weeks',
              content: 'Create compelling visualizations using Matplotlib, Seaborn, and Plotly.'
            },
            {
              title: 'Statistical Analysis',
              description: 'Descriptive statistics, hypothesis testing, and probability',
              duration: '2 weeks',
              content: 'Perform statistical analysis and interpret results.'
            },
            {
              title: 'Machine Learning Fundamentals',
              description: 'Supervised learning, classification, and regression',
              duration: '2 weeks',
              content: 'Introduction to machine learning algorithms and their applications.'
            },
            {
              title: 'Data Science Projects',
              description: 'Real-world data analysis projects and case studies',
              duration: '2 weeks',
              content: 'Work on real data science projects and case studies.'
            },
            {
              title: 'Capstone Project',
              description: 'Comprehensive data science project and presentation',
              duration: '2 weeks',
              content: 'Complete a comprehensive data science project and present your findings.'
            }
          ],
          learningOutcomes: [
            'Write Python code for data analysis',
            'Manipulate and clean data using Pandas',
            'Create compelling data visualizations',
            'Perform statistical analysis',
            'Apply machine learning algorithms',
            'Complete real data science projects',
            'Prepare for data science careers'
          ],
          requirements: [
            'Basic computer skills',
            'High school mathematics',
            'Commitment to 16 weeks of learning',
            'Interest in data and analytics'
          ]
        },
        {
          title: 'Business Communication & Entrepreneurship',
          description: 'Master business communication, entrepreneurship fundamentals, digital marketing, and business strategy. Launch your business career or start your own venture.',
          category: 'Business & Entrepreneurship',
          price: 35000,
          duration: '10 weeks',
          maxStudents: 40,
          createdBy: businessInstructor._id,
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
          waitlistEnabled: true,
          cohortStatus: 'recruiting',
          cohortReadyThreshold: 20,
          modules: [
            {
              title: 'Business Communication Fundamentals',
              description: 'Professional communication, writing, and presentation skills',
              duration: '1.5 weeks',
              content: 'Learn effective business communication, professional writing, and presentation techniques.'
            },
            {
              title: 'Entrepreneurship Basics',
              description: 'Business idea generation, validation, and planning',
              duration: '1.5 weeks',
              content: 'Develop business ideas, validate concepts, and create business plans.'
            },
            {
              title: 'Digital Marketing Strategy',
              description: 'Social media marketing, content marketing, and digital campaigns',
              duration: '2 weeks',
              content: 'Create digital marketing strategies and execute effective campaigns.'
            },
            {
              title: 'Business Strategy & Planning',
              description: 'Strategic planning, market analysis, and competitive positioning',
              duration: '2 weeks',
              content: 'Develop business strategies and analyze market opportunities.'
            },
            {
              title: 'Financial Management',
              description: 'Basic accounting, budgeting, and financial planning',
              duration: '1.5 weeks',
              content: 'Understand basic financial management and create budgets.'
            },
            {
              title: 'Business Launch & Growth',
              description: 'Starting your business, scaling, and growth strategies',
              duration: '1.5 weeks',
              content: 'Learn how to launch and grow your business successfully.'
            }
          ],
          learningOutcomes: [
            'Communicate professionally in business settings',
            'Develop and validate business ideas',
            'Create digital marketing campaigns',
            'Plan and execute business strategies',
            'Manage basic business finances',
            'Launch and grow businesses',
            'Build professional business networks'
          ],
          requirements: [
            'Basic computer skills',
            'Interest in business and entrepreneurship',
            'Commitment to 10 weeks of learning',
            'Willingness to participate in group activities'
          ]
        },
        {
          title: 'Cybersecurity & Network Security',
          description: 'Learn cybersecurity fundamentals, network security, ethical hacking, and security best practices. Protect systems and prepare for security careers.',
          category: 'Networking & IT Certifications',
          price: 60000,
          duration: '14 weeks',
          maxStudents: 20,
          createdBy: cybersecurityInstructor._id,
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
          waitlistEnabled: true,
          cohortStatus: 'recruiting',
          cohortReadyThreshold: 8,
          modules: [
            {
              title: 'Cybersecurity Fundamentals',
              description: 'Security principles, threats, and risk management',
              duration: '2 weeks',
              content: 'Understand cybersecurity fundamentals, threats, and risk management principles.'
            },
            {
              title: 'Network Security Basics',
              description: 'Network protocols, security, and monitoring',
              duration: '2 weeks',
              content: 'Learn network security fundamentals and monitoring techniques.'
            },
            {
              title: 'Operating System Security',
              description: 'Windows, Linux, and Mac security hardening',
              duration: '2 weeks',
              content: 'Harden operating systems and implement security best practices.'
            },
            {
              title: 'Web Application Security',
              description: 'Web vulnerabilities, OWASP Top 10, and secure coding',
              duration: '2 weeks',
              content: 'Identify and fix common web application vulnerabilities.'
            },
            {
              title: 'Ethical Hacking & Penetration Testing',
              description: 'Security testing, vulnerability assessment, and ethical hacking',
              duration: '2 weeks',
              content: 'Learn ethical hacking techniques and penetration testing methodologies.'
            },
            {
              title: 'Incident Response & Forensics',
              description: 'Security incident handling and digital forensics',
              duration: '2 weeks',
              content: 'Respond to security incidents and perform basic digital forensics.'
            },
            {
              title: 'Security Tools & Technologies',
              description: 'Security tools, SIEM, and threat intelligence',
              duration: '2 weeks',
              content: 'Use security tools and implement threat intelligence.'
            }
          ],
          learningOutcomes: [
            'Understand cybersecurity fundamentals',
            'Implement network security measures',
            'Harden operating systems',
            'Identify web vulnerabilities',
            'Perform ethical hacking',
            'Respond to security incidents',
            'Prepare for cybersecurity careers'
          ],
          requirements: [
            'Basic computer and networking knowledge',
            'Interest in security and technology',
            'Commitment to 14 weeks of intensive learning',
            'Ethical mindset and responsibility'
          ]
        }
      ];

      // Check if courses already exist
      const existingCourses = await Course.countDocuments();
      if (existingCourses > 0) {
        console.log(`⚠️  ${existingCourses} courses already exist. Skipping course creation.`);
        return false;
      }

      // Create courses
      for (const courseData of realCourses) {
        const course = new Course(courseData);
        await course.save();
        console.log(`✅ Created course: ${course.title}`);
      }

      console.log('\n🎉 Real courses setup completed successfully!');
      console.log(`📚 Total courses created: ${realCourses.length}`);
      
      return true;
    } catch (error) {
      console.error('❌ Course creation failed:', error.message);
      throw error;
    }
  }

  async verifySetup() {
    try {
      console.log('\n🔍 Verifying courses setup...\n');

      const courseCount = await Course.countDocuments();
      const courses = await Course.find({}, 'title category price maxStudents waitlistEnabled cohortReadyThreshold');

      console.log('📊 Courses Setup Results:');
      console.log('========================');
      console.log(`📚 Total Courses: ${courseCount}`);

      courses.forEach(course => {
        console.log(`\n${course.title}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Price: ₦${course.price.toLocaleString()}`);
        console.log(`   Max Students: ${course.maxStudents}`);
        console.log(`   Waitlist: ${course.waitlistEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Cohort Threshold: ${course.cohortReadyThreshold} students`);
      });

      if (courseCount >= 5) {
        console.log('\n✅ Courses setup validation passed');
        return true;
      } else {
        console.log('\n❌ Courses setup validation failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
  }

  async runFullSetup() {
    try {
      await this.createRealCourses();
      await this.verifySetup();

      console.log('\n🎉 Real courses setup completed successfully!');
      
      console.log('\n📝 Next Steps:');
      console.log('   1. Test course display on frontend');
      console.log('   2. Add real students to test waitlist');
      console.log('   3. Configure waitlist notifications');
      console.log('   4. Set up course enrollment process');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new RealCoursesSetup();
  
  setup.connect()
    .then(() => setup.runFullSetup())
    .then(() => setup.disconnect())
    .catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = RealCoursesSetup;
