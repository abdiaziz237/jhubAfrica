// C:\Users\HP\Desktop\jhub\client\public\js\UserAuthService.js
class UserAuthService {
    static TOKEN_KEY = 'jhub_user_v2';
    static USER_KEY = 'jhub_user_data_v2';
    
    static isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY) || 
               document.cookie.includes('user_token');
    }

    static async login(email, password) {
        const response = await fetch('/api/auth/login', {
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
            console.error('User login failed:', data.message);
            throw new Error(data.message || 'Login failed. Please try again.');
        }

        this.#storeAuthData(data.token, data.user);
        return data.user;
    }

    static #storeAuthData(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        document.cookie = `user_token=${token}; path=/; max-age=86400; Secure; SameSite=Lax`;
    }

    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        document.cookie = 'user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login.html';
    }

    static getCurrentUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || 
               document.cookie.match(/user_token=([^;]+)/)?.[1];
    }
}

// Auto-check for user pages
if (!window.location.pathname.startsWith('/admin/') &&
    !window.location.pathname.includes('login.html') &&
    !UserAuthService.isAuthenticated()) {
    window.location.href = '/login.html';
}

export default UserAuthService;