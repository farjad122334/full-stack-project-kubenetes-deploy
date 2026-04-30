import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tour } from '../models/tour.interface';

@Injectable({
    providedIn: 'root'
})
export class TourService {

    private apiUrl = `${environment.apiUrl}/api/tours`;

    constructor(private http: HttpClient) { }

    getTours(): Observable<Tour[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(backendTours => backendTours.map(t => this.mapBackendToFrontend(t)))
        );
    }

    getTourById(id: number): Observable<Tour | undefined> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(t => this.mapBackendToFrontend(t))
        );
    }

    private mapBackendToFrontend(t: any): Tour {
        return {
            id: t.tourId,
            name: t.title,
            description: t.description || '',
            price: t.pricePerHead,
            pricePerHead: t.pricePerHead,
            coupleDiscountPercentage: t.coupleDiscountPercentage,
            bulkDiscountPercentage: t.bulkDiscountPercentage,
            bulkBookingMinPersons: t.bulkBookingMinPersons,
            totalSeats: t.maxCapacity,
            seatsBooked: t.currentBookings,
            location: t.departureLocation,
            destination: t.destination,
            duration: `${t.durationDays} Days`,
            startDate: t.startDate ? t.startDate.split('T')[0] : '',
            endDate: t.endDate ? t.endDate.split('T')[0] : '',
            imageUrl: t.imageUrl || 'https://placehold.co/800x600/1e293b/FFF?text=Tour+Image',
            rating: 4.8, // Partial mock
            type: 'Single', // Simplify mapping for now
            vehicles: 1, // Mock
            status: t.status
        };
    }
}
