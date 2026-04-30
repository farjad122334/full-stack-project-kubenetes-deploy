import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-trip-history',
    standalone: true,
    imports: [CommonModule],
    providers: [DecimalPipe],
    templateUrl: './trip-history.html',
    styleUrl: './trip-history.css'
})
export class TripHistory implements OnInit {
    stats = {
        totalEarnings: 'PKR 0',
        totalTrips: 0,
        averageRating: '0.0 / 5.0'
    };

    trips: any[] = [];
    isLoading = true;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private decimalPipe: DecimalPipe
    ) { }

    ngOnInit(): void {
        this.loadTripHistory();
    }

    loadTripHistory(): void {
        const user = this.authService.getUser();
        if (!user || !user.roleSpecificId) {
            this.isLoading = false;
            return;
        }

        this.http.get<any[]>(`${environment.apiUrl}/api/offers/driver/trip-history/${user.roleSpecificId}`).subscribe({
            next: (data) => {
                this.trips = data;

                // Calculate basic stats from history 
                const totalTrips = this.trips.length;
                const earnings = this.trips.reduce((sum, t) => sum + (t.price || 0), 0);

                this.stats = {
                    totalEarnings: `PKR ${this.decimalPipe.transform(earnings, '1.0-0') || 0}`,
                    totalTrips: totalTrips,
                    // Hardcoded average for now unless rating endpoint is combined
                    averageRating: totalTrips > 0 ? '4.8 / 5.0' : '0.0 / 5.0'
                };

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load driver trip history:', err);
                this.isLoading = false;
            }
        });
    }
}
