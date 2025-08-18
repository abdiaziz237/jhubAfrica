// C:\Users\HP\Desktop\jhub\client\public\js\auth.js
import AdminAuthService from './AdminAuthService.js';
import UserAuthService from './UserAuthService.js';

const Auth = {
    admin: AdminAuthService,
    user: UserAuthService,
    
    // Auto-detect context
    current: window.location.pathname.startsWith('/admin/') 
        ? AdminAuthService 
        : UserAuthService
};

export default Auth;