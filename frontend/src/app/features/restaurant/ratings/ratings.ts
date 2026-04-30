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
    accommodationStars: number;
    serviceStars: number;
    staffStars: number;
    comment: string;
}

@Component({
    selector: 'app-ratings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ratings.html',
    styleUrl: './ratings.css'
})
export class RestaurantRatings implements OnInit {

    isLoading = true;
    error = '';

    overallRating = 0;
    averageAccommodation = 0;
    averageService = 0;
    averageStaff = 0;
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
        this.http.get<any>(`${environment.apiUrl}/api/ratings/restaurant/${userId}`).subscribe({
            next: (data) => {
                this.overallRating = data.averageOverall || 0;
                this.averageAccommodation = data.averageAccommodation || 0;
                this.averageService = data.averageService || 0;
                this.averageStaff = data.averageStaff || 0;
                this.totalReviews = data.totalReviews || 0;
                this.reviews = data.reviews || [];
                this.computeBreakdown();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load restaurant ratings', err);
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
