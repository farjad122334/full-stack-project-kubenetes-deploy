import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private apiUrl = `${environment.apiUrl}/api/vehicles`;

    constructor(private http: HttpClient) { }

    updateVehicleStatus(vehicleId: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${vehicleId}/status`, { status });
    }

    uploadVehicleImages(vehicleId: number, images: File[]): Observable<any> {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });
        return this.http.post(`${this.apiUrl}/${vehicleId}/images`, formData);
    }

    deleteVehicleImage(imageId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/images/${imageId}`);
    }

    getVehicle(vehicleId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${vehicleId}`);
    }
}
