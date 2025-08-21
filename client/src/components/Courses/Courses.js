// client/src/components/Courses/Courses.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Courses.css";

const API_BASE = "http://localhost:5001/api/v1/course";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(null); // track which course is being enrolled
  const navigate = useNavigate();

  // ✅ Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(API_BASE);
        setCourses(res.data.data || []); // ensure array
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("❌ Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 🔒 Handle enrollment
  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setEnrolling(courseId);
      await axios.post(
        `${API_BASE}/${courseId}/enroll`, // ✅ fixed URL
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Enrolled successfully!");
    } catch (err) {
      console.error("Enrollment error:", err);
      alert(err.response?.data?.message || "Enrollment failed.");
    } finally {
      setEnrolling(null);
    }
  };

  // ⏳ Loading / Error states
  if (loading) return <p className="loading">⏳ Loading courses...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="courses-container">
      <h1 className="courses-title">JHUB Africa Courses</h1>
      <p className="courses-subtitle">Grow your skills with our curated programs</p>

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-image"
                />
              )}
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <p>
                  <strong>Instructor:</strong>{" "}
                  {course.instructor?.name || "Unknown"}
                </p>
                <button
                  className="enroll-button"
                  onClick={() => handleEnroll(course._id)}
                  disabled={enrolling === course._id} // ✅ Disable during enroll
                >
                  {enrolling === course._id ? "Enrolling..." : "Enroll Now"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-courses">No courses available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
