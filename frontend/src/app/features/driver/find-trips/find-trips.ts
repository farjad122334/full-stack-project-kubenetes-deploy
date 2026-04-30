import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Tour {
    tourId: number;
    title: string;
    description: string;
    destination: string;
    departureLocation: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    pricePerHead: number;
    status: number; // Enum value
    durationDays: number;
}

interface Vehicle {
    vehicleId: number;
    registrationNumber: string;
    vehicleType: string;
    model: string;
    capacity: number;
}

@Component({
    selector: 'app-find-trips',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './find-trips.html',
    styleUrl: './find-trips.css'
})
export class FindTrips implements OnInit {
    tours: Tour[] = [];
    vehicles: Vehicle[] = [];
    isLoading = true;
    selectedTour: Tour | null = null;

    // Offer Form
    offerPrice: number | null = null;
    offerDescription: string = '';
    selectedVehicleId: number | null = null;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadTours();
        this.loadVehicles();
    }

    loadTours() {
        this.isLoading = true;
        this.http.get<Tour[]>(`${environment.apiUrl}/api/tours`).subscribe({
            next: (data: any[]) => {
                // Filter open tours that need transport
                // Only show tours that are NOT Completed, InProgress, Finalized, or Cancelled
                this.tours = data.filter(t => {
                    const status = (t.tourStatus || t.status || '').toString().toLowerCase();
                    return status !== 'completed' && status !== 'inprogress' && status !== 'finalized' && status !== 'cancelled' && status !== '6' && status !== '2' && status !== '5' && status !== '3' && status !== '4';
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading tours:', err);
                this.toastService.show('Failed to load tours.', 'error');
                this.isLoading = false;
            }
        });
    }

    loadVehicles() {
        const user = this.authService.getUser();
        if (user && user.roleSpecificId) {
            this.http.get<Vehicle[]>(`${environment.apiUrl}/api/vehicles/driver/${user.roleSpecificId}`).subscribe({
                next: (data) => {
                    this.vehicles = data;
                    if (this.vehicles.length > 0) {
                        this.selectedVehicleId = this.vehicles[0].vehicleId;
                    }
                },
                error: (err) => {
                    console.error('Error loading vehicles:', err);
                }
            });
        }
    }

    openOfferModal(tour: Tour) {
        this.selectedTour = tour;
        this.offerPrice = null;
        this.offerDescription = '';
        if (this.vehicles.length > 0 && !this.selectedVehicleId) {
            this.selectedVehicleId = this.vehicles[0].vehicleId;
        }
    }

    closeOfferModal() {
        this.selectedTour = null;
    }

    submitOffer() {
        if (!this.selectedTour || !this.offerPrice || !this.selectedVehicleId) {
            this.toastService.show('Please fill in all required fields.', 'warning');
            return;
        }

        const offerData = {
            tourId: this.selectedTour.tourId,
            vehicleId: this.selectedVehicleId,
            quotedPrice: this.offerPrice,
            additionalNotes: this.offerDescription
        };

        this.http.post(`${environment.apiUrl}/api/offers/driver`, offerData).subscribe({
            next: (res) => {
                this.toastService.show('Bid Sent Successfully!', 'success');
                this.closeOfferModal();
            },
            error: (err) => {
                console.error('Error submitting offer:', err);
                const errorMsg = err.error || 'Failed to submit bid.';
                this.toastService.show(errorMsg, 'error');
            }
        });
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
