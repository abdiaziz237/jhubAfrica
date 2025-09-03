import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import config from '../../config';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [interestForm, setInterestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    motivation: '',
    preferredStartDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showInterestModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showInterestModal]);

  // Handle escape key to close modal 
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showInterestModal) {
        closeInterestModal();
      }
    };

    if (showInterestModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showInterestModal]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Debug courses state changes
  useEffect(() => {
    console.log('🎯 Courses state updated:', courses.length, 'courses');
    if (courses.length > 0) {
      console.log('🎯 First course in state:', courses[0]);
      console.log('🎯 First course ID in state:', courses[0]?._id);
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const apiUrl = `${config.API_BASE_URL}/v1/courses`;
      console.log('🎯 Fetching courses from:', apiUrl);
      console.log('🎯 Config API_BASE_URL:', config.API_BASE_URL);
      
      const response = await axios.get(apiUrl);
      
      console.log('🎯 Courses API response:', response.data);
      console.log('🎯 Response structure:', {
        hasData: !!response.data,
        hasDataData: !!(response.data && response.data.data),
        isArray: Array.isArray(response.data),
        dataType: typeof response.data
      });
      
      if (response.data && response.data.data) {
        console.log('🎯 Using response.data.data:', response.data.data);
        console.log('🎯 First course ID:', response.data.data[0]?._id);
        setCourses(response.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('🎯 Using response.data directly:', response.data);
        console.log('🎯 First course ID:', response.data[0]?._id);
        setCourses(response.data);
      } else {
        // Fallback sample data
        setCourses([
          {
            _id: '1',
            title: 'IC3 Digital Literacy Certification - eCourse',
            description: 'Master the essential skills needed for the IC3 Digital Literacy Certification with this comprehensive eCourse.',
            category: 'Digital Literacy & Office Productivity',
            image: '/assets/images/ic3.jpg',
            points: 250,
            price: 0,
            maxStudents: 100,
            enrolledStudents: [],
            status: 'active'
          },
          {
            _id: '2',
            title: 'Communication Skills for Business (CSB) - eCourse',
            description: 'Master the communication skills that are essential in every business sector with this comprehensive eCourse.',
            category: 'Business & Entrepreneurship',
            image: '/assets/images/communication.jpg',
            points: 200,
            price: 0,
            maxStudents: 80,
            enrolledStudents: [],
            status: 'active'
          },
          {
            _id: '3',
            title: 'Cisco Certified Support Technician (CCST) - Networking Fundamentals Course',
            description: 'Kickstart your career as a Cisco Certified Support Technician (CCST) with this hands-on, comprehensive eCourse.',
            category: 'Networking & IT Certifications',
            image: '/assets/images/cisco.jpg',
            points: 350,
            price: 0,
            maxStudents: 60,
            enrolledStudents: [],
            status: 'active'
          },
          {
            _id: '4',
            title: 'Cisco Certified Support Technician (CCST) - Practice Tests',
            description: 'Prepare for the Cisco Certified Support Technician (CCST) certification with these comprehensive practice tests.',
            category: 'Networking & IT Certifications',
            image: '/assets/images/app.jpg',
            points: 300,
            price: 0,
            maxStudents: 60,
            enrolledStudents: [],
            status: 'active'
          },
          {
            _id: '5',
            title: 'Swift 1 - App Development with Swift',
            description: 'Learn to build real iOS applications from the ground up using Apple\'s powerful Swift programming language.',
            category: 'Programming & App Development',
            image: '/assets/images/swift.jpg',
            points: 400,
            price: 0,
            maxStudents: 50,
            enrolledStudents: [],
            status: 'active'
          },
          {
            _id: '6',
            title: 'Swift 1 - Apple Swift Certification Exam + Practice Test',
            description: 'Validate your Swift programming skills with Apple\'s official certification.',
            category: 'Programming & App Development',
            image: '/assets/images/networking.jpg',
            points: 450,
            price: 0,
            maxStudents: 40,
            enrolledStudents: [],
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.log('🎯 Using fallback data due to API error');
      // Use fallback data on error
      setCourses([
        {
          _id: '1',
          title: 'IC3 Digital Literacy Certification - eCourse',
          description: 'Master the essential skills needed for the IC3 Digital Literacy Certification with this comprehensive eCourse.',
          category: 'Digital Literacy & Office Productivity',
          image: '/assets/images/ic3.jpg',
          points: 250,
          price: 0,
          maxStudents: 100,
          enrolledStudents: [],
          status: 'active'
        },
        {
          _id: '2',
          title: 'Communication Skills for Business (CSB) - eCourse',
          description: 'Master the communication skills that are essential in every business sector with this comprehensive eCourse.',
          category: 'Business & Entrepreneurship',
          image: '/assets/images/communication.jpg',
          points: 200,
          price: 0,
          maxStudents: 80,
          enrolledStudents: [],
          status: 'active'
        },
        {
          _id: '3',
          title: 'Cisco Certified Support Technician (CCST) - Networking Fundamentals Course',
          description: 'Kickstart your career as a Cisco Certified Support Technician (CCST) with this hands-on, comprehensive eCourse.',
          category: 'Networking & IT Certifications',
          image: '/assets/images/cisco.jpg',
          points: 350,
          price: 0,
          maxStudents: 60,
          enrolledStudents: [],
          status: 'active'
        },
        {
          _id: '4',
          title: 'Cisco Certified Support Technician (CCST) - Practice Tests',
          description: 'Prepare for the Cisco Certified Support Technician (CCST) certification with these comprehensive practice tests.',
          category: 'Networking & IT Certifications',
          image: '/assets/images/app.jpg',
          points: 300,
          price: 0,
          maxStudents: 60,
          enrolledStudents: [],
          status: 'active'
        },
        {
          _id: '5',
          title: 'Swift 1 - App Development with Swift',
          description: 'Learn to build real iOS applications from the ground up using Apple\'s powerful Swift programming language.',
          category: 'Programming & App Development',
          image: '/assets/images/swift.jpg',
          points: 400,
          price: 0,
          maxStudents: 50,
          enrolledStudents: [],
          status: 'active'
        },
        {
          _id: '6',
          title: 'Swift 1 - Apple Swift Certification Exam + Practice Test',
          description: 'Validate your Swift programming skills with Apple\'s official certification.',
          category: 'Programming & App Development',
          image: '/assets/images/networking.jpg',
          points: 450,
          price: 0,
          maxStudents: 40,
          enrolledStudents: [],
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowInterest = (course) => {
    setSelectedCourse(course);
    setShowInterestModal(true);
  };

  const closeInterestModal = () => {
    setShowInterestModal(false);
    setSelectedCourse(null);
    setInterestForm({
      fullName: '',
      email: '',
      phone: '',
      education: '',
      experience: '',
      motivation: '',
      preferredStartDate: ''
    });
    setFormErrors({});
    setCurrentStep(1);
    setShowSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterestForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!interestForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!interestForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(interestForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!interestForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!interestForm.education) {
      errors.education = 'Education level is required';
    }
    
    if (!interestForm.experience) {
      errors.experience = 'Experience level is required';
    }
    
    if (!interestForm.motivation.trim()) {
      errors.motivation = 'Motivation is required';
    } else if (interestForm.motivation.trim().length < 20) {
      errors.motivation = 'Motivation must be at least 20 characters';
    }
    
    if (!interestForm.preferredStartDate) {
      errors.preferredStartDate = 'Preferred start date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/v1/courses/interest`, {
        courseId: selectedCourse._id,
        courseTitle: selectedCourse.title,
        ...interestForm
      });
      
      if (response.data.success) {
        setShowSuccess(true);
      } else {
        throw new Error(response.data.message || 'Failed to submit interest');
      }
    } catch (error) {
      console.error('Error submitting interest:', error);
      
      let errorMessage = 'Failed to submit interest. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses based on search term and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="courses-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Hero Section */}
      <div className="courses-hero">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>Professional Certifications</span>
          </div>
          <h1>Choose Your Learning Path</h1>
          <p>Browse our comprehensive catalog of industry-recognized certifications and find the perfect course to advance your career</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">6+</span>
              <span className="stat-label">Course Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Online Learning</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Access Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="courses-main">
        <div className="content-container">
          {/* Course Categories Overview */}
          <div className="categories-overview">
            <h2>Explore Our Course Categories</h2>
            <div className="categories-grid">
              <div className="category-card">
                <div className="category-icon">
                  <i className="fas fa-laptop-code"></i>
                </div>
                <h3>Digital Literacy & Office Productivity</h3>
                <p>Master essential computer skills and office applications</p>
                <span className="course-count">1 Course Available</span>
              </div>
              <div className="category-card">
                <div className="category-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3>Business & Entrepreneurship</h3>
                <p>Develop professional communication and business skills</p>
                <span className="course-count">1 Course Available</span>
              </div>
              <div className="category-card">
                <div className="category-icon">
                  <i className="fas fa-network-wired"></i>
                </div>
                <h3>Networking & IT Certifications</h3>
                <p>Build expertise in networking and IT infrastructure</p>
                <span className="course-count">2 Courses Available</span>
              </div>
              <div className="category-card">
                <div className="category-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>Programming & App Development</h3>
                <p>Learn to build mobile and web applications</p>
                <span className="course-count">2 Courses Available</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="courses-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Discover your perfect certification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="Digital Literacy & Office Productivity">Digital Literacy & Office Productivity</option>
              <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
              <option value="Networking & IT Certifications">Networking & IT Certifications</option>
              <option value="Programming & App Development">Programming & App Development</option>
            </select>
          </div>

          <div className="courses-intro">
            <h2>Available Courses</h2>
            <p>Select from our carefully curated collection of professional certification courses. Each course is designed to provide practical skills and industry-recognized credentials.</p>
          </div>

          {/* Professional Courses Grid */}
          <div className="courses-grid">
            {filteredCourses.map((course, index) => (
              <div key={course._id || index} className="course-card">
                {/* Category Badge */}
                <div className="course-category">
                  {course.category?.toUpperCase() || 'COURSE CATEGORY'}
                </div>
                
                {/* Course Image */}
                <div className="course-image-wrapper">
                  <img 
                    src={course.image || `/assets/images/ic3.jpg`} 
                    alt={course.title} 
                    className="course-image" 
                    onError={(e) => {
                      e.target.src = '/assets/images/ic3.jpg';
                    }}
                  />
                  <div className="image-overlays">
                    <div className="online-badge">ONLINE</div>
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-actions">
                    <button className="interest-button" onClick={() => handleShowInterest(course)}>
                      <i className="fas fa-arrow-right"></i>
                      Express Interest
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="no-courses">
              <i className="fas fa-search"></i>
              <h3>No courses found</h3>
              <p>Try adjusting your search or category filter to discover amazing opportunities!</p>
            </div>
          )}
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="modal-overlay" onClick={closeInterestModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {!showSuccess ? (
              <>
                <div className="modal-header">
                  <h3>Express Interest in {selectedCourse?.title}</h3>
                  <button className="close-btn" onClick={closeInterestModal}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {/* Progress Indicator */}
                <div className="form-progress">
                  <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-number">1</div>
                    <span>Personal Info</span>
                  </div>
                  <div className="progress-line"></div>
                  <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <span>Background</span>
                  </div>
                </div>
                
                <form onSubmit={handleSubmitInterest}>
                  {currentStep === 1 && (
                    <div className="form-step">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={interestForm.fullName}
                          onChange={handleInputChange}
                          className={formErrors.fullName ? 'error' : ''}
                          placeholder="Enter your full name"
                        />
                        {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={interestForm.email}
                          onChange={handleInputChange}
                          className={formErrors.email ? 'error' : ''}
                          placeholder="Enter your email address"
                        />
                        {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={interestForm.phone}
                          onChange={handleInputChange}
                          className={formErrors.phone ? 'error' : ''}
                          placeholder="Enter your phone number"
                        />
                        {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
                      </div>
                      <div className="form-actions">
                        <button type="button" onClick={handleNextStep} className="next-btn">
                          Next Step <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {currentStep === 2 && (
                    <div className="form-step">
                      <div className="form-group">
                        <label htmlFor="education">Highest Education Level</label>
                        <select
                          id="education"
                          name="education"
                          value={interestForm.education}
                          onChange={handleInputChange}
                          className={formErrors.education ? 'error' : ''}
                        >
                          <option value="">Select Education Level</option>
                          <option value="High School">High School</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                        {formErrors.education && <p className="error-message">{formErrors.education}</p>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="experience">Work Experience</label>
                        <select
                          id="experience"
                          name="experience"
                          value={interestForm.experience}
                          onChange={handleInputChange}
                          className={formErrors.experience ? 'error' : ''}
                        >
                          <option value="">Select Experience Level</option>
                          <option value="No Experience">No Experience</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                        {formErrors.experience && <p className="error-message">{formErrors.experience}</p>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="motivation">Why are you interested in this course?</label>
                        <textarea
                          id="motivation"
                          name="motivation"
                          value={interestForm.motivation}
                          onChange={handleInputChange}
                          rows="3"
                          className={formErrors.motivation ? 'error' : ''}
                          placeholder="Tell us about your motivation and goals (minimum 20 characters)..."
                        ></textarea>
                        {formErrors.motivation && <p className="error-message">{formErrors.motivation}</p>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="preferredStartDate">Preferred Start Date</label>
                        <select
                          id="preferredStartDate"
                          name="preferredStartDate"
                          value={interestForm.preferredStartDate}
                          onChange={handleInputChange}
                          className={formErrors.preferredStartDate ? 'error' : ''}
                        >
                          <option value="">Select Preferred Start Date</option>
                          <option value="As soon as possible">As soon as possible</option>
                          <option value="Next month">Next month</option>
                          <option value="In 2-3 months">In 2-3 months</option>
                          <option value="In 6 months">In 6 months</option>
                          <option value="Not sure yet">Not sure yet</option>
                        </select>
                        {formErrors.preferredStartDate && <p className="error-message">{formErrors.preferredStartDate}</p>}
                      </div>
                      <div className="form-actions">
                        <button type="button" onClick={handlePreviousStep} className="back-btn">
                          <i className="fas fa-arrow-left"></i> Previous Step
                        </button>
                        <button 
                          type="submit" 
                          className="submit-btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane"></i>
                              Submit Interest
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                
                <h3>Interest Submitted Successfully!</h3>
                
                <div className="success-content">
                  <p className="main-message">
                    Thank you for your interest in <strong>{selectedCourse?.title}</strong>. 
                    You have been successfully added to our waitlist.
                  </p>
                  
                  <div className="waitlist-info">
                    <h4>What happens next?</h4>
                    <ul>
                      <li>✅ Your interest has been recorded</li>
                      <li>📧 You'll receive a confirmation email shortly</li>
                      <li>⏳ Admin will review your application</li>
                      <li>🎯 When the cohort is full, you'll be notified</li>
                      <li>💳 Payment instructions will be provided upon approval</li>
                    </ul>
                  </div>
                  
                  <div className="important-note">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Note:</strong> No payment is required until your spot is confirmed. 
                      We'll contact you with all the details when the cohort is ready to start.
                    </div>
                  </div>
                </div>
                
                <div className="success-actions">
                  <button 
                    onClick={closeInterestModal} 
                    className="ok-btn"
                  >
                    <i className="fas fa-check"></i>
                    OK, Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;