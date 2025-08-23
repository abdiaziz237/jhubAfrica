// C:\Users\HP\Desktop\jhub\client\public\js\AdminAuthService.js
class AdminAuthService {
    static TOKEN_KEY = 'jhub_admin_v2';  // Changed key to avoid conflicts
    static USER_KEY = 'jhub_admin_user_v2';
    
    static isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    static async login(email, password) {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 
                email: email.trim(),
                password: password.trim()
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Admin login failed:', data.message);
            throw new Error(data.message || 'Admin authentication failed');
        }

        this.#storeAuthData(data.token, data.user);
        return data.user;
    }

    static #storeAuthData(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        // Set cookie for server-side rendering (if needed)
        document.cookie = `admin_token=${token}; path=/; max-age=86400; Secure; SameSite=Strict`;
    }

    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/admin/login.html';
    }

    static getCurrentUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || 
               document.cookie.match(/admin_token=([^;]+)/)?.[1];
    }
}

// Auto-check for admin pages
if (window.location.pathname.startsWith('/admin/') && 
    !window.location.pathname.includes('login.html') &&
    !AdminAuthService.isAuthenticated()) {
    window.location.href = '/admin/login.html';
}

export default AdminAuthService;