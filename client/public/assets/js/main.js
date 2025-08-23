// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';
let authToken = localStorage.getItem('authToken');

// Common Functions
function showLoader(button) {
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
}

function hideLoader(button, originalText) {
    if (button) {
        button.disabled = false;
        button.textContent = originalText;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Authentication Functions
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store the token
        localStorage.setItem('authToken', data.token);
        authToken = data.token;
        
        return data.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

function logoutUser() {
    localStorage.removeItem('authToken');
    authToken = null;
    window.location.href = 'login.html';
}

// User Functions
async function getCurrentUser() {
    if (!authToken) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user data');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Course Functions
async function enrollCourse(courseId) {
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ courseId })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Enrollment failed');
        }
        
        return data;
    } catch (error) {
        console.error('Enrollment error:', error);
        throw error;
    }
}

// Points Functions
async function redeemPoints(amount) {
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/points/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ amount })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Redemption failed');
        }
        
        return data;
    } catch (error) {
        console.error('Redemption error:', error);
        throw error;
    }
}

// Initialize common elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', logoutUser);
    });
    
    // Initialize password toggles
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // Check authentication state
    if (authToken) {
        // Update UI for logged in user
        getCurrentUser().then(user => {
            if (user) {
                // Update avatar initials
                const initials = user.name.split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase();
                document.querySelectorAll('.user-avatar').forEach(avatar => {
                    avatar.textContent = initials;
                });
                
                // Update username in dashboard
                if (document.querySelector('.welcome-message')) {
                    document.querySelector('.welcome-message').textContent = 
                        `Welcome back, ${user.name.split(' ')[0]}!`;
                }
            }
        });
    }
});