import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Added form module
import { MenuSelectionModal } from '../../../shared/menu-selection-modal/menu-selection-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { environment } from '../../../../environments/environment';

// Backend API Interfaces
interface ApiTour {
  tourId: number;
  title: string;
  destination: string;
  departureLocation: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  basePrice: number;
  serviceRequirements: ApiServiceRequirement[];
  driverOffers: ApiDriverOffer[];
  status: string;
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
  restaurantOffers: ApiRestaurantOffer[];
}

interface ApiDriverOffer {
  offerId: number;
  transportationFare: number;
  routeDetails: string;
  includesFuel: boolean;
  status: string;
  driver: {
    user: {
      name: string;
    };
  };
  vehicle: {
    model: string;
    capacity: number;
  };
}

interface ApiRestaurantOffer {
  offerId: number;
  pricePerHead: number;
  status: string;
  // Accommodation fields
  rentPerNight?: number;
  perRoomCapacity?: number;
  totalRooms?: number;
  totalRent?: number;
  stayDurationDays?: number;
  roomCategoryId?: number;
  restaurant: {
    restaurantId: number;
    user: {
      fullName: string;
    };
    restaurantName: string;
  };
}

// Display Interfaces
interface Tour {
  id: number;
  name: string;
  status: 'Pending' | 'Ready to Finalize' | 'Pending Accommodation' | 'Awaiting Offers' | 'Published' | 'Draft' | 'Finalized' | 'InProgress' | 'Completed';
  statusClass: string;
  price: string;
  participants: number;
  destination: string;
  duration: string;
  startDate: string;
  endDate: string;
  transport: {
    hasService: boolean;
    status: 'Accepted' | 'Pending';
    provider?: string;
    details?: string;
    offersCount?: number;
  };
  accommodation: {
    hasService: boolean;
    status: 'Accepted' | 'Pending' | 'Alert';
    provider?: string;
    details?: string;
    offersCount?: number;
  };
  transportState?: {
    capacity: number;
    filled: number;
    remaining: number;
    status: string;
  };
}

interface DriverOffer {
  id: number;
  driverName: string;
  vehicleModel: string;
  vehicleParams: string;
  capacity: number;
  price: string;
  isApproved: boolean;
  offerId: number;
  status: string;
}

interface ServiceRequirement {
  requirementId: number;
  type: string;
  location: string;
  dateNeeded: string;
  details?: string;
  estimatedPeople: number;
  estimatedBudget?: number;
  stayDurationDays?: number;
  status: string;
  offers?: RestaurantOffer[];
}

interface RestaurantOffer {
  offerId: number;
  restaurantName: string;
  restaurantId?: number;
  // Meal fields
  pricePerHead: number;
  minimumPeople: number;
  maximumPeople: number;
  mealType?: string;
  includesBeverages: boolean;
  // Accommodation fields
  rentPerNight?: number;
  perRoomCapacity?: number;
  totalRooms?: number;
  totalRent?: number;
  stayDurationDays?: number;
  roomCategoryId?: number;
  isApproved: boolean;
  restaurant?: {
    restaurantId: number;
    user: { fullName: string };
    restaurantName: string;
  };
}

interface RoomCategory {
  roomCategoryId: number;
  categoryName: string;
  description?: string;
  pricePerNight: number;
  maxGuests: number;
  totalRooms: number;
  availableRooms: number;
  amenities?: string;
  amenitiesArray?: string[];
  roomImages?: { imageUrl: string; isPrimary: boolean }[];
}

@Component({
  selector: 'app-manage-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MenuSelectionModal, ConfirmationModalComponent, ConfirmModal],
  templateUrl: './manage-tours.html',
  styleUrls: ['./manage-tours.css']
})
export class ManageTours implements OnInit {

  selectedTour: Tour | null = null;
  activeTab: 'transport' | 'services' = 'transport';

  // Transport Logic State
  filledCapacity: number = 0;
  remainingNeeded: number = 0;
  currentDriverOffers: DriverOffer[] = [];
  serviceRequirements: ServiceRequirement[] = [];

  tours: Tour[] = [];
  loading: boolean = false;
  error = '';

  // Menu Modal State
  selectedRequirement: ServiceRequirement | null = null;
  selectedOffer: RestaurantOffer | null = null;
  showMenuModal: boolean = false;

  // Accommodation Offer Modal State
  showAccommodationModal: boolean = false;
  availableRoomCategories: RoomCategory[] = [];
  selectedRoomCategory: RoomCategory | null = null;
  loadingRoomCategories: boolean = false;

  // Confirmation Modal State
  showConfirmModal: boolean = false;
  confirmTitle: string = '';
  confirmMessage: string = '';
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  confirmType: 'primary' | 'danger' | 'warning' | 'info' | 'success' = 'danger';
  confirmAction: () => void = () => { };

  // Store raw API data
  private apiTours: ApiTour[] = [];


  constructor(private http: HttpClient, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadTours();
  }

  get filteredTours(): Tour[] {
    // Exclude Finalized, InProgress, and Completed tours
    return this.tours.filter(t =>
      !['Finalized', 'InProgress', 'Completed'].includes(t.status)
    );
  }

  loadTours(): void {
    this.http.get<ApiTour[]>(`${environment.apiUrl}/api/tours`)
      .subscribe({
        next: (apiTours) => {
          this.apiTours = apiTours;
          // Map ALL tours, filtering happens in getter
          this.tours = apiTours.map(tour => this.mapApiTourToDisplayTour(tour));
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading tours:', err);
          this.error = 'Failed to load tours';
          this.loading = false;
          this.toastService.show('Failed to load tours. Please try again.', 'error');
        }
      });
  }

  // Helper Methods for lifecycle constraints
  canStartTour(tour: Tour): boolean {
    if (tour.status !== 'Finalized') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tour.startDate); // Assuming startDate exists on Tour interface
    startDate.setHours(0, 0, 0, 0);
    return today >= startDate;
  }

  canCompleteTour(tour: Tour): boolean {
    if (tour.status !== 'InProgress') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(tour.endDate); // Assuming endDate exists on Tour interface
    endDate.setHours(0, 0, 0, 0);
    return today >= endDate;
  }

  private mapApiTourToDisplayTour(apiTour: ApiTour): Tour {
    const driverOffers = apiTour.driverOffers || [];
    const acceptedDriverOffer = driverOffers.find(o => o.status?.toLowerCase() === 'accepted');
    const pendingDriverOffers = driverOffers.filter(o => o.status?.toLowerCase() === 'pending');

    const serviceRequirements = apiTour.serviceRequirements || [];
    const restaurantOffers = serviceRequirements
      .flatMap(req => req.restaurantOffers || []);
    const acceptedRestaurantOffer = restaurantOffers.find(o => o.status?.toLowerCase() === 'accepted');
    const pendingRestaurantOffers = restaurantOffers.filter(o => o.status?.toLowerCase() === 'pending');

    const hasAcceptedDriver = !!acceptedDriverOffer;
    const hasAcceptedRestaurant = !!acceptedRestaurantOffer;

    let status: Tour['status'];
    let statusClass: string;

    if (apiTour.status === 'Completed') {
      status = 'Completed';
      statusClass = 'bg-secondary text-white';
    } else if (apiTour.status === 'InProgress') {
      status = 'InProgress';
      statusClass = 'bg-primary text-white';
    } else if (apiTour.status === 'Finalized') {
      status = 'Finalized';
      statusClass = 'bg-info text-white';
    } else if (hasAcceptedDriver && hasAcceptedRestaurant) {
      status = 'Ready to Finalize';
      statusClass = 'bg-success text-white';
    } else if (hasAcceptedDriver && !hasAcceptedRestaurant) {
      status = 'Pending Accommodation';
      statusClass = 'bg-orange text-white';
    } else {
      status = 'Awaiting Offers';
      statusClass = 'bg-warning text-dark';
    }

    return {
      id: apiTour.tourId,
      name: apiTour.title || 'Untitled Tour',
      status,
      statusClass,
      price: `PKR ${(apiTour.basePrice || 0).toLocaleString()}`,
      participants: apiTour.maxCapacity || 0,
      destination: apiTour.destination || 'Unknown',
      duration: `${new Date(apiTour.startDate).toLocaleDateString()} to ${new Date(apiTour.endDate).toLocaleDateString()}`,
      startDate: apiTour.startDate,
      endDate: apiTour.endDate,
      transport: {
        hasService: driverOffers.length > 0,
        status: hasAcceptedDriver ? 'Accepted' : 'Pending',
        provider: acceptedDriverOffer?.driver?.user?.name,
        details: acceptedDriverOffer ? `PKR ${acceptedDriverOffer.transportationFare.toLocaleString()}` : undefined,
        offersCount: pendingDriverOffers.length
      },
      accommodation: {
        hasService: serviceRequirements.length > 0,
        status: hasAcceptedRestaurant ? 'Accepted' : (pendingRestaurantOffers.length > 0 ? 'Pending' : 'Alert'),
        provider: acceptedRestaurantOffer?.restaurant?.restaurantName,
        details: acceptedRestaurantOffer ? `PKR ${acceptedRestaurantOffer.pricePerHead.toLocaleString()}/person` : undefined,
        offersCount: pendingRestaurantOffers.length
      },
      transportState: { capacity: 0, filled: 0, remaining: apiTour.maxCapacity || 0, status: 'Open' } // Added for the new logic
    };
  }

  selectTour(tour: Tour) {
    this.selectedTour = tour;
    this.activeTab = 'transport';

    // Reset State
    this.filledCapacity = 0;
    this.remainingNeeded = tour.participants;

    // Load real data from API
    const apiTour = this.apiTours.find(t => t.tourId === tour.id);
    if (apiTour) {
      this.loadDriverOffers(apiTour);
      this.loadServiceRequirements(apiTour);
      this.calculateTransportState(tour.id); // Added for the new logic
    }
  }

  private loadDriverOffers(apiTour: ApiTour): void {
    this.currentDriverOffers = (apiTour.driverOffers || []).map(offer => ({
      id: offer.offerId,
      offerId: offer.offerId,
      driverName: offer.driver.user.name,
      vehicleModel: offer.vehicle.model,
      vehicleParams: offer.vehicle.model,
      capacity: offer.vehicle.capacity,
      price: `PKR ${offer.transportationFare.toLocaleString()}`,
      isApproved: offer.status.toLowerCase() === 'accepted',
      status: offer.status // Added for the new logic
    }));

    this.calculateTransportState(apiTour.tourId);
  }

  private loadServiceRequirements(apiTour: ApiTour): void {
    this.serviceRequirements = (apiTour.serviceRequirements || []).map(req => ({
      requirementId: req.requirementId,
      type: req.type,
      location: req.location,
      dateNeeded: req.dateNeeded,
      details: req.type === 'Meal' ? `${req.time ? this.formatTo12Hour(req.time) : 'Time TBD'}` : `${req.stayDurationDays || 1} nights`,
      estimatedPeople: req.estimatedPeople,
      estimatedBudget: req.estimatedBudget,
      status: req.status,
      offers: (req.restaurantOffers || []).map(offer => ({
        offerId: offer.offerId,
        restaurantName: offer.restaurant.restaurantName,
        restaurantId: offer.restaurant.restaurantId,
        // Meal fields
        pricePerHead: offer.pricePerHead || 0,
        minimumPeople: 1,
        maximumPeople: 100,
        mealType: req.type,
        includesBeverages: false,
        // Accommodation fields
        rentPerNight: offer.rentPerNight,
        perRoomCapacity: offer.perRoomCapacity,
        totalRooms: offer.totalRooms,
        totalRent: offer.totalRent,
        stayDurationDays: offer.stayDurationDays || req.stayDurationDays,
        roomCategoryId: offer.roomCategoryId,
        isApproved: offer.status.toLowerCase() === 'accepted'
      }))
    }));
  }

  private formatTo12Hour(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
  }

  clearSelection() {
    this.selectedTour = null;
  }

  toggleDriverApproval(offer: DriverOffer) {
    if (!this.selectedTour) return;

    const newStatus = !offer.isApproved;
    // For rejection/unapproval, use confirmation modal
    if (!newStatus) { // i.e., Rejecting or Unapproving (though logic here toggles)
      // If currently approved, we are unapproving (rejecting?)
      if (offer.isApproved) {
        this.confirmTitle = 'Unapprove Driver Offer?';
        this.confirmMessage = 'Are you sure you want to unapprove this driver offer?';
        this.confirmText = 'Unapprove';
        this.confirmType = 'warning';
        this.confirmAction = () => this.executeDriverToggle(offer, false);
        this.showConfirmModal = true;
        return;
      }
    }

    this.executeDriverToggle(offer, newStatus);
  }

  executeDriverToggle(offer: DriverOffer, newStatus: boolean) {
    const endpoint = `${environment.apiUrl}/api/offers/driver/${offer.offerId}/${newStatus ? 'accept' : 'reject'}`;

    this.http.put(endpoint, {}).subscribe({
      next: () => {
        offer.isApproved = newStatus;
        if (newStatus) {
          offer.status = 'Accepted';
          this.toastService.show('Driver offer accepted successfully', 'success');
        } else {
          offer.status = 'Rejected'; // Or Pending? logic was just toggling approved flag.
          this.toastService.show('Driver offer unapproved/rejected', 'info');
        }

        this.calculateTransportState(this.selectedTour!.id);
        this.syncApiTourState(this.selectedTour!.id); // Persist change to apiTours and list view
      },
      error: (err) => {
        console.error('Error updating driver offer', err);
        this.toastService.show('Failed to update driver offer status', 'error');
        // Revert UI state if needed
        offer.isApproved = !newStatus;
      }
    });
  }

  rejectDriverOffer(offer: DriverOffer) {
    this.confirmTitle = 'Reject Driver Offer';
    this.confirmMessage = 'Are you sure you want to reject this driver offer?';
    this.confirmText = 'Reject';
    this.confirmType = 'danger';

    this.confirmAction = () => {
      const endpoint = `${environment.apiUrl}/api/offers/driver/${offer.offerId}/reject`;
      this.http.put(endpoint, {}).subscribe({
        next: () => {
          offer.status = 'Rejected';
          offer.isApproved = false;
          this.calculateTransportState(this.selectedTour!.id);
          this.syncApiTourState(this.selectedTour!.id); // Persist change to apiTours and list view
          this.toastService.show('Driver offer rejected', 'info');
        },
        error: (err) => {
          console.error('Error rejecting offer', err);
          this.toastService.show('Failed to reject offer', 'error');
        }
      });
    };
    this.showConfirmModal = true;
  }

  calculateTransportState(tourId: number) {
    const tour = this.tours.find(t => t.id === tourId);
    if (!tour) return;

    const apiTour = this.apiTours.find(t => t.tourId === tourId);
    if (!apiTour) return;

    const approvedOffers = this.currentDriverOffers.filter(o => o.isApproved);
    const filled = approvedOffers.reduce((sum, o) => sum + o.capacity, 0);
    const remaining = tour.participants - filled;

    // Synchronize component-level tracking properties if this is the selected tour
    if (this.selectedTour && this.selectedTour.id === tourId) {
      this.filledCapacity = filled;
      this.remainingNeeded = remaining;
    }

    tour.transportState = {
      capacity: tour.participants,
      filled: filled,
      remaining: remaining,
      status: remaining <= 0 ? 'Fulfilled' : 'Open'
    };

    // Update the main tour object's transport status
    tour.transport.status = remaining <= 0 ? 'Accepted' : 'Pending';
    tour.transport.provider = approvedOffers.length > 0 ? approvedOffers[0].driverName : undefined;
    tour.transport.details = approvedOffers.length > 0 ? `PKR ${approvedOffers[0].price.toLocaleString()}` : undefined;
    tour.transport.offersCount = this.currentDriverOffers.filter(o => o.status.toLowerCase() === 'pending').length;
  }

  getRequirementStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-warning text-dark';
      case 'Fulfilled': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      case 'Resolved': return 'bg-success text-white'; // Added for the new logic
      default: return 'bg-secondary text-white';
    }
  }

  approveRestaurantOffer(requirement: ServiceRequirement, offer: RestaurantOffer) {
    this.selectedRequirement = requirement;
    this.selectedOffer = offer;

    // Check requirement type and show appropriate modal
    if (requirement.type === 'Meal') {
      // Open menu selection modal for meal requirements
      this.showMenuModal = true;
    } else if (requirement.type === 'Accommodation') {
      // Open accommodation offer modal for accommodation requirements
      this.showAccommodationModal = true;

      // Fetch room categories if needed
      // Use efficient safe access for restaurantId
      const restaurantId = offer.restaurant?.restaurantId || offer.restaurantId;
      if (this.needsRoomCategorySelection(offer) && restaurantId) {
        this.fetchRoomCategories(restaurantId);
        this.selectedRoomCategory = null; // Reset selection
      }
    }
  }

  onMenuConfirm(selectedItems: any[]) {
    if (!this.selectedRequirement || !this.selectedOffer) return;

    console.log('Confirming menu selection for offer:', this.selectedOffer.offerId);
    console.log('Selected items:', selectedItems);

    // Call backend API
    this.http.post(`${environment.apiUrl}/api/RestaurantOffers/${this.selectedOffer.offerId}/accept`, { selectedMenuItems: selectedItems })
      .subscribe({
        next: () => {
          // Mark as approved
          if (this.selectedOffer) {
            this.selectedOffer.isApproved = true;
            this.selectedRequirement!.status = 'Resolved'; // Update requirement status locally
          }
          this.syncApiTourState(this.selectedTour!.id);
          this.showMenuModal = false;
          this.toastService.show('Restaurant offer accepted successfully', 'success');

          // Close modal and clear selection ONLY after success
          this.selectedRequirement = null;
          this.selectedOffer = null;
        },
        error: (err) => {
          console.error('Error approving offer:', err);
          this.toastService.show('Failed to approve offer', 'error');
        }
      });
  }

  onMenuModalClose() {
    this.showMenuModal = false;
    this.selectedRequirement = null;
    this.selectedOffer = null;
  }

  onAccommodationModalClose() {
    this.showAccommodationModal = false;
    this.selectedRequirement = null;
    this.selectedOffer = null;
  }

  approveAccommodationOffer() {
    if (!this.selectedRequirement || !this.selectedOffer) return;

    console.log('Approving accommodation offer:', this.selectedOffer.offerId);

    // Validation for room category selection
    if (this.needsRoomCategorySelection(this.selectedOffer)) {
      if (!this.selectedRoomCategory) {
        this.toastService.show('Please select a room category to proceed', 'warning');
        return;
      }
    }

    const payload = {
      selectedMenuItems: [],
      roomCategoryId: this.selectedRoomCategory?.roomCategoryId
    };

    // Call backend API to approve accommodation offer
    this.http.post(`${environment.apiUrl}/api/RestaurantOffers/${this.selectedOffer.offerId}/accept`, payload)
      .subscribe({
        next: () => {
          // Mark as approved
          if (this.selectedOffer) {
            this.selectedOffer.isApproved = true;
            this.selectedRequirement!.status = 'Resolved';
          }
          this.syncApiTourState(this.selectedTour!.id);
          this.showAccommodationModal = false;
          this.toastService.show('Accommodation offer accepted successfully', 'success');
          
          // Clear selection ONLY after success
          this.selectedRequirement = null;
          this.selectedOffer = null;
        },
        error: (err) => {
          console.error('Error approving accommodation offer:', err);
          this.toastService.show('Failed to approve accommodation offer', 'error');
        }
      });
  }

  unapproveRestaurantOffer(requirement: ServiceRequirement, offer: RestaurantOffer) {
    this.confirmTitle = 'Unapprove Restaurant Offer?';
    this.confirmMessage = 'Unapproving this offer will DELETE the associated order and remove the assignment. Are you sure?';
    this.confirmText = 'Unapprove & Delete Order';
    this.confirmType = 'warning';

    this.confirmAction = () => {
      this.http.put(`${environment.apiUrl}/api/RestaurantOffers/${offer.offerId}/reject`, {})
        .subscribe({
          next: () => {
            offer.isApproved = false;
            requirement.status = 'Open';
            this.syncApiTourState(this.selectedTour!.id);
            this.toastService.show('Offer unapproved and order deleted', 'info');
          },
          error: (err) => {
            console.error('Error unapproving offer:', err);
            this.toastService.show('Failed to unapprove offer', 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  rejectRestaurantOffer(offer: RestaurantOffer) {
    this.confirmTitle = 'Reject Restaurant Offer';
    this.confirmMessage = 'Are you sure you want to reject this restaurant offer?';
    this.confirmText = 'Reject Offer';
    this.confirmType = 'danger';

    this.confirmAction = () => {
      this.http.put(`${environment.apiUrl}/api/RestaurantOffers/${offer.offerId}/reject`, {})
        .subscribe({
          next: () => {
            console.log('Rejecting offer:', offer.offerId);
            // Ideally we should update the list to show rejected status
            // For now, removing from list or marking rejected
            // The list filters by req.restaurantOffers. usually shows all.
            this.toastService.show('Restaurant offer rejected', 'info');
          },
          error: (err) => {
            console.error('Error rejecting offer:', err);
            this.toastService.show('Failed to reject offer', 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  onConfirmAction() {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.showConfirmModal = false;
  }

  onCancelAction() {
    this.showConfirmModal = false;
    this.confirmAction = () => { };
  }

  canFinalizeTour(): boolean {
    if (!this.selectedTour) return false;

    // Check 1: Transport capacity fulfilled
    const transportFulfilled = this.filledCapacity >= this.selectedTour.participants;

    // Check 2: All requirements have accepted offers
    const allRequirementsFulfilled = this.serviceRequirements.every(req =>
      req.offers?.some(offer => offer.isApproved)
    );

    return transportFulfilled && allRequirementsFulfilled;
  }

  finalizeTour(tourId?: number) {
    const id = tourId || this.selectedTour?.id;
    if (!id) return;

    if (!this.selectedTour || !this.canFinalizeTour()) {
      this.toastService.show('Cannot finalize: Please fulfill all transport and service requirements', 'warning');
      return;
    }

    this.confirmTitle = 'Finalize Tour?';
    this.confirmMessage = `Finalize tour "${this.selectedTour.name}"? This will lock all approved offers and make the tour available for booking.`;
    this.confirmText = 'Finalize Tour';
    this.confirmType = 'info';

    this.confirmAction = () => {
      this.http.post(`${environment.apiUrl}/api/tours/${id}/finalize`, {})
        .subscribe({
          next: () => {
            this.toastService.show('Tour finalized successfully! It is now ready for tourist bookings.', 'success');
            this.loadTours();
            this.clearSelection();
          },
          error: (err: any) => {
            console.error('Finalization failed:', err);
            this.toastService.show('Finalization failed: ' + (err.error?.message || 'Unknown error'), 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  startTour(tourId: number) {
    this.confirmTitle = 'Start Tour';
    this.confirmMessage = 'Are you sure you want to start this tour? This will notify all tourists.';
    this.confirmText = 'Start Tour';
    this.confirmType = 'primary';

    this.confirmAction = () => {
      this.http.post(`${environment.apiUrl}/api/tours/${tourId}/start`, {})
        .subscribe({
          next: () => {
            this.toastService.show('Tour started successfully', 'success');
            this.loadTours();
            this.clearSelection();
          },
          error: (err) => {
            console.error('Error starting tour:', err);
            this.toastService.show(err.error?.message || 'Failed to start tour', 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  completeTour(tourId: number) {
    this.confirmTitle = 'Complete Tour';
    this.confirmMessage = 'Are you sure you want to complete this tour? This will mark all bookings as completed.';
    this.confirmText = 'Complete Tour';
    this.confirmType = 'success';

    this.confirmAction = () => {
      this.http.post(`${environment.apiUrl}/api/tours/${tourId}/complete`, {})
        .subscribe({
          next: () => {
            this.toastService.show('Tour completed successfully', 'success');
            this.loadTours();
            this.clearSelection();
          },
          error: (err) => {
            console.error('Error completing tour:', err);
            this.toastService.show(err.error?.message || 'Failed to complete tour', 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  publishTour(tourId: number) {
    this.confirmTitle = 'Publish Tour';
    this.confirmMessage = 'Are you sure you want to publish this tour? It will become visible to tourists for browsing.';
    this.confirmText = 'Publish Tour';
    this.confirmType = 'info';

    this.confirmAction = () => {
      this.http.post(`${environment.apiUrl}/api/tours/${tourId}/publish`, {})
        .subscribe({
          next: (response: any) => {
            this.toastService.show('Tour published successfully!', 'success');
            // Reload tours to reflect the change
            this.loadTours();
            this.clearSelection(); // Deselect the tour so the start button isn't immediately shown
          },
          error: (err: any) => {
            console.error('Publishing failed:', err);
            this.toastService.show('Publishing failed: ' + (err.error?.message || 'Unknown error'), 'error');
          }
        });
    };
    this.showConfirmModal = true;
  }

  // Helper to sync local state after updates
  private syncApiTourState(tourId: number) {
    const apiTour = this.apiTours.find(t => t.tourId === tourId);
    if (!apiTour) return;

    // 1. Sync Driver Offers
    apiTour.driverOffers = this.currentDriverOffers.map(o => {
      // Find original api offer to keep other props
      const existing = apiTour.driverOffers?.find(ao => ao.offerId === o.offerId);
      return {
        ...existing!,
        status: o.status
      };
    });

    // 2. Sync Service Requirements
    apiTour.serviceRequirements = this.serviceRequirements.map(req => {
      const existingReq = apiTour.serviceRequirements?.find(ar => ar.requirementId === req.requirementId);
      return {
        ...existingReq!,
        status: req.status,
        restaurantOffers: req.offers?.map(offOr => {
          const existingOff = existingReq?.restaurantOffers?.find(ao => ao.offerId === offOr.offerId);
          return {
            ...existingOff!,
            status: offOr.isApproved ? 'Accepted' : (existingOff?.status || 'Pending')
          };
        }) || []
      };
    });

    // 3. Update the list view Tour object
    const tourIndex = this.tours.findIndex(t => t.id === tourId);
    if (tourIndex !== -1) {
      this.tours[tourIndex] = this.mapApiTourToDisplayTour(apiTour);
      // Also update selectedTour if it's the one we modified
      if (this.selectedTour?.id === tourId) {
        this.selectedTour = this.tours[tourIndex];
      }
    }
  }

  // Room Category Selection Methods
  fetchRoomCategories(restaurantId: number): void {
    if (!restaurantId) return;

    this.loadingRoomCategories = true;
    this.http.get<RoomCategory[]>(`${environment.apiUrl}/api/restaurants/${restaurantId}/room-categories`)
      .subscribe({
        next: (categories) => {
          this.availableRoomCategories = categories.map(cat => ({
            ...cat,
            amenitiesArray: cat.amenities ? JSON.parse(cat.amenities) : []
          }));
          this.loadingRoomCategories = false;
        },
        error: (err) => {
          console.error('Error fetching room categories:', err);
          this.toastService.show('Failed to load room categories', 'error');
          this.loadingRoomCategories = false;
        }
      });
  }

  selectRoomCategory(category: RoomCategory): void {
    this.selectedRoomCategory = category;
  }

  get calculatedAccommodationPricing() {
    if (!this.selectedRoomCategory || !this.selectedRequirement) {
      return null;
    }

    const estimatedPeople = this.selectedRequirement.estimatedPeople;
    const stayDurationDays = this.selectedOffer?.stayDurationDays || this.selectedRequirement.stayDurationDays || 1;
    const totalRooms = Math.ceil(estimatedPeople / this.selectedRoomCategory.maxGuests);
    const totalCost = totalRooms * this.selectedRoomCategory.pricePerNight * stayDurationDays;

    return {
      rentPerNight: this.selectedRoomCategory.pricePerNight,
      perRoomCapacity: this.selectedRoomCategory.maxGuests,
      totalRooms,
      totalCost,
      stayDurationDays
    };
  }

  needsRoomCategorySelection(offer: RestaurantOffer | null): boolean {
    // If offer has no pricing data (rentPerNight is null/undefined), it needs category selection
    return offer != null && (offer.rentPerNight == null || offer.rentPerNight === 0);
  }

  getPrimaryImage(category: RoomCategory): string {
    const primaryImage = category.roomImages?.find(img => img.isPrimary);
    const imageUrl = primaryImage?.imageUrl || category.roomImages?.[0]?.imageUrl;
    return imageUrl ? `${environment.apiUrl}${imageUrl}` : 'https://via.placeholder.com/300x200?text=No+Image';
  }

}
