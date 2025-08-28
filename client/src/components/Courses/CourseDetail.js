import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch course details
        const courseRes = await fetch(`${API_BASE_URL}/api/v1/courses/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!courseRes.ok) {
          if (courseRes.status === 404) {
            throw new Error('Course not found');
          } else if (courseRes.status === 401) {
            throw new Error('Please login again');
          } else {
            throw new Error(`Failed to fetch course: ${courseRes.status}`);
          }
        }
        
        const courseData = await courseRes.json();
        
        if (!courseData.success) {
          throw new Error(courseData.message || 'Failed to fetch course data');
        }

        setCourse(courseData.data);
        
        // Check if user is enrolled
        try {
          const enrolledRes = await fetch(`${API_BASE_URL}/api/v1/courses/enrolled`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (enrolledRes.ok) {
            const enrolledData = await enrolledRes.json();
            const enrolled = enrolledData.data?.some(c => c._id === id || c.courseId === id);
            setIsEnrolled(enrolled);
          }
        } catch (error) {
          console.error('Error checking enrollment status:', error);
        }

        // Check if user is on waitlist
        try {
          const waitlistRes = await fetch(`${API_BASE_URL}/api/v1/courses/${id}/waitlist`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (waitlistRes.ok) {
            const waitlistData = await waitlistRes.json();
            setIsOnWaitlist(waitlistData.data?.isOnWaitlist || false);
          }
        } catch (error) {
          console.error('Error checking waitlist status:', error);
        }

      } catch (error) {
        console.error('Error fetching course details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, navigate]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      const enrollRes = await fetch(`${API_BASE_URL}/api/v1/courses/${id}/enroll`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        if (enrollData.success) {
          setIsEnrolled(true);
          alert('Successfully enrolled in the course!');
        } else {
          alert(enrollData.message || 'Failed to enroll');
        }
      } else {
        const errorData = await enrollRes.json();
        alert(errorData.message || 'Failed to enroll in the course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in the course');
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      const waitlistRes = await fetch(`${API_BASE_URL}/api/v1/courses/${id}/waitlist`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json();
        if (waitlistData.success) {
          setIsOnWaitlist(true);
          alert('Successfully joined the waitlist!');
        } else {
          alert(waitlistData.message || 'Failed to join waitlist');
        }
      } else {
        const errorData = await waitlistRes.json();
        alert(errorData.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('Failed to join waitlist');
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      const waitlistRes = await fetch(`${API_BASE_URL}/api/v1/courses/${id}/waitlist`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json();
        if (waitlistData.success) {
          setIsOnWaitlist(false);
          alert('Successfully left the waitlist');
        } else {
          alert(waitlistData.message || 'Failed to leave waitlist');
        }
      } else {
        const errorData = await waitlistRes.json();
        alert(errorData.message || 'Failed to leave waitlist');
      }
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      alert('Failed to leave waitlist');
    }
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Course</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/courses')} className="btn-back">
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <i className="fas fa-question-circle"></i>
        <h3>Course Not Found</h3>
        <p>The course you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/courses')} className="btn-back">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <button onClick={() => navigate('/courses')} className="btn-back">
          <i className="fas fa-arrow-left"></i>
          Back to Courses
        </button>
        <h1>{course.title || 'Untitled Course'}</h1>
        <p className="course-subtitle">{course.subtitle || course.description || 'No description available'}</p>
      </div>

      <div className="course-detail-content">
        <div className="course-main-info">
          <div className="course-image-section">
            <img 
              src={course.image || '/assets/images/logo.png'} 
              alt={course.title || 'Course Image'}
              className="course-detail-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="course-image-placeholder" style={{ display: 'none' }}>
              <i className="fas fa-book-open"></i>
              <span>Course Image</span>
            </div>
          </div>

          <div className="course-actions-section">
            <div className="course-status-info">
              <div className="status-item">
                <i className="fas fa-users"></i>
                <span>{course.enrolledStudents || 0} students enrolled</span>
              </div>
              <div className="status-item">
                <i className="fas fa-clock"></i>
                <span>{course.duration || 'Duration TBD'}</span>
              </div>
              <div className="status-item">
                <i className="fas fa-star"></i>
                <span>{course.level || 'All Levels'}</span>
              </div>
            </div>

            <div className="course-action-buttons">
              {isEnrolled ? (
                <button className="btn-continue-learning" onClick={() => navigate('/dashboard')}>
                  <i className="fas fa-play"></i>
                  Continue Learning
                </button>
              ) : course.isFull ? (
                isOnWaitlist ? (
                  <button className="btn-leave-waitlist" onClick={handleLeaveWaitlist}>
                    <i className="fas fa-times"></i>
                    Leave Waitlist
                  </button>
                ) : (
                  <button className="btn-join-waitlist" onClick={handleJoinWaitlist}>
                    <i className="fas fa-clock"></i>
                    Join Waitlist
                  </button>
                )
              ) : (
                <button className="btn-enroll-now" onClick={handleEnroll}>
                  <i className="fas fa-sign-in-alt"></i>
                  Enroll Now
                </button>
              )}
              

            </div>
          </div>
        </div>

        <div className="course-details-grid">
          <div className="course-description-section">
            <h3>Course Description</h3>
            <p>{course.description || 'No description available for this course.'}</p>
            
            {course.learningObjectives && Array.isArray(course.learningObjectives) && course.learningObjectives.length > 0 && (
              <div className="learning-objectives">
                <h4>What you'll learn:</h4>
                <ul>
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="course-info-sidebar">
            <div className="course-info-card">
              <h4>Course Information</h4>
              <div className="info-item">
                <span className="label">Category:</span>
                <span className="value">{course.category || 'General'}</span>
              </div>
              <div className="info-item">
                <span className="label">Instructor:</span>
                <span className="value">{course.instructor || 'TBD'}</span>
              </div>
              <div className="info-item">
                <span className="label">Language:</span>
                <span className="value">{course.language || 'English'}</span>
              </div>
              <div className="info-item">
                <span className="label">Last Updated:</span>
                <span className="value">
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Not available'}
                </span>
              </div>
            </div>

            {course.prerequisites && Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
              <div className="course-info-card">
                <h4>Prerequisites</h4>
                <ul>
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
