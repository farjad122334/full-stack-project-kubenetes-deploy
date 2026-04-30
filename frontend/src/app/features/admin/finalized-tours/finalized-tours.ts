import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Tour {
    tourId: number;
    title: string;
    destination: string;
    departureLocation: string;
    description?: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    currentBookings: number;
    pricePerHead: number;
    serviceRequirements: ServiceRequirement[];
    driverOffers: DriverOffer[];
    status: string;
    bookings?: Booking[];
}

interface Booking {
    bookingId: number;
    touristName?: string; // We'll map this from tourist.user.name
    tourist?: {
        user: {
            name: string;
        };
    };
    numberOfPeople: number;
    totalAmount: number;
    status: string;
    bookingDate: string;
}

interface ServiceRequirement {
    requirementId: number;
    type: string;
    location: string;
    dateNeeded: string;
    time?: string;
    stayDurationDays?: number;
    estimatedPeople: number;
    restaurantOffers: RestaurantOffer[];
    assignment?: {
        assignmentId: number;
        isServed: boolean;
        isPaid?: boolean;
        paidAt?: string;
        paymentMethod?: string;
        servedAt?: string;
    };
}

interface DriverOffer {
    offerId: number;
    transportationFare: number;
    routeDetails: string;
    includesFuel: boolean;
    status: string;
    driver: {
        user: {
            fullName: string;
        };
    };
    vehicle: {
        model: string;
        capacity: number;
    };
}

interface RestaurantOffer {
    offerId: number;
    pricePerPerson: number;
    status: string;
    restaurant: {
        user: {
            fullName: string;
        };
        restaurantName: string;
    };
    // Accommodation fields
    rentPerNight?: number;
    totalRooms?: number;
    totalRent?: number;
    stayDurationDays?: number;
}

interface DisplayTour {
    id: number;
    name: string;
    destination: string;
    description: string;
    startDate: Date;
    endDate: Date;
    duration: string;
    pricePerPerson: number;
    totalSeats: number;
    bookedSeats: number;
    hasDriverOffer: boolean;
    hasRestaurantOffer: boolean;
    driverOffers: DriverOffer[];
    restaurantOffers: RestaurantOffer[];
    serviceRequirements: ServiceRequirement[];
    bookings: Booking[];
    status: string;
}

import { Router } from '@angular/router';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-finalized-tours',
    standalone: true,
    imports: [CommonModule, ConfirmationModalComponent],
    templateUrl: './finalized-tours.html',
    styleUrl: './finalized-tours.css'
})
export class FinalizedTours implements OnInit {

    tours: DisplayTour[] = [];
    selectedTour: DisplayTour | null = null;
    activeTab: 'basic' | 'requirements' | 'offers' | 'bookings' = 'basic';

    loading = true;
    error = '';

    // Confirmation Modal State
    showConfirmModal = false;
    confirmTitle = '';
    confirmMessage = '';
    confirmText = 'Confirm';
    cancelText = 'Cancel';
    confirmType: 'danger' | 'warning' | 'info' = 'info';
    private confirmAction: (() => void) | null = null;

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit(): void {
        this.loadTours();
    }

    loadTours(): void {
        this.http.get<Tour[]>(`${environment.apiUrl}/api/tours`)
            .subscribe({
                next: (tours) => {
                    // Filter to show Finalized, Ready, and InProgress tours (Excluding Completed as it has its own page)
                    this.tours = tours
                        .filter(tour => ['Finalized', 'Ready', 'InProgress'].includes(tour.status))
                        .map(tour => {
                            const allRestaurantOffers = tour.serviceRequirements
                                .flatMap(req => req.restaurantOffers || []);

                            const bookings = (tour.bookings || []).map(b => ({
                                ...b,
                                touristName: b.tourist?.user?.name || 'Unknown Tourist'
                            }));

                            return {
                                id: tour.tourId,
                                name: tour.title,
                                destination: tour.destination,
                                description: tour.description || 'No description available',
                                startDate: new Date(tour.startDate),
                                endDate: new Date(tour.endDate),
                                duration: this.calculateDuration(tour.startDate, tour.endDate),
                                pricePerPerson: tour.pricePerHead,
                                totalSeats: tour.maxCapacity,
                                bookedSeats: tour.currentBookings,
                                hasDriverOffer: (tour.driverOffers?.length || 0) > 0,
                                hasRestaurantOffer: allRestaurantOffers.length > 0,
                                driverOffers: tour.driverOffers || [],
                                restaurantOffers: allRestaurantOffers,
                                serviceRequirements: tour.serviceRequirements || [],
                                bookings: bookings,
                                status: tour.status
                            };
                        });


                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading tours:', err);
                    this.error = 'Failed to load tours';
                    this.loading = false;
                }
            });
    }

    selectTour(tour: DisplayTour): void {
        this.selectedTour = tour;
        this.activeTab = 'basic'; // Reset tab when switching tours
    }

    setActiveTab(tab: 'basic' | 'requirements' | 'offers' | 'bookings'): void {
        this.activeTab = tab;
    }

    calculateDuration(start: string, end: string): string {
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e.getTime() - s.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} Days`;
    }

    getOfferStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'accepted': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'rejected': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    // Helper to format time for UI (reused logic)
    formatTime(time?: string): string {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    }

    initiatePayout(req: ServiceRequirement): void {
        if (!req.assignment) return;
        this.http.post(`${environment.apiUrl}/api/payouts/restaurant/${req.assignment.assignmentId}/initiate`, {})
            .subscribe({
                next: (res: any) => {
                    alert(res.message);
                },
                error: (err) => alert('Failed to initiate payout')
            });
    }

    confirmPayout(req: ServiceRequirement): void {
        if (!req.assignment) return;
        this.http.post(`${environment.apiUrl}/api/payouts/restaurant/${req.assignment.assignmentId}/confirm`, {})
            .subscribe({
                next: (res: any) => {
                    req.assignment!.isPaid = true;
                    req.assignment!.paidAt = new Date().toISOString();
                },
                error: (err) => alert('Failed to confirm payout')
            });
    }

    markAsServed(req: ServiceRequirement, paymentMethod: 'Cash' | 'Online'): void {
        if (!req.assignment) return;

        if (paymentMethod === 'Online' && !req.assignment.isPaid) {
            alert('Payout must be completed before marking as served.');
            return;
        }

        this.confirmTitle = `Mark as Served (${paymentMethod})`;
        this.confirmMessage = `Are you sure you want to mark this ${req.type} as served via ${paymentMethod}?`;
        this.confirmText = 'Mark Served';
        this.confirmType = 'info';
        this.confirmAction = () => {
            this.http.put(`${environment.apiUrl}/api/RestaurantAssignments/${req.assignment!.assignmentId}/serve`, {
                isServed: true,
                paymentMethod: paymentMethod
            }).subscribe({
                next: () => {
                    req.assignment!.isServed = true;
                    req.assignment!.paymentMethod = paymentMethod;
                    req.assignment!.servedAt = new Date().toISOString();
                },
                error: (err: any) => {
                    alert(err.error || 'Error marking as served');
                }
            });
        };
        this.showConfirmModal = true;
    }

    markTourAsReady(tourId: number): void {
        this.confirmTitle = 'Mark as Ready';
        this.confirmMessage = 'Are you sure you want to mark this tour as Ready? This indicates all bookings are confirmed and the tour is prepared for departure.';
        this.confirmText = 'Mark Ready';
        this.confirmType = 'info';
        this.confirmAction = () => {
            this.http.post(`${environment.apiUrl}/api/tours/${tourId}/mark-ready`, {})
                .subscribe({
                    next: () => {
                        this.loadTours();
                    },
                    error: (err) => {
                        console.error('Error marking tour as ready:', err);
                    }
                });
        };
        this.showConfirmModal = true;
    }

    startTour(tourId: number): void {
        this.confirmTitle = 'Start Tour';
        this.confirmMessage = 'Are you sure you want to start this tour? This will change the status to In Progress.';
        this.confirmText = 'Start Tour';
        this.confirmType = 'info';
        this.confirmAction = () => {
            this.http.post(`${environment.apiUrl}/api/tours/${tourId}/start`, {})
                .subscribe({
                    next: () => {
                        this.loadTours();
                    },
                    error: (err) => {
                        console.error('Error starting tour:', err);
                    }
                });
        };
        this.showConfirmModal = true;
    }

    completeTour(tourId: number): void {
        this.confirmTitle = 'Proceed to End Tour';
        this.confirmMessage = 'This will take you to the Driver Payout page to complete payments and finalize the tour.';
        this.confirmText = 'Proceed';
        this.confirmType = 'info';
        this.confirmAction = () => {
            this.router.navigate(['/admin/driver-payouts', tourId]);
        };
        this.showConfirmModal = true;
    }

    onConfirmAction(): void {
        if (this.confirmAction) {
            this.confirmAction();
        }
        this.showConfirmModal = false;
    }

    onCancelAction(): void {
        this.showConfirmModal = false;
        this.confirmAction = null;
    }

    canStartTour(tour: DisplayTour): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(tour.startDate);
        startDate.setHours(0, 0, 0, 0);
        return today >= startDate;
    }

    canCompleteTour(tour: DisplayTour): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(tour.endDate);
        endDate.setHours(0, 0, 0, 0);
        return today >= endDate;
    }

    currentFilter: 'All' | 'Finalized' | 'Ready' | 'Started' = 'All';

    get filteredTours(): DisplayTour[] {
        if (this.currentFilter === 'All') {
            return this.tours.filter(t => ['Finalized', 'Ready', 'InProgress'].includes(t.status));
        }
        if (this.currentFilter === 'Finalized') return this.tours.filter(t => t.status === 'Finalized');
        if (this.currentFilter === 'Ready') return this.tours.filter(t => t.status === 'Ready');
        if (this.currentFilter === 'Started') return this.tours.filter(t => t.status === 'InProgress');
        return this.tours;
    }

    setFilter(filter: 'All' | 'Finalized' | 'Ready' | 'Started'): void {
        this.currentFilter = filter;
        this.selectedTour = null;
    }
}
