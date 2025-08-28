import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Courses.css';
import config from '../../config';

const Courses = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "IC3 Digital Literacy Certification - eCourse",
      description: "Master the essential skills needed for the IC3 Digital Literacy Certification with this comprehensive eCourse.",
      category: "Digital Literacy & Office Productivity",
      image: '/assets/images/ic3.jpg',
      xp: 250,
      online: true
    },
    {
      id: 2,
      title: "Communication Skills for Business (CSB) - eCourse",
      description: "Master the communication skills that are essential in every business sector with this comprehensive eCourse.",
      category: "Business & Entrepreneurship",
      image: '/assets/images/communication.jpg',
      xp: 200,
      online: true
    },
    {
      id: 3,
      title: "Cisco Certified Support Technician (CCST) - Networking Fundamentals Course",
      description: "Kickstart your career as a Cisco Certified Support Technician (CCST) with this hands-on, comprehensive eCourse.",
      category: "Networking & IT Certifications",
      image: '/assets/images/cisco.jpg',
      xp: 350,
      online: true
    },
    {
      id: 4,
      title: "Cisco Certified Support Technician (CCST) - Practice Tests",
      description: "Prepare for the Cisco Certified Support Technician (CCST) certification with these comprehensive practice tests.",
      category: "Networking & IT Certifications",
      image: '/assets/images/app.jpg',
      xp: 300,
      online: true
    },
    {
      id: 5,
      title: "Swift 1 - App Development with Swift",
      description: "Learn to build real iOS applications from the ground up using Apple's powerful Swift programming language.",
      category: "Programming & App Development",
      image: '/assets/images/swift.jpg',
      xp: 400,
      online: true
    },
    {
      id: 6,
      title: "Swift 1 - Apple Swift Certification Exam + Practice Test",
      description: "Validate your Swift programming skills with Apple's official certification.",
      category: "Programming & App Development",
      image: '/assets/images/networking.jpg',
      xp: 450,
      online: true
    }
  ]);
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showInterestModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
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

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/v1/courses`);
      
      if (response.data && response.data.data) {
        setCourses(response.data.data);
      } else if (Array.isArray(response.data)) {
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
      console.error('Error fetching courses:', error);
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
    setCurrentStep(1);
    setFormErrors({});
    setIsSubmitting(false);
    setInterestForm({
      fullName: '',
      email: '',
      phone: '',
      education: '',
      experience: '',
      motivation: '',
      preferredStartDate: ''
    });
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!interestForm.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (interestForm.fullName.trim().length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters';
    }
    
    if (!interestForm.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interestForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!interestForm.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (interestForm.phone.trim().length < 10) {
      errors.phone = 'Phone Number must be at least 10 digits';
    }
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!interestForm.education) {
      errors.education = 'Education Level is required';
    }
    
    if (!interestForm.experience) {
      errors.experience = 'Work Experience is required';
    }
    
    if (!interestForm.motivation.trim()) {
      errors.motivation = 'Motivation is required';
    } else if (interestForm.motivation.trim().length < 20) {
      errors.motivation = 'Motivation must be at least 20 characters';
    }
    
    if (!interestForm.preferredStartDate) {
      errors.preferredStartDate = 'Preferred Start Date is required';
    }
    
    return errors;
  };

  const handleNextStep = () => {
    const step1Errors = validateStep1();
    
    if (Object.keys(step1Errors).length === 0) {
      setFormErrors({});
      setCurrentStep(2);
    } else {
      setFormErrors(step1Errors);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setFormErrors({});
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

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    
    // Validate that a course is selected
    if (!selectedCourse || !selectedCourse._id || !selectedCourse.title) {
      alert('Please select a course first. Please refresh the page and try again.');
      return;
    }

    // Validate required fields
    if (!interestForm.fullName.trim() || !interestForm.email.trim() || !interestForm.motivation.trim()) {
      alert('Please fill in all required fields: Full Name, Email, and Motivation.');
      return;
    }

    // Validate motivation length
    if (interestForm.motivation.trim().length < 10) {
      alert('Motivation must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the data for submission
      const interestData = {
        courseId: selectedCourse._id,
        courseTitle: selectedCourse.title,
        fullName: interestForm.fullName,
        email: interestForm.email,
        phone: interestForm.phone,
        education: interestForm.education,
        experience: interestForm.experience,
        motivation: interestForm.motivation,
        preferredStartDate: interestForm.preferredStartDate
      };

      console.log('Submitting interest data:', interestData);

      // Submit course interest to backend
      const response = await axios.post(`${config.API_BASE_URL}/v1/courses/interest`, interestData);
      
      if (response.data.success) {
        setShowSuccess(true);
        // Reset form
        setInterestForm({
          fullName: '',
          email: '',
          phone: '',
          education: '',
          experience: '',
          motivation: '',
          preferredStartDate: ''
        });
        setCurrentStep(1);
        
        // Remove auto-close - user must click OK to exit
        // setTimeout(() => {
        //   closeInterestModal();
        //   setShowSuccess(false);
        // }, 5000); // Show success message for 5 seconds
      } else {
        throw new Error(response.data.message || 'Failed to submit interest');
      }
    } catch (error) {
      console.error('Error submitting interest:', error);
      
      let errorMessage = 'Failed to submit interest. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid data provided. Please check your information.';
        } else if (error.response.status === 404) {
          errorMessage = 'Course not found. Please refresh the page and try again.';
        } else {
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your internet connection and try again.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      // Show error message to user
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h1>Premium Certifications</h1>
          <p>UNLOCK YOUR POTENTIAL WITH WORLD-CLASS SKILLS & GLOBAL RECOGNITION</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="courses-main">
        <div className="content-container">
          {/* Intro Section */}
          <div className="courses-intro">
            <div className="intro-left">
              <div className="intro-content">
dffh                <div className="intro-badge">
                  <span>Premium Platform</span>
                </div>
                <h2>Transform Your Future with World-Class Certifications</h2>
                <p>Unlock your potential with industry-leading courses that open doors to global opportunities. Master in-demand skills and earn credentials that employers worldwide recognize and value.</p>
                <div className="intro-stats">
                  <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Global Partners</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Students Certified</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">98%</span>
                    <span className="stat-label">Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="intro-right">
              <div className="features-card">
                <div className="card-header">
                  <div className="header-content">
                    <div className="brand-section">
                      <div className="brand-logo">
                        <i className="fas fa-crown"></i>
                      </div>
                      <div className="brand-text">
                        <h3>JHUB Africa</h3>
                        <span className="brand-subtitle">Premium Certification Platform</span>
                      </div>
                    </div>
                    <p className="header-description">Your gateway to premium global certifications at prices that make sense. Partnering with world-renowned providers to bring you excellence without the exorbitant costs.</p>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="section-divider">
                    <span className="divider-line"></span>
                    <span className="divider-text">What Sets Us Apart</span>
                    <span className="divider-line"></span>
                  </div>
                  
                  <div className="features-list">
                    <div className="feature-row">
                      <div className="feature-item">
                        <div className="feature-icon">
                          <i className="fas fa-rocket"></i>
                        </div>
                        <div className="feature-content">
                          <h5>Incredible Savings</h5>
                          <p>Access premium courses at up to 80% off when cohorts fill up</p>
                        </div>
                      </div>
                      
                      <div className="feature-item">
                        <div className="feature-icon">
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <div className="feature-content">
                          <h5>Zero Risk</h5>
                          <p>Join our exclusive waiting list completely free - pay only when your spot is confirmed</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="feature-row">
                      <div className="feature-item">
                        <div className="feature-icon">
                          <i className="fas fa-certificate"></i>
                        </div>
                        <div className="feature-content">
                          <h5>Internationally Recognized</h5>
                          <p>Every certification is backed by authorized global providers</p>
                        </div>
                      </div>
                      
                      <div className="feature-item">
                        <div className="feature-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="feature-content">
                          <h5>Learn Your Way</h5>
                          <p>Study at your own pace on world-class platforms like GMetrix, CertPREP, and Learnkey</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="feature-item feature-wide">
                      <div className="feature-icon">
                        <i className="fas fa-hands-helping"></i>
                      </div>
                      <div className="feature-content">
                        <h5>End-to-End Support</h5>
                        <p>Our experts guide you from first interest to final certification with personalized assistance and continuous guidance throughout your learning journey.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="trust-indicators">
                      <div className="trust-item">
                        <i className="fas fa-check-circle"></i>
                        <span>ISO Certified</span>
                      </div>
                      <div className="trust-item">
                        <i className="fas fa-check-circle"></i>
                        <span>24/7 Support</span>
                      </div>
                      <div className="trust-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Money Back Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
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

          <div className="lead-capture-notice">
                            <p><strong>Ready to Transform Your Career?</strong> Express your interest in just 30 seconds - no account needed!</p>
          </div>

          {/* Courses Grid - EXACT LAYOUT FROM SCREENSHOT */}
          <div className="courses-grid">
            {filteredCourses.map((course, index) => {
              console.log('Rendering course:', course);
              return (
                <div key={course._id || index} className="course-card">
                  {/* 1. CATEGORY LABEL - AT THE VERY TOP */}
                  <div className="course-category">
                    {course.category?.toUpperCase() || 'COURSE CATEGORY'}
                  </div>
                  
                  {/* 2. LARGE IMAGE - BELOW CATEGORY, FULL WIDTH */}
                  <div className="course-image-wrapper">
                    <img 
                      src={course.image || `/assets/images/ic3.jpg`} 
                      alt={course.title} 
                      className="course-image" 
                      onError={(e) => {
                        console.log('Image failed to load:', course.image);
                        e.target.src = '/assets/images/ic3.jpg';
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', course.image, 'Dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                      }}
                    />
                    {/* IMAGE OVERLAYS - ONLINE BADGE */}
                    <div className="image-overlays">
                      <div className="online-badge">ONLINE</div>
                    </div>
                  </div>
                  
                  {/* 3. COURSE CONTENT - BELOW IMAGE */}
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <button className="interest-button" onClick={() => handleShowInterest(course)}>
                      I Am Interested →
                    </button>
                  </div>
                </div>
              );
            })}
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
                  <h3>Show Interest in {selectedCourse?.title}</h3>
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
                          Next Step →
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
                          ← Previous Step
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
