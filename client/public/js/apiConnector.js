// public/js/apiConnector.js
class JHubAPI {
  constructor() {
    this.baseUrl = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  async _request(method, endpoint, data = null) {
    const token = localStorage.getItem('jhub_token');
    const headers = token 
      ? { ...this.defaultHeaders, 'Authorization': `Bearer ${token}` }
      : this.defaultHeaders;

    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const data = await this._request('POST', '/auth/login', { email, password });
    localStorage.setItem('jhub_token', data.token);
    return data.user;
  }

  async logout() {
    try {
      await this._request('POST', '/auth/logout');
    } finally {
      localStorage.removeItem('jhub_token');
      window.location.href = '/login.html';
    }
  }

  async register(userData) {
    const data = await this._request('POST', '/auth/register', userData);
    if (data.token) {
      localStorage.setItem('jhub_token', data.token);
    }
    return data.user;
  }

  // User Profile
  async getCurrentUser() {
    return this._request('GET', '/users/me');
  }

  async updateProfile(updates) {
    return this._request('PATCH', '/users/me', updates);
  }

  async changePassword(currentPassword, newPassword) {
    return this._request('POST', '/users/change-password', { 
      currentPassword, 
      newPassword 
    });
  }

  // Courses
  async getCourses() {
    return this._request('GET', '/courses');
  }

  async getCourseDetails(courseId) {
    return this._request('GET', `/courses/${courseId}`);
  }

  async enrollCourse(courseId) {
    return this._request('POST', `/courses/${courseId}/enroll`);
  }

  // Referrals
  async getReferralStats() {
    return this._request('GET', '/referrals/stats');
  }

  // Admin
  async adminGetUsers() {
    return this._request('GET', '/admin/users');
  }

  async adminCreateCourse(courseData) {
    return this._request('POST', '/admin/courses', courseData);
  }
}

// Initialize only in browser environment
if (typeof window !== 'undefined') {
  window.api = new JHubAPI();
  
  // Auto-redirect to login if 401 error occurs
  window.addEventListener('unauthorized', () => {
    localStorage.removeItem('jhub_token');
    window.location.href = '/login.html';
  });
}