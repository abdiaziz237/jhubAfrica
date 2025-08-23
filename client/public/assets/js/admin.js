// admin.js - Admin Dashboard Functionality
const AdminDashboard = (() => {
    // Configuration
    const API_BASE = 'http://localhost:5001/api';
    const DOM = {
        usersTable: document.getElementById('users-table'),
        coursesTable: document.getElementById('courses-table'),
        logoutBtn: document.getElementById('logout-btn'),
        addUserForm: document.getElementById('add-user-form'),
        addCourseForm: document.getElementById('add-course-form')
    };

    // Initialize dashboard
    function init() {
        checkAuth();
        loadData();
        bindEvents();
    }

    // Check authentication state
    function checkAuth() {
        if (!localStorage.getItem('adminToken')) {
            redirectToLogin();
        }
    }

    // Load initial data
    async function loadData() {
        try {
            const [users, courses] = await Promise.all([
                fetchData('/admin/users'),
                fetchData('/admin/courses')
            ]);
            renderTables(users, courses);
        } catch (error) {
            showError('Failed to load dashboard data');
            console.error('Dashboard load error:', error);
        }
    }

    // Bind event listeners
    function bindEvents() {
        DOM.logoutBtn.addEventListener('click', logout);
        if (DOM.addUserForm) {
            DOM.addUserForm.addEventListener('submit', handleUserCreation);
        }
        if (DOM.addCourseForm) {
            DOM.addCourseForm.addEventListener('submit', handleCourseCreation);
        }
    }

    // API fetch wrapper
    async function fetchData(endpoint, options = {}) {
        const defaultHeaders = {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'API request failed');
        }
        return response.json();
    }

    // Render both tables
    function renderTables(users, courses) {
        renderUsersTable(users);
        renderCoursesTable(courses);
        bindTableEvents();
    }

    // Users table rendering
    function renderUsersTable(users) {
        if (!DOM.usersTable) return;
        
        DOM.usersTable.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.xp || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Courses table rendering
    function renderCoursesTable(courses) {
        if (!DOM.coursesTable) return;
        
        DOM.coursesTable.innerHTML = courses.map(course => `
            <tr>
                <td>${course.id || course._id}</td>
                <td>${course.title}</td>
                <td>${course.description || 'No description'}</td>
                <td>${course.points || 0} XP</td>
                <td>${course.enrolledStudents?.length || 0} students</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-course" data-id="${course.id || course._id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-course" data-id="${course.id || course._id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Bind dynamic table events
    function bindTableEvents() {
        // User table events
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete('user', btn.dataset.id));
        });

        // Course table events
        document.querySelectorAll('.edit-course').forEach(btn => {
            btn.addEventListener('click', () => editCourse(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-course').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete('course', btn.dataset.id));
        });
    }

    // Handle user creation
    async function handleUserCreation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await fetchData('/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            
            showSuccess('User added successfully');
            e.target.reset();
            loadData();
        } catch (error) {
            showError(`User creation failed: ${error.message}`);
        }
    }

    // Handle course creation
    async function handleCourseCreation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await fetchData('/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            
            showSuccess('Course added successfully');
            e.target.reset();
            loadData();
        } catch (error) {
            showError(`Course creation failed: ${error.message}`);
        }
    }

    // Edit user
    async function editUser(userId) {
        try {
            const user = await fetchData(`/admin/users/${userId}`);
            // Implement your edit modal or form population logic here
            console.log('Editing user:', user);
            showSuccess(`Ready to edit user: ${user.name}`);
        } catch (error) {
            showError(`Failed to load user: ${error.message}`);
        }
    }

    // Edit course
    async function editCourse(courseId) {
        try {
            const course = await fetchData(`/admin/courses/${courseId}`);
            // Implement your edit modal or form population logic here
            console.log('Editing course:', course);
            showSuccess(`Ready to edit course: ${course.title}`);
        } catch (error) {
            showError(`Failed to load course: ${error.message}`);
        }
    }

    // Delete confirmation
    function confirmDelete(type, id) {
        const confirmMessage = {
            user: 'Are you sure you want to delete this user?',
            course: 'Are you sure you want to delete this course?'
        }[type];

        if (confirm(confirmMessage)) {
            type === 'user' ? deleteUser(id) : deleteCourse(id);
        }
    }

    // Delete user
    async function deleteUser(userId) {
        try {
            await fetchData(`/admin/users/${userId}`, { method: 'DELETE' });
            showSuccess('User deleted successfully');
            loadData();
        } catch (error) {
            showError(`User deletion failed: ${error.message}`);
        }
    }

    // Delete course
    async function deleteCourse(courseId) {
        try {
            await fetchData(`/admin/courses/${courseId}`, { method: 'DELETE' });
            showSuccess('Course deleted successfully');
            loadData();
        } catch (error) {
            showError(`Course deletion failed: ${error.message}`);
        }
    }

    // Logout handler
    function logout() {
        localStorage.removeItem('adminToken');
        redirectToLogin();
    }

    // Redirect to login
    function redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Notification helpers
    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showError(message) {
        showNotification(message, 'error');
    }

    function showNotification(message, type) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' 
                ? "linear-gradient(to right, #00b09b, #96c93d)"
                : "linear-gradient(to right, #ff5f6d, #ffc371)",
            stopOnFocus: true
        }).showToast();
    }

    // Public API
    return {
        init
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', AdminDashboard.init);