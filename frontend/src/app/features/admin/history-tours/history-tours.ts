import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

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
    touristName?: string;
    tourist?: { user: { name: string } };
    bookingDate: string;
    numberOfPeople: number;
    totalAmount: number;
    status: string;
}

interface ServiceRequirement {
    requirementId: number;
    type: string;
    location: string;
    dateNeeded: string;
    time?: string;
    stayDurationDays?: number;
    estimatedPeople: number;
    status: string;
}

interface DriverOffer {
    offerId: number;
    transportationFare: number;
    routeDetails: string;
    includesFuel: boolean;
    status: string;
    driver: { user: { fullName: string } };
    vehicle: { model: string, capacity: number };
}

interface RestaurantOffer {
    offerId: number;
    pricePerPerson: number;
    status: string;
    restaurant: {
        user: { fullName: string };
        restaurantName: string;
    };
    rentPerNight?: number;
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
    driverOffers: DriverOffer[];
    restaurantOffers: RestaurantOffer[];
    serviceRequirements: ServiceRequirement[];
    bookings: Booking[];
    status: string;
}

@Component({
    selector: 'app-history-tours',
    standalone: true,
    imports: [CommonModule, ConfirmationModalComponent],
    templateUrl: './history-tours.html',
    styleUrl: './history-tours.css'
})
export class HistoryTours implements OnInit {
    tours: DisplayTour[] = [];
    selectedTour: DisplayTour | null = null;
    activeTab: 'basic' | 'requirements' | 'offers' | 'bookings' = 'basic';
    loading = true;
    error = '';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadTours();
    }

    loadTours(): void {
        this.http.get<Tour[]>(`${environment.apiUrl}/api/tours`)
            .subscribe({
                next: (tours) => {
                    this.tours = tours
                        .filter(tour => tour.status === 'Completed')
                        .map(tour => {
                            const restaurantOffers = tour.serviceRequirements
                                .flatMap(req => (req as any).restaurantOffers || [])
                                .filter((o: any) => o.status?.toLowerCase() === 'accepted');

                            return {
                                id: tour.tourId,
                                name: tour.title,
                                destination: tour.destination,
                                description: tour.description || '',
                                startDate: new Date(tour.startDate),
                                endDate: new Date(tour.endDate),
                                duration: `${new Date(tour.startDate).toLocaleDateString()} - ${new Date(tour.endDate).toLocaleDateString()}`,
                                pricePerPerson: tour.pricePerHead,
                                totalSeats: tour.maxCapacity,
                                bookedSeats: tour.currentBookings,
                                driverOffers: tour.driverOffers?.filter(o => o.status?.toLowerCase() === 'accepted') || [],
                                restaurantOffers: restaurantOffers,
                                serviceRequirements: tour.serviceRequirements || [],
                                bookings: (tour.bookings || []).map(b => ({
                                    ...b,
                                    touristName: b.tourist?.user?.name || 'Unknown'
                                })),
                                status: tour.status
                            };
                        });
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading history:', err);
                    this.error = 'Failed to load tour history';
                    this.loading = false;
                }
            });
    }

    selectTour(tour: DisplayTour): void {
        this.selectedTour = tour;
        this.activeTab = 'basic';
    }

    setActiveTab(tab: 'basic' | 'requirements' | 'offers' | 'bookings'): void {
        this.activeTab = tab;
    }

    formatTime(time: string): string {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }
}
