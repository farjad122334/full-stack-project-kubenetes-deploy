import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RestaurantService } from '../../../core/services/restaurant.service';

interface StatCard {
  title: string;
  count: number;
  subtext: string;
  icon: string;
  colorClass: string; // 'primary', 'warning', 'success', 'info' (mapped to purple)
}

interface ActivityItem {
  tourName: string;
  status: 'Offer Sent' | 'Offer Approved' | 'Order Confirmed';
  time: string;
  price: number;
  badgeStatus: 'Pending' | 'Approved' | 'Confirmed';
}

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  activeTab: 'overview' | 'ratings' = 'overview';
  hasMenuItems = true; // Assume true initially
  hasRooms = true; // Assume true initially
  businessType: string = '';
  restaurantId: number = 0;
  userId: number = 0;

  // Rating Data
  averageOverall: number = 0;
  averageAccommodation: number = 0;
  averageService: number = 0;
  averageStaff: number = 0;
  totalReviews: number = 0;
  reviews: Review[] = [];
  isLoadingRatings: boolean = false;
  payoutsEnabled: boolean = false;
  stripeAccountId: string | null = null;
  isStripeLoading: boolean = false;

  constructor(private http: HttpClient, private restaurantService: RestaurantService) { }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.businessType = user.businessType || '';
      this.restaurantId = user.roleSpecificId || 0;
      this.userId = user.id || 0; // Fix: use user.id instead of userId
    }

    if (this.showMenuAlert()) {
      this.checkMenuItems();
    }
    if (this.showRoomsAlert()) {
      this.checkRoomCategories();
    }

    if (this.userId > 0) {
      this.fetchRatings();
    }

    if (this.restaurantId > 0) {
      this.fetchDashboardStats();
    }
  }

  fetchDashboardStats() {
    this.http.get<any>(`${environment.apiUrl}/api/restaurants/${this.restaurantId}/dashboard-stats`).subscribe({
      next: (data) => {
        // Update the counts in the stats array while keeping the icons/colors
        this.stats[0].count = data.totalOffersSent;
        this.stats[1].count = data.pendingRequests;
        this.stats[2].count = data.confirmedOrders;
        this.stats[3].count = data.activeMenuItems;

        if (data.activeMenuItems > 0) {
          this.stats[3].subtext = `Across your menus`;
        }

        if (data.recentActivities && data.recentActivities.length > 0) {
          this.recentActivities = data.recentActivities;
        } else {
          this.recentActivities = [];
        }
      },
      error: (err) => {
        console.error('Error fetching dashboard stats:', err);
      }
    });

    // Also fetch restaurant profile to check stripe status
    this.restaurantService.getRestaurant(this.restaurantId).subscribe({
      next: (res: any) => {
        this.payoutsEnabled = res.payoutsEnabled;
        this.stripeAccountId = res.stripeAccountId;
      }
    });
  }

  setupStripeOnboarding() {
    this.isStripeLoading = true;
    const returnUrl = window.location.href;
    const refreshUrl = window.location.href;

    this.restaurantService.getStripeOnboardingLink(this.restaurantId, returnUrl, refreshUrl).subscribe({
      next: (res: { url: string }) => {
        window.location.href = res.url;
      },
      error: (err: any) => {
        console.error('Failed to get onboarding link', err);
        this.isStripeLoading = false;
      }
    });
  }

  checkMenuItems() {
    this.http.get<any[]>(`${environment.apiUrl}/api/RestaurantMenu`).subscribe({
      next: (menus) => {
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

  setTab(tab: 'overview' | 'ratings') {
    this.activeTab = tab;
  }

  fetchRatings() {
    this.isLoadingRatings = true;
    this.http.get<any>(`${environment.apiUrl}/api/ratings/restaurant/${this.userId}`).subscribe({
      next: (data) => {
        this.averageOverall = data.averageOverall;
        this.averageAccommodation = data.averageAccommodation;
        this.averageService = data.averageService;
        this.averageStaff = data.averageStaff;
        this.totalReviews = data.totalReviews;
        this.reviews = data.reviews;
        this.isLoadingRatings = false;
      },
      error: (err) => {
        console.error('Failed to load restaurant ratings', err);
        this.isLoadingRatings = false;
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i + 1);
  }

  stats: StatCard[] = [
    {
      title: 'Total Food Offers Sent',
      count: 24,
      subtext: '+12% from last month',
      icon: 'bi-graph-up-arrow',
      colorClass: 'primary' // Blue
    },
    {
      title: 'Pending Tour Requests',
      count: 8,
      subtext: 'Awaiting admin approval',
      icon: 'bi-clock-history',
      colorClass: 'warning' // Yellow
    },
    {
      title: 'Confirmed Tour Orders',
      count: 16,
      subtext: '+8 this month',
      icon: 'bi-check-lg',
      colorClass: 'success' // Green
    },
    {
      title: 'Active Menu Items',
      count: 42,
      subtext: 'Across 5 menus',
      icon: 'bi-exclamation-circle',
      colorClass: 'purple' // Purple (custom class we will add)
    }
  ];

  recentActivities: ActivityItem[] = [
    {
      tourName: 'Murree Hill Station Tour',
      status: 'Offer Sent',
      time: '2 hours ago',
      price: 45000,
      badgeStatus: 'Pending'
    },
    {
      tourName: 'Hunza Valley Adventure',
      status: 'Offer Approved',
      time: '5 hours ago',
      price: 85000,
      badgeStatus: 'Approved'
    },
    {
      tourName: 'Lahore Heritage Tour',
      status: 'Order Confirmed',
      time: '1 day ago',
      price: 32000,
      badgeStatus: 'Confirmed'
    },
    {
      tourName: 'Swat Valley Exploration',
      status: 'Offer Sent',
      time: '2 days ago',
      price: 62000,
      badgeStatus: 'Pending'
    },
    {
      tourName: 'Islamabad City Tour',
      status: 'Offer Approved',
      time: '3 days ago',
      price: 28000,
      badgeStatus: 'Approved'
    }
  ];

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning-subtle text-warning';
      case 'Approved': return 'bg-primary-subtle text-primary';
      case 'Confirmed': return 'bg-success-subtle text-success';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}
