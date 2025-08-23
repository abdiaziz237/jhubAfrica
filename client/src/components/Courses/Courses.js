// client/src/components/Courses/Courses.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Courses.css";

const API_BASE = "http://localhost:5001/api/v1/course";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const navigate = useNavigate();

  const categories = ["all", "programming", "design", "business", "marketing", "data-science"];

  // Sample course data
  const sampleCourses = [
    {
      _id: "1",
      title: "Complete Web Development Bootcamp",
      description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.",
      instructor: { name: "John Smith", avatar: "/api/placeholder/40/40" },
      category: "programming",
      level: "Beginner",
      duration: "12 weeks",
      price: 299,
      rating: 4.8,
      students: 1250,
      image: "/api/placeholder/300/200",
      createdAt: "2024-01-15"
    },
    {
      _id: "2",
      title: "UI/UX Design Masterclass",
      description: "Master the principles of user interface and user experience design. Learn Figma, Adobe XD, and design thinking.",
      instructor: { name: "Sarah Johnson", avatar: "/api/placeholder/40/40" },
      category: "design",
      level: "Intermediate",
      duration: "8 weeks",
      price: 199,
      rating: 4.9,
      students: 890,
      image: "/api/placeholder/300/200",
      createdAt: "2024-01-20"
    },
    {
      _id: "3",
      title: "Digital Marketing Strategy",
      description: "Learn SEO, social media marketing, content marketing, and paid advertising to grow your business online.",
      instructor: { name: "Mike Davis", avatar: "/api/placeholder/40/40" },
      category: "marketing",
      level: "Beginner",
      duration: "6 weeks",
      price: 149,
      rating: 4.7,
      students: 2100,
      image: "/api/placeholder/300/200",
      createdAt: "2024-01-25"
    },
    {
      _id: "4",
      title: "Data Science with Python",
      description: "Master data analysis, machine learning, and data visualization using Python, Pandas, and Scikit-learn.",
      instructor: { name: "Dr. Emily Chen", avatar: "/api/placeholder/40/40" },
      category: "data-science",
      level: "Advanced",
      duration: "16 weeks",
      price: 399,
      rating: 4.9,
      students: 750,
      image: "/api/placeholder/300/200",
      createdAt: "2024-02-01"
    },
    {
      _id: "5",
      title: "Business Management Fundamentals",
      description: "Learn essential business skills including leadership, project management, and strategic planning.",
      instructor: { name: "Robert Wilson", avatar: "/api/placeholder/40/40" },
      category: "business",
      level: "Beginner",
      duration: "10 weeks",
      price: 249,
      rating: 4.6,
      students: 1500,
      image: "/api/placeholder/300/200",
      createdAt: "2024-02-05"
    },
    {
      _id: "6",
      title: "Mobile App Development with React Native",
      description: "Build cross-platform mobile apps for iOS and Android using React Native and JavaScript.",
      instructor: { name: "Alex Rodriguez", avatar: "/api/placeholder/40/40" },
      category: "programming",
      level: "Intermediate",
      duration: "14 weeks",
      price: 349,
      rating: 4.8,
      students: 680,
      image: "/api/placeholder/300/200",
      createdAt: "2024-02-10"
    }
  ];

  // ✅ Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(API_BASE);
        const coursesData = res.data.data || [];
        if (coursesData.length > 0) {
          setCourses(coursesData);
          setFilteredCourses(coursesData);
        } else {
          // Use sample data if no courses from API
          setCourses(sampleCourses);
          setFilteredCourses(sampleCourses);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        // Use sample data as fallback
        setCourses(sampleCourses);
        setFilteredCourses(sampleCourses);
        setError(""); // Clear error since we have sample data
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter and search courses
  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => 
        course.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "instructor":
          return (a.instructor?.name || "").localeCompare(b.instructor?.name || "");
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, sortBy]);

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
      <div className="courses-header">
        <h1 className="courses-title">JHUB Africa Courses</h1>
        <p className="courses-subtitle">Grow your skills with our curated programs</p>
        
        <div className="courses-stats">
          <div className="stat-item">
            <span className="stat-number">{courses.length}</span>
            <span className="stat-label">Total Courses</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length - 1}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredCourses.length}</span>
            <span className="stat-label">Available Now</span>
          </div>
        </div>
      </div>

      <div className="courses-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search courses, instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="title">Sort by Title</option>
            <option value="instructor">Sort by Instructor</option>
            <option value="newest">Sort by Newest</option>
          </select>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-image-container">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="course-image"
                  />
                ) : (
                  <div className="course-placeholder">
                    <span className="placeholder-icon">📚</span>
                  </div>
                )}
                {course.category && (
                  <span className="course-category">{course.category}</span>
                )}
              </div>
              
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">
                  {course.description?.length > 100 
                    ? `${course.description.substring(0, 100)}...` 
                    : course.description}
                </p>
                
                <div className="course-meta">
                  <div className="instructor-info">
                    <span className="instructor-icon">👨‍🏫</span>
                    <span>{course.instructor?.name || "Unknown"}</span>
                  </div>
                  {course.duration && (
                    <div className="duration-info">
                      <span className="duration-icon">⏱️</span>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="level-info">
                      <span className="level-badge level-{course.level?.toLowerCase()}">
                        {course.level}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="course-actions">
                  <button
                    className="enroll-button"
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrolling === course._id}
                  >
                    {enrolling === course._id ? (
                      <>
                        <span className="loading-spinner"></span>
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </button>
                  <button className="preview-button">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <span className="no-courses-icon">📚</span>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
