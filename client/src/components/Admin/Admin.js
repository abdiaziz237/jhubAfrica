import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

// Optional assets (served from public). They won't break build if missing.
const BRAND_ICON = "/assets/jhub-logo-icon.png";
const DEFAULT_AVATAR = "/assets/default-avatar.jpg";

export default function Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    waitlistedUsers: 0,
    totalXP: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Add User form
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  // Add Course form
  const [addCourseForm, setAddCourseForm] = useState({
    title: "",
    category: "",
    description: "",
    xp: "",
    duration: "",
    image: null,
    instructor: "",
  });
  const [instructors, setInstructors] = useState([]);

  // -------------- helpers --------------
  const authorizedFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const ratingStars = (rating) => {
    const r = Number(rating || 0);
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <i key={`f${i}`} className="fas fa-star text-warning" />
          ))}
        {half && <i className="fas fa-star-half-alt text-warning" />}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <i key={`e${i}`} className="far fa-star text-warning" />
          ))}
      </>
    );
  };

  // -------------- auth --------------
  useEffect(() => {
    const tok = localStorage.getItem("adminToken");
    const usr = localStorage.getItem("adminUser");
    if (!tok || !usr) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setToken(tok);
    try {
      setUser(JSON.parse(usr));
    } catch {
      setUser(null);
    }
  }, [navigate]);

  // -------------- initial load --------------
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [sRes, uRes, cRes] = await Promise.all([
          authorizedFetch("/api/v1/admin/dashboard/stats"),
          authorizedFetch("/api/v1/admin/users/recent"),
          authorizedFetch("/api/v1/admin/courses/popular"),
        ]);

        if (!sRes.ok) throw new Error("Failed to fetch stats");
        if (!uRes.ok) throw new Error("Failed to fetch users");
        if (!cRes.ok) throw new Error("Failed to fetch courses");

        const [sData, uData, cData] = await Promise.all([
          sRes.json(),
          uRes.json(),
          cRes.json(),
        ]);

        if (!mounted) return;
        setStats({
          totalUsers: sData.totalUsers ?? 0,
          activeCourses: sData.activeCourses ?? 0,
          waitlistedUsers: sData.waitlistedUsers ?? 0,
          totalXP: sData.totalXP ?? 0,
        });
        setRecentUsers(Array.isArray(uData) ? uData : []);
        setPopularCourses(Array.isArray(cData) ? cData : []);
      } catch (err) {
        console.error(err);
        // keep UI visible; show minimal data
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // -------------- handlers --------------
  const reloadUsers = async () => {
    try {
      const res = await authorizedFetch("/api/admin/users/recent");
      if (!res.ok) throw new Error();
      setRecentUsers(await res.json());
    } catch {
      // noop
    }
  };

  const reloadCourses = async () => {
    try {
      const res = await authorizedFetch("/api/v1/admin/courses/popular");
      if (!res.ok) throw new Error();
      setPopularCourses(await res.json());
    } catch {
      // noop
    }
  };

  const openAddUser = () => setShowAddUser(true);
  const openAddCourse = async () => {
    setShowAddCourse(true);
    // load instructors
    try {
      const res = await authorizedFetch("/api/v1/admin/users/instructors");
      if (res.ok) setInstructors(await res.json());
    } catch {
      // noop
    }
  };

  const closeModals = () => {
    setShowAddUser(false);
    setShowAddCourse(false);
  };

  const onAddUserChange = (e) => {
    const { name, value, files } = e.target;
    setAddUserForm((s) => ({
      ...s,
      [name]: files ? files[0] : value,
    }));
  };

  const onAddCourseChange = (e) => {
    const { name, value, files } = e.target;
    setAddCourseForm((s) => ({
      ...s,
      [name]: files ? files[0] : value,
    }));
  };

  const submitAddUser = async () => {
    if (addUserForm.password !== addUserForm.confirmPassword) {
      window.alert("Passwords do not match.");
      return;
    }
    const fd = new FormData();
    Object.entries(addUserForm).forEach(([k, v]) => {
      if (v != null) fd.append(k, v);
    });

    try {
      setLoading(true);
      const res = await authorizedFetch("/api/admin/users", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to add user");
      }
      window.alert("User added successfully.");
      setShowAddUser(false);
      setAddUserForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
        photo: null,
      });
      reloadUsers();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAddCourse = async () => {
    const fd = new FormData();
    Object.entries(addCourseForm).forEach(([k, v]) => {
      if (v != null) fd.append(k, v);
    });

    try {
      setLoading(true);
      const res = await authorizedFetch("/api/admin/courses", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to add course");
      }
      window.alert("Course added successfully.");
      setShowAddCourse(false);
      setAddCourseForm({
        title: "",
        category: "",
        description: "",
        xp: "",
        duration: "",
        image: null,
        instructor: "",
      });
      reloadCourses();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login", { replace: true });
  };

  const userName = useMemo(
    () => (user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin User"),
    [user]
  );

  // -------------- render --------------
  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="sidebar-brand">
          <img src={BRAND_ICON} alt="JHUB Africa" />
          <span className="sidebar-brand-text">JHUB Admin</span>
        </div>

        <ul className="admin-menu">
          <li className="menu-header">Main</li>
          <li className="menu-item">
            <button className="menu-link active" type="button">
              <i className="fas fa-tachometer-alt menu-icon" />
              <span>Dashboard</span>
            </button>
          </li>

          <li className="menu-header">Management</li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-users menu-icon" />
              <span>Users</span>
              <span className="menu-badge">{recentUsers.length}</span>
            </button>
          </li>

          <li className="menu-item has-submenu">
            <details open>
              <summary className="menu-link">
                <i className="fas fa-book menu-icon" />
                <span>Courses</span>
                <i className="fas fa-chevron-right menu-arrow" />
              </summary>
              <ul className="submenu">
                <li className="menu-item">
                  <button className="menu-link" type="button">All Courses</button>
                </li>
                <li className="menu-item">
                  <button className="menu-link" type="button">Categories</button>
                </li>
                <li className="menu-item">
                  <button className="menu-link" type="button">Modules</button>
                </li>
              </ul>
            </details>
          </li>

          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-clipboard-list menu-icon" />
              <span>Exams &amp; Quizzes</span>
            </button>
          </li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-list menu-icon" />
              <span>Waitlists</span>
              <span className="menu-badge">5</span>
            </button>
          </li>

          <li className="menu-header">Analytics</li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-chart-line menu-icon" />
              <span>Reports</span>
            </button>
          </li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-trophy menu-icon" />
              <span>Leaderboard</span>
            </button>
          </li>

          <li className="menu-header">System</li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-cog menu-icon" />
              <span>Settings</span>
            </button>
          </li>
          <li className="menu-item">
            <button className="menu-link" type="button">
              <i className="fas fa-history menu-icon" />
              <span>Activity Logs</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className="btn btn-light btn-icon sidebar-toggle"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            <i className="fas fa-bars" />
          </button>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><span>Home</span></li>
              <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
            </ol>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-icon">
            <i className="fas fa-bell" />
            <span className="notification-badge">3</span>
          </div>

          <div className="header-divider" />

          <div className="user-dropdown">
            <img
              src={user?.photo || DEFAULT_AVATAR}
              alt="User"
              className="user-avatar"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
            <span className="user-name">{userName}</span>
            <div className="dropdown-menu open">
              <button className="dropdown-item" type="button">
                <i className="fas fa-user me-2" /> Profile
              </button>
              <button className="dropdown-item" type="button">
                <i className="fas fa-cog me-2" /> Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" type="button" onClick={adminLogout}>
                <i className="fas fa-sign-out-alt me-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="admin-main">
        <div className="page-header">
          <h1 className="page-title">Dashboard Overview</h1>
          <div className="card-actions">
            <div className="input-group" style={{ width: 250 }}>
              <input type="text" className="form-control" placeholder="Search..." />
              <button className="btn btn-light" type="button">
                <i className="fas fa-search" />
              </button>
            </div>
            <button className="btn btn-primary" type="button">
              <i className="fas fa-plus" /> Add New
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon primary"><i className="fas fa-users" /></div>
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-value">{Number(stats.totalUsers).toLocaleString()}</div>
                <div className="stat-label">Total Users</div>
                <div className="stat-change up">
                  <i className="fas fa-arrow-up" /> <span>—</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon success"><i className="fas fa-book" /></div>
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-value">{Number(stats.activeCourses).toLocaleString()}</div>
                <div className="stat-label">Active Courses</div>
                <div className="stat-change up">
                  <i className="fas fa-arrow-up" /> <span>—</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon warning"><i className="fas fa-list" /></div>
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-value">{Number(stats.waitlistedUsers).toLocaleString()}</div>
                <div className="stat-label">Waitlisted</div>
                <div className="stat-change down">
                  <i className="fas fa-arrow-down" /> <span>—</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon danger"><i className="fas fa-coins" /></div>
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-value">{Number(stats.totalXP).toLocaleString()}</div>
                <div className="stat-label">XP Distributed</div>
                <div className="stat-change up">
                  <i className="fas fa-arrow-up" /> <span>—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (static sample table from your HTML kept) */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <div className="card-actions">
              <button className="btn btn-light btn-sm" type="button">
                <i className="fas fa-sync-alt" /> Refresh
              </button>
              <button className="btn btn-light btn-sm" type="button">
                <i className="fas fa-filter" /> Filter
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Keep your sample rows from original HTML for now */}
                <tr>
                  <td>#1001</td>
                  <td>
                    <img src="/assets/user-avatar1.jpg" alt="User" className="user-avatar-sm" />
                    John Doe
                  </td>
                  <td>Completed Digital Literacy Exam</td>
                  <td>IC3 Digital Literacy</td>
                  <td>2023-06-15 14:30</td>
                  <td><span className="status-badge active">Passed</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-light btn-sm btn-icon"><i className="fas fa-eye" /></button>
                      <button className="btn btn-light btn-sm btn-icon"><i className="fas fa-print" /></button>
                    </div>
                  </td>
                </tr>
                {/* ... (you can remove or replace these with live data later) */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users & Courses */}
        <div className="row-2col">
          <div className="col">
            <div className="admin-card h-100">
              <div className="card-header">
                <h3 className="card-title">Recent Users</h3>
                <div className="card-actions">
                  <button className="btn btn-light btn-sm" type="button" onClick={reloadUsers}>
                    <i className="fas fa-sync-alt" /> Refresh
                  </button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={openAddUser}>
                    <i className="fas fa-plus" /> Add User
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "#666" }}>
                          {loading ? "Loading..." : "No users found."}
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr key={u._id || u.id}>
                          <td>
                            <img
                              src={u.photo || DEFAULT_AVATAR}
                              alt="User"
                              className="user-avatar-sm"
                              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                            />
                            {u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
                          </td>
                          <td>{u.email}</td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                          <td>
                            <span className={`status-badge ${u.active ? "active" : "inactive"}`}>
                              {u.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="admin-card h-100">
              <div className="card-header">
                <h3 className="card-title">Popular Courses</h3>
                <div className="card-actions">
                  <button className="btn btn-light btn-sm" type="button" onClick={reloadCourses}>
                    <i className="fas fa-sync-alt" /> Refresh
                  </button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={openAddCourse}>
                    <i className="fas fa-plus" /> Add Course
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Students</th>
                      <th>XP</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularCourses.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "#666" }}>
                          {loading ? "Loading..." : "No courses found."}
                        </td>
                      </tr>
                    ) : (
                      popularCourses.map((c) => (
                        <tr key={c._id || c.id}>
                          <td>{c.title}</td>
                          <td>{Number(c.students || 0).toLocaleString()}</td>
                          <td>{Number(c.xpValue || c.xp || 0).toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">{Number(c.rating || 0).toFixed(1)}</div>
                              <div className="rating-stars">{ratingStars(c.rating)}</div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal open" onClick={(e) => e.target.classList.contains("modal") && closeModals()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New User</h3>
              <button className="modal-close" onClick={closeModals}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="row-2col">
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-control" name="firstName" value={addUserForm.firstName} onChange={onAddUserChange} />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" name="lastName" value={addUserForm.lastName} onChange={onAddUserChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={addUserForm.email} onChange={onAddUserChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={addUserForm.phone} onChange={onAddUserChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" name="role" value={addUserForm.role} onChange={onAddUserChange}>
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="row-2col">
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={addUserForm.password} onChange={onAddUserChange} minLength={8} />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" name="confirmPassword" value={addUserForm.confirmPassword} onChange={onAddUserChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <input type="file" className="form-control" name="photo" onChange={onAddUserChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={closeModals}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAddUser}>Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="modal open" onClick={(e) => e.target.classList.contains("modal") && closeModals()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Course</h3>
              <button className="modal-close" onClick={closeModals}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input className="form-control" name="title" value={addCourseForm.title} onChange={onAddCourseChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={addCourseForm.category} onChange={onAddCourseChange}>
                  <option value="">Select Category</option>
                  <option value="digital-literacy">Digital Literacy</option>
                  <option value="business">Business</option>
                  <option value="networking">Networking</option>
                  <option value="programming">Programming</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows={4} value={addCourseForm.description} onChange={onAddCourseChange} />
              </div>

              <div className="row-2col">
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">XP Value</label>
                    <input type="number" min={0} className="form-control" name="xp" value={addCourseForm.xp} onChange={onAddCourseChange} />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Duration (weeks)</label>
                    <input type="number" min={1} className="form-control" name="duration" value={addCourseForm.duration} onChange={onAddCourseChange} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Image</label>
                <input type="file" className="form-control" name="image" onChange={onAddCourseChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Instructor</label>
                <select className="form-select" name="instructor" value={addCourseForm.instructor} onChange={onAddCourseChange}>
                  <option value="">Select Instructor</option>
                  {instructors.map((i) => (
                    <option key={i.id || i._id} value={i.id || i._id}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={closeModals}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAddCourse}>Add Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
