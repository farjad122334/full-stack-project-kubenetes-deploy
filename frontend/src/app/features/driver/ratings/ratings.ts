import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Review {
    ratingId: number;
    tourName: string;
    touristName: string;
    date: string;
    overallStars: number;
    vehicleStars: number;
    comfortStars: number;
    behaviourStars: number;
    comment: string;
}

@Component({
    selector: 'app-ratings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ratings.html',
    styleUrl: './ratings.css'
})
export class Ratings implements OnInit {

    isLoading = true;
    error = '';

    overallRating = 0;
    averageVehicle = 0;
    averageComfort = 0;
    averageBehaviour = 0;
    totalReviews = 0;
    reviews: Review[] = [];

    ratingBreakdown: { stars: number, count: number, percentage: number }[] = [];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userId = user.id || user.userId;
            if (userId) {
                this.fetchRatings(userId);
            } else {
                this.error = 'Could not identify user. Please log in again.';
                this.isLoading = false;
            }
        } else {
            this.error = 'Not logged in.';
            this.isLoading = false;
        }
    }

    fetchRatings(userId: number) {
        this.isLoading = true;
        this.http.get<any>(`${environment.apiUrl}/api/ratings/driver/${userId}`).subscribe({
            next: (data) => {
                this.overallRating = data.averageOverall || 0;
                this.averageVehicle = data.averageVehicle || 0;
                this.averageComfort = data.averageComfort || 0;
                this.averageBehaviour = data.averageBehaviour || 0;
                this.totalReviews = data.totalReviews || 0;
                this.reviews = (data.reviews || []).map((r: any) => ({
                    ...r,
                    vehicleStars: r.vehicleStars,
                    comfortStars: r.comfortStars,
                    behaviourStars: r.behaviourStars
                }));
                this.computeBreakdown();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load driver ratings', err);
                this.error = 'Failed to load ratings. Please try again.';
                this.isLoading = false;
            }
        });
    }

    computeBreakdown() {
        const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        for (const r of this.reviews) {
            const star = Math.round(r.overallStars);
            if (star >= 1 && star <= 5) counts[star]++;
        }
        this.ratingBreakdown = [5, 4, 3, 2, 1].map(s => ({
            stars: s,
            count: counts[s],
            percentage: this.totalReviews > 0 ? Math.round((counts[s] / this.totalReviews) * 100) : 0
        }));
    }

    getStarsArray(n: number): number[] {
        return Array(5).fill(0).map((_, i) => i + 1);
    }
}
