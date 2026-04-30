import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RouterModule } from '@angular/router';
import { RatingModal } from '../../../shared/components/rating-modal/rating-modal';
import { environment } from '../../../../environments/environment';

interface Trip {
    id: string;
    tourId: number;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: string;
    persons: number;
    totalCost: number;
    status: string;
    rating?: number;
    review?: string;
    image?: string;
    hasRated: boolean;
}

@Component({
    selector: 'app-trip-history',
    standalone: true,
    imports: [CommonModule, RouterModule, RatingModal],
    templateUrl: './trip-history.html',
    styleUrl: './trip-history.css'
})
export class TripHistory implements OnInit {
    trips: Trip[] = [];
    isLoading: boolean = true;
    touristId: number = 0;

    // Rating Modal State
    showRatingModal = false;
    selectedTourIdToRate: number | null = null;
    error: string = '';

    constructor(
        private bookingService: BookingService,
        private authService: AuthService,
        private toastService: ToastService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user && user.roleSpecificId) {
            this.touristId = user.roleSpecificId;
            this.loadTrips(this.touristId);
        }
    }

    loadTrips(touristId: number): void {
        this.isLoading = true;
        this.bookingService.getTouristBookings(touristId).subscribe({
            next: (data) => {
                const rawTrips: Trip[] = data
                    .filter(b => {
                        const s = b.status?.toLowerCase();
                        const ts = b.tour?.status?.toLowerCase();
                        return s === 'completed' || s === 'cancelled' || ts === 'completed' || ts === 'cancelled';
                    })
                    .map(b => ({
                        id: `BK-${b.bookingId.toString().padStart(3, '0')}`,
                        tourId: b.tourId,
                        title: b.tour?.title || 'Unknown Tour',
                        destination: b.tour?.destination || 'N/A',
                        status: b.status,
                        startDate: b.tour?.startDate ? new Date(b.tour.startDate).toLocaleDateString() : 'TBA',
                        endDate: b.tour?.endDate ? new Date(b.tour.endDate).toLocaleDateString() : 'TBA',
                        duration: b.tour ? `${b.tour.durationDays} Days` : 'N/A',
                        totalCost: b.totalAmount,
                        persons: b.numberOfPeople,
                        hasRated: false
                    }));

                // Now fetch which tours this tourist has already rated
                this.http.get<number[]>(`${environment.apiUrl}/api/ratings/tourist/${touristId}/rated-tours`).subscribe({
                    next: (ratedTourIds) => {
                        const ratedSet = new Set(ratedTourIds);
                        this.trips = rawTrips.map(t => ({
                            ...t,
                            hasRated: ratedSet.has(t.tourId)
                        }));
                        this.isLoading = false;
                    },
                    error: () => {
                        // If check fails, still show trips but with buttons visible
                        this.trips = rawTrips;
                        this.isLoading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Error loading trips:', err);
                this.isLoading = false;
            }
        });
    }

    get totalTrips(): number {
        return this.trips.filter(t => t.status === 'Completed').length;
    }

    get totalSpent(): number {
        return this.trips.reduce((acc, trip) => acc + trip.totalCost, 0);
    }

    get avgRating(): number {
        const ratedTrips = this.trips.filter(t => t.rating !== undefined);
        if (ratedTrips.length === 0) return 0;
        const total = ratedTrips.reduce((acc, trip) => acc + (trip.rating || 0), 0);
        return Number((total / ratedTrips.length).toFixed(1));
    }

    openRatingModal(tourId: number) {
        this.selectedTourIdToRate = tourId;
        this.showRatingModal = true;
    }

    closeRatingModal() {
        this.showRatingModal = false;
        this.selectedTourIdToRate = null;
    }

    onRatingSubmitted() {
        this.closeRatingModal();
        this.toastService.show('Thank you for your comprehensive review!', 'success');
        // Mark the trip as rated immediately so the button hides
        if (this.selectedTourIdToRate !== null) {
            this.trips = this.trips.map(t =>
                t.tourId === this.selectedTourIdToRate ? { ...t, hasRated: true } : t
            );
        }
    }
}
