import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: 'Tourist' | 'Driver' | 'Restaurant';
    dateOfBirth?: string;
    cnic?: string;
    nationality?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        phoneNumber?: string;
        role: string;
        roleSpecificId?: number;
        profilePicture?: string;
        status?: string;
        businessType?: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/api/auth`;

    constructor(private http: HttpClient) { }

    signup(request: SignupRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request);
    }

    signupDriver(formData: FormData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup/driver`, formData);
    }

    initiateDriverSignup(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/initiate-driver-signup`, data);
    }

    signupTourist(formData: FormData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup/tourist`, formData);
    }

    signupRestaurant(formData: FormData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup/restaurant`, formData);
    }

    initiateRestaurantSignup(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/initiate-restaurant-signup`, data);
    }

    verifyOtp(email: string, otpCode: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, otpCode }).pipe(
            tap(response => {
                // Store token in localStorage upon successful verification
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
            })
        );
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getUserId(): number | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
        return null;
    }

    getProfilePictureUrl(path: string | null | undefined): string | null {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${environment.apiUrl}${path}`;
    }

    updatePassword(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/update-password`, data);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    resendOtp(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/resend-otp`, { email });
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    verifyPasswordResetOtp(email: string, otpCode: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-password-reset-otp`, { email, otpCode });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, data);
    }

    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`).pipe(
            tap(user => {
                // Update localStorage with fresh user data
                const currentUser = this.getUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...user };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            })
        );
    }

    updateProfile(formData: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/update-profile`, formData).pipe(
            tap((response: any) => {
                const currentUser = this.getUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...response };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            })
        );
    }
}
