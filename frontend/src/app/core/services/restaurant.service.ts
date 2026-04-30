import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomCategory } from '../models/room-category.interface';

@Injectable({
    providedIn: 'root'
})
export class RestaurantService {
    private apiUrl = `${environment.apiUrl}/api/restaurants`;

    constructor(private http: HttpClient) { }

    getRestaurant(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    updateRestaurantProfile(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    uploadRestaurantImages(restaurantId: number, images: File[]): Observable<any> {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });
        return this.http.post(`${this.apiUrl}/${restaurantId}/images`, formData);
    }

    deleteRestaurantImage(imageId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/images/${imageId}`);
    }

    // Room Category Management
    getRoomCategories(restaurantId: number): Observable<RoomCategory[]> {
        return this.http.get<RoomCategory[]>(`${this.apiUrl}/${restaurantId}/room-categories`);
    }

    getRoomCategory(restaurantId: number, categoryId: number): Observable<RoomCategory> {
        return this.http.get<RoomCategory>(`${this.apiUrl}/${restaurantId}/room-categories/${categoryId}`);
    }

    createRoomCategory(restaurantId: number, formData: FormData): Observable<RoomCategory> {
        return this.http.post<RoomCategory>(`${this.apiUrl}/${restaurantId}/room-categories`, formData);
    }

    updateRoomCategory(restaurantId: number, categoryId: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${restaurantId}/room-categories/${categoryId}`, data);
    }

    deleteRoomCategory(restaurantId: number, categoryId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${restaurantId}/room-categories/${categoryId}`);
    }

    uploadRoomImages(restaurantId: number, categoryId: number, images: File[]): Observable<any> {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });
        return this.http.post(`${this.apiUrl}/${restaurantId}/room-categories/${categoryId}/images`, formData);
    }

    getRestaurantOffers(restaurantId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${restaurantId}/offers`);
    }

    getRestaurantRatings(userId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/api/ratings/restaurant/${userId}`);
    }

    deleteRoomImage(restaurantId: number, imageId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${restaurantId}/room-categories/images/${imageId}`);
    }

    getStripeOnboardingLink(restaurantId: number, returnUrl: string, refreshUrl: string): Observable<{ url: string }> {
        return this.http.post<{ url: string }>(`${this.apiUrl}/${restaurantId}/onboarding-link`, { returnUrl, refreshUrl });
    }
}
