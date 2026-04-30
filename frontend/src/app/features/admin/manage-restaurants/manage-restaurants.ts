import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService, RestaurantDto, RestaurantStatsDto } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Partner {
  id: number;
  name: string;
  type: 'Hotel' | 'Restaurant';
  status: 'Verified' | 'Pending' | 'Rejected';
  location: string;
  rating: number;
  phone: string;
  email: string;
  capacity: string;
  specialOffer: string;
  imageUrl: string;
  businessLicense: string | null;
}

@Component({
  selector: 'app-manage-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-restaurants.html',
  styleUrl: './manage-restaurants.css'
})
export class ManageRestaurants implements OnInit {
  searchTerm: string = '';
  activeTab: 'all' | 'verified' | 'pending' | 'rejected' = 'all';

  stats = {
    totalHotels: 0,
    hotelGrowth: 0,
    totalRestaurants: 0,
    restaurantGrowth: 0,
    pending: 0
  };

  partners: Partner[] = [];
  loading = true;
  error: string | null = null;

  // Confirmation Modal
  showConfirmModal = false;
  confirmMessage = '';
  confirmType: 'approve' | 'reject' = 'approve';
  private confirmCallback: (() => void) | null = null;

  // License Modal
  showLicenseModal = false;
  selectedPartner: Partner | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadStats();
    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        const filter = params['filter'] as 'all' | 'verified' | 'pending' | 'rejected';
        if (['all', 'verified', 'pending', 'rejected'].includes(filter)) {
          this.activeTab = filter;
        }
      }
    });
  }

  loadRestaurants(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getRestaurants().subscribe({
      next: (restaurants: RestaurantDto[]) => {
        this.partners = restaurants.map(r => this.mapToPartner(r));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading restaurants:', err);
        this.error = 'Failed to load restaurants. Please try again.';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.adminService.getRestaurantStats().subscribe({
      next: (stats: RestaurantStatsDto) => {
        this.stats = {
          totalHotels: stats.totalHotels,
          hotelGrowth: stats.hotelGrowthThisMonth,
          totalRestaurants: stats.totalRestaurants,
          restaurantGrowth: stats.restaurantGrowthThisMonth,
          pending: stats.pendingVerification
        };
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  get filteredPartners() {
    return this.partners.filter(partner => {
      const matchesSearch =
        partner.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.phone.includes(this.searchTerm);

      if (this.activeTab === 'all') return matchesSearch;

      const status = partner.status.toLowerCase();
      if (this.activeTab === 'verified') return matchesSearch && status === 'verified';
      return matchesSearch && status === this.activeTab;
    });
  }

  setActiveTab(tab: 'all' | 'verified' | 'pending' | 'rejected') {
    this.activeTab = tab;
  }

  mapToPartner(restaurant: RestaurantDto): Partner {
    const isHotel = restaurant.businessType?.toLowerCase() === 'hotel';
    const status = this.mapStatus(restaurant.applicationStatus);

    // Build location string with address and postal code if available
    const location = restaurant.postalCode
      ? `${restaurant.address}, ${restaurant.postalCode}`
      : restaurant.address;

    // Build capacity/owner info
    const capacity = restaurant.ownerName || 'N/A';

    // Build image URL - use profile picture from backend if available, otherwise use placeholder
    let imageUrl = 'https://via.placeholder.com/600x400/1a1a1a/ffffff?text=' + encodeURIComponent(restaurant.restaurantName);

    if (restaurant.profilePicture) {
      // If profile picture exists, construct full backend URL
      if (restaurant.profilePicture.startsWith('http')) {
        imageUrl = restaurant.profilePicture;
      } else {
        imageUrl = `${environment.apiUrl}${restaurant.profilePicture}`;
      }
    }

    // Build business license URL if available
    let businessLicense: string | null = null;
    if (restaurant.businessLicense) {
      if (restaurant.businessLicense.startsWith('http')) {
        businessLicense = restaurant.businessLicense;
      } else {
        businessLicense = `${environment.apiUrl}${restaurant.businessLicense}`;
      }
    }

    return {
      id: restaurant.restaurantId,
      name: restaurant.restaurantName,
      type: isHotel ? 'Hotel' : 'Restaurant',
      status: status,
      location: location,
      rating: Number(restaurant.rating) || 0,
      phone: restaurant.phoneNumber || 'Not provided',
      email: restaurant.email,
      capacity: capacity,
      specialOffer: '',
      imageUrl: imageUrl,
      businessLicense: businessLicense
    };
  }

  viewLicense(partner: Partner) {
    this.selectedPartner = partner;
    this.showLicenseModal = true;
  }

  closeLicenseModal() {
    this.showLicenseModal = false;
    this.selectedPartner = null;
  }

  mapStatus(status: string): 'Verified' | 'Pending' | 'Rejected' {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Verified';
      case 'submitted':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }

  approveRestaurant(partnerId: number): void {
    const partner = this.partners.find(p => p.id === partnerId);
    if (!partner) return;

    this.triggerConfirm(
      `Are you sure you want to approve ${partner.name}?`,
      'approve',
      () => {
        this.adminService.approveRestaurant(partnerId).subscribe({
          next: (updatedRestaurant) => {
            const index = this.partners.findIndex(p => p.id === partnerId);
            if (index !== -1) {
              this.partners[index] = this.mapToPartner(updatedRestaurant);
            }
            this.loadStats();
            this.toastService.show(`Restaurant ${partner.name} approved successfully`, 'success');
          },
          error: (err) => {
            console.error('Error approving restaurant:', err);
            this.toastService.show('Failed to approve restaurant', 'error');
          }
        });
      }
    );
  }

  rejectRestaurant(partnerId: number): void {
    const partner = this.partners.find(p => p.id === partnerId);
    if (!partner) return;

    this.triggerConfirm(
      `Are you sure you want to reject ${partner.name}?`,
      'reject',
      () => {
        this.adminService.rejectRestaurant(partnerId).subscribe({
          next: (updatedRestaurant) => {
            const index = this.partners.findIndex(p => p.id === partnerId);
            if (index !== -1) {
              this.partners[index] = this.mapToPartner(updatedRestaurant);
            }
            this.loadStats();
            this.toastService.show(`Restaurant ${partner.name} rejected`, 'success');
          },
          error: (err) => {
            console.error('Error rejecting restaurant:', err);
            this.toastService.show('Failed to reject restaurant', 'error');
          }
        });
      }
    );
  }

  triggerConfirm(message: string, type: 'approve' | 'reject', callback: () => void) {
    this.confirmMessage = message;
    this.confirmType = type;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  onConfirm() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeModal();
  }

  closeModal() {
    this.showConfirmModal = false;
    this.confirmCallback = null;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
