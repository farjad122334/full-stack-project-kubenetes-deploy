import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists AND request is for our local API, clone and add header
    if (token && (req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api'))) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
