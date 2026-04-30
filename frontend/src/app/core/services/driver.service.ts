import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private apiUrl = `${environment.apiUrl}/api/drivers`;

    constructor(private http: HttpClient) { }

    getAllDrivers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    updateDriverStatus(driverId: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${driverId}/status`, { status });
    }

    getDriverById(driverId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${driverId}`);
    }

    getBookedTours(driverId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/api/offers/driver/booked-tours/${driverId}`);
    }

    getDriverOffers(driverId: number): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/api/offers/driver?driverId=${driverId}`);
    }

    getDriverRatings(driverId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/api/ratings/driver/${driverId}`);
    }

    getStripeOnboardingLink(driverId: number, returnUrl: string, refreshUrl: string): Observable<{ url: string }> {
        return this.http.post<{ url: string }>(`${this.apiUrl}/${driverId}/onboarding-link`, { returnUrl, refreshUrl });
    }
}
