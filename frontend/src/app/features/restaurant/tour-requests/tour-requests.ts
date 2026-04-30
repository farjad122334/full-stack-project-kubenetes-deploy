import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

// Raw API tour shape (from /api/tours)
interface ApiTour {
    tourId: number;
    title: string;
    destination: string;
    departureLocation: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    maxCapacity: number;
    pricePerHead: number;
    status: string;
    serviceRequirements: ApiServiceRequirement[];
}

interface ApiServiceRequirement {
    requirementId: number;
    type: string;
    location: string;
    dateNeeded: string;
    time?: string;
    stayDurationDays?: number;
    estimatedPeople: number;
    estimatedBudget?: number;
    status: string;
}

// Display shape
interface Tour {
    tourId: number;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    mealRequirementsCount: number;
    accommodationRequirementsCount: number;
    requirements: ServiceRequirement[];
}

interface ServiceRequirement {
    requirementId: number;
    type: string; // "Meal" or "Accommodation"
    location: string;
    dateNeeded: string;
    time?: string;
    stayDurationDays?: number;
    details?: string;
    estimatedPeople: number;
    estimatedBudget?: number;
    status: string;
}

@Component({
    selector: 'app-tour-requests',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './tour-requests.html',
    styleUrl: './tour-requests.css'
})
export class TourRequests implements OnInit {
    tours: Tour[] = [];
    isLoading = true;
    hasMenuItems = true; // Assume true initially
    hasRooms = true; // Assume true initially
    businessType: string = '';
    restaurantId: number = 0;

    // View state
    showTourDetails = false;
    selectedTour: Tour | null = null;

    // Filters
    filterStatus: string = 'Open';

    // Modal state
    showOfferModal = false;
    selectedRequirement: ServiceRequirement | null = null;

    // Meal offer form
    pricePerHead: number | null = null;
    minimumPeople: number | null = null;
    maximumPeople: number | null = null;
    mealType: string = '';
    includesBeverages: boolean = false;
    offerDetails: string = '';

    // Accommodation offer form
    rentPerNight: number | null = null;
    perRoomCapacity: number | null = null;
    description: string = '';

    constructor(private http: HttpClient, private toastService: ToastService) { }

    ngOnInit() {
        // Get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.businessType = user.businessType || '';
            this.restaurantId = user.roleSpecificId || 0;
        }

        // Check setup status
        if (this.showMenuAlert()) {
            this.checkMenuItems();
        }
        if (this.showRoomsAlert()) {
            this.checkRoomCategories();
        }
        this.loadTourRequirements();
    }

    checkMenuItems() {
        this.http.get<any[]>(`${environment.apiUrl}/api/RestaurantMenu`).subscribe({
            next: (menus) => {
                // Check if any menu has items
                this.hasMenuItems = menus.some(menu => menu.menuItems && menu.menuItems.length > 0);
            },
            error: (err) => {
                console.error('Error checking menu items:', err);
                this.hasMenuItems = false;
            }
        });
    }

    checkRoomCategories() {
        if (!this.restaurantId) return;
        this.http.get<any[]>(`${environment.apiUrl}/api/restaurants/${this.restaurantId}/room-categories`).subscribe({
            next: (categories) => {
                this.hasRooms = categories.length > 0;
            },
            error: (err) => {
                console.error('Error checking room categories:', err);
                this.hasRooms = false;
            }
        });
    }

    showMenuAlert(): boolean {
        return this.businessType === 'Restaurant' || this.businessType === 'Hotel';
    }

    showRoomsAlert(): boolean {
        return this.businessType === 'GuestHouse' || this.businessType === 'Guest House' || this.businessType === 'Hotel';
    }

    loadTourRequirements() {
        this.isLoading = true;
        // Mirror the driver Find Tours approach: fetch all tours and filter locally
        this.http.get<ApiTour[]>(`${environment.apiUrl}/api/tours`).subscribe({
            next: (apiTours) => {
                // Filter for intermediate tours only (same as driver Find Tours logic)
                // Include Draft and Published tours - exclude Finalized, InProgress, Completed, Cancelled
                const intermediateTours = apiTours.filter(t =>
                    t.status === 'Draft' || t.status === 'Published'
                );
                this.buildToursFromApiData(intermediateTours);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading tour requirements:', err);
                this.isLoading = false;
            }
        });
    }

    buildToursFromApiData(apiTours: ApiTour[]) {
        const result: Tour[] = [];

        for (const apiTour of apiTours) {
            const requirements = (apiTour.serviceRequirements || []);
            // Filter requirements based on business type
            const matchingReqs = requirements.filter(req => this.shouldIncludeRequirement(req.type));

            if (matchingReqs.length === 0) continue;

            const displayReqs: ServiceRequirement[] = matchingReqs.map(req => ({
                requirementId: req.requirementId,
                type: req.type,
                location: req.location,
                dateNeeded: req.dateNeeded,
                time: req.time,
                stayDurationDays: req.stayDurationDays,
                estimatedPeople: req.estimatedPeople,
                estimatedBudget: req.estimatedBudget,
                status: req.status
            }));

            result.push({
                tourId: apiTour.tourId,
                title: apiTour.title,
                destination: apiTour.destination,
                startDate: apiTour.startDate,
                endDate: apiTour.endDate,
                durationDays: apiTour.durationDays || 0,
                mealRequirementsCount: displayReqs.filter(r => r.type === 'Meal').length,
                accommodationRequirementsCount: displayReqs.filter(r => r.type === 'Accommodation').length,
                requirements: displayReqs
            });
        }

        this.tours = result;
    }

    shouldIncludeRequirement(requirementType: string): boolean {
        if (!this.businessType) return true;

        const type = this.businessType.toLowerCase().replace(/\s/g, '');

        if (type === 'restaurant') {
            return requirementType === 'Meal';
        } else if (type === 'guesthouse' || type === 'guest house') {
            return requirementType === 'Accommodation';
        } else if (type === 'hotel') {
            return true; // Hotels can offer on both
        }
        // Default: show all if businessType is unknown
        return true;
    }


    viewTourDetails(tour: Tour) {
        this.selectedTour = tour;
        this.showTourDetails = true;
    }

    backToTourList() {
        this.showTourDetails = false;
        this.selectedTour = null;
    }

    getMealRequirements(): ServiceRequirement[] {
        return this.selectedTour?.requirements.filter(r => r.type === 'Meal') || [];
    }

    getAccommodationRequirements(): ServiceRequirement[] {
        return this.selectedTour?.requirements.filter(r => r.type === 'Accommodation') || [];
    }

    openOfferModal(requirement: ServiceRequirement) {
        this.selectedRequirement = requirement;
        this.showOfferModal = true;
        this.resetOfferForm();

        if (requirement.type === 'Meal') {
            // Set defaults for meal offers
            this.minimumPeople = Math.floor(requirement.estimatedPeople * 0.5);
            this.maximumPeople = requirement.estimatedPeople + 10;
        } else if (requirement.type === 'Accommodation') {
            // Set defaults for accommodation offers
            this.perRoomCapacity = 2; // Default 2 people per room
        }
    }

    closeOfferModal() {
        this.showOfferModal = false;
        this.selectedRequirement = null;
        this.resetOfferForm();
    }

    resetOfferForm() {
        // Meal fields
        this.pricePerHead = null;
        this.minimumPeople = null;
        this.maximumPeople = null;
        this.mealType = '';
        this.includesBeverages = false;

        // Accommodation fields
        this.rentPerNight = null;
        this.perRoomCapacity = null;
        this.description = '';

        // Common
        this.offerDetails = '';
    }

    get calculatedTotalRooms(): number {
        if (this.selectedRequirement && this.perRoomCapacity && this.perRoomCapacity > 0) {
            return Math.ceil(this.selectedRequirement.estimatedPeople / this.perRoomCapacity);
        }
        return 0;
    }

    get calculatedTotalRent(): number {
        if (this.rentPerNight && this.selectedRequirement?.stayDurationDays) {
            return this.calculatedTotalRooms * this.rentPerNight * this.selectedRequirement.stayDurationDays;
        }
        return 0;
    }

    submitOffer() {
        if (!this.selectedRequirement) {
            this.toastService.show('No requirement selected', 'warning');
            return;
        }

        if (!this.restaurantId) {
            this.toastService.show('Restaurant ID not found. Please log in again.', 'error');
            return;
        }

        let offerData: any = {
            requirementId: this.selectedRequirement.requirementId,
            restaurantId: this.restaurantId,
            notes: this.offerDetails || null
        };

        if (this.selectedRequirement.type === 'Meal') {
            if (!this.pricePerHead || !this.minimumPeople || !this.maximumPeople) {
                this.toastService.show('Please fill in all required meal offer fields', 'warning');
                return;
            }

            offerData = {
                ...offerData,
                pricePerHead: this.pricePerHead,
                minimumPeople: this.minimumPeople,
                maximumPeople: this.maximumPeople,
                mealType: this.mealType || null,
                includesBeverages: this.includesBeverages
            };
        } else if (this.selectedRequirement.type === 'Accommodation') {
            // For accommodation offers, just send basic data
            // Admin will select room category and pricing will be calculated automatically
            offerData = {
                ...offerData,
                notes: this.offerDetails || null
            };
        }

        this.http.post(`${environment.apiUrl}/api/restaurantoffers`, offerData).subscribe({
            next: (response) => {
                console.log('Offer submitted:', response);
                this.toastService.show(`Offer submitted successfully for "${this.selectedRequirement?.type}" requirement!`, 'success');
                this.closeOfferModal();
                this.loadTourRequirements(); // Refresh list
            },
            error: (err) => {
                console.error('Error submitting offer:', err);
                this.toastService.show('Failed to submit offer: ' + (err.error || err.message), 'error');
            }
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTypeIcon(type: string): string {
        return type === 'Meal' ? 'bi-cup-hot' : 'bi-building';
    }

    getTypeColor(type: string): string {
        return type === 'Meal' ? 'text-warning' : 'text-info';
    }
}
