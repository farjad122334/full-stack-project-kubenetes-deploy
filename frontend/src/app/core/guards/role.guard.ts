import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Check if the user is authenticated
    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    // 2. Get expected roles from route data
    const expectedRoles = route.data?.['roles'] as string[];

    // 3. Get the current user's role
    const user = authService.getUser();
    const userRole = user?.role;

    // 4. If no specific roles are required, allow access
    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    // 5. If user role matches expected roles, allow access
    if (userRole && expectedRoles.includes(userRole)) {
        return true;
    }

    // 6. User is not authorized, redirect to their proper dashboard or a default page
    if (userRole) {
        // Redirect based on what role they actually have
        switch (userRole.toLowerCase()) {
            case 'admin':
                router.navigate(['/admin']);
                break;
            case 'tourist':
                router.navigate(['/tourist']);
                break;
            case 'driver':
                router.navigate(['/driver']);
                break;
            case 'restaurant':
            case 'hotel':
            case 'serviceprovider':
                router.navigate(['/restaurant']);
                break;
            default:
                router.navigate(['/login']);
        }
    } else {
        router.navigate(['/login']);
    }

    return false;
};
