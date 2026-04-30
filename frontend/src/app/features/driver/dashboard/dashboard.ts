import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DriverService } from '../../../core/services/driver.service';
import { AuthService } from '../../../core/services/auth.service';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  activeTab: 'overview' | 'ratings' = 'overview';
  driverId: number = 0;

  // Rating Data
  averageOverall: number = 0;
  averageVehicle: number = 0;
  averageComfort: number = 0;
  averageBehaviour: number = 0;
  totalReviews: number = 0;
  reviews: Review[] = [];
  isLoadingRatings: boolean = false;

  // Dashboard Stats
  stats: any = {
    totalEarnings: 0,
    completedTrips: 0,
    activeTours: 0,
    upcomingTours: [],
    recentTours: []
  };
  isLoadingStats: boolean = true;
  payoutsEnabled: boolean = false;
  stripeAccountId: string | null = null;
  isStripeLoading: boolean = false;

  constructor(
    private driverService: DriverService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.driverId = user.id;
      // We must map user.id (userId) to driverId (RoleSpecificId).
      // If user.roleSpecificId exists, we should use that for driver operations that expect DriverId.
      const trueDriverId = user.roleSpecificId || user.id;
      this.fetchRatings(); // This endpoint expects UserId
      this.fetchStats(trueDriverId); // Driver service expects DriverId
      this.fetchDriverProfile(trueDriverId);
    }
  }

  fetchDriverProfile(driverId: number) {
    this.driverService.getDriverById(driverId).subscribe({
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

    const user = this.authService.getUser();
    const driverId = user.roleSpecificId || user.id;

    this.driverService.getStripeOnboardingLink(driverId, returnUrl, refreshUrl).subscribe({
      next: (res: { url: string }) => {
        window.location.href = res.url;
      },
      error: (err: any) => {
        console.error('Failed to get onboarding link', err);
        this.isStripeLoading = false;
      }
    });
  }

  fetchStats(driverId: number) {
    this.isLoadingStats = true;
    this.http.get<any>(`${environment.apiUrl}/api/drivers/${driverId}/dashboard-stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.isLoadingStats = false;
      }
    });
  }

  setTab(tab: 'overview' | 'ratings') {
    this.activeTab = tab;
  }

  fetchRatings() {
    this.isLoadingRatings = true;
    this.driverService.getDriverRatings(this.driverId).subscribe({
      next: (data: any) => {
        this.averageOverall = data.averageOverall;
        this.averageVehicle = data.averageVehicle;
        this.averageComfort = data.averageComfort;
        this.averageBehaviour = data.averageBehaviour;
        this.totalReviews = data.totalReviews;
        this.reviews = data.reviews;
        this.isLoadingRatings = false;
      },
      error: (err: any) => {
        console.error('Failed to load driver ratings', err);
        this.isLoadingRatings = false;
      }
    });
  }

  // Helper method for star arrays
  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i + 1);
  }
}
