import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface RequestSummary {
  title: string;
  value: string | number;
  subtext?: string;
}

interface RequestItem {
  tourName: string;
  status: string;
  submittedTime: string;
  tourDate: string;
  tourists: string;
  mealType: string;
  pricePerHead: number;
  totalAmount: number;
  calculation: string;
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class Requests implements OnInit {

  summaryStats: RequestSummary[] = [
    { title: 'Total Pending Requests', value: 0 },
    { title: 'Total Pending Value', value: 'PKR 0' },
    { title: 'Under Review', value: 0 }
  ];

  requests: RequestItem[] = [];
  loading = false;
  restaurantId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Get restaurant ID from auth service/token
    const user = this.authService.getUser();
    if (user && user.role === 'Restaurant') {
      // Decode token to get RoleSpecificId (or assume it's in user object if stored there)
      // For now, we'll try to get it from the decoded token logic or a service method
      this.restaurantId = this.getRestaurantIdFromToken();
      if (this.restaurantId) {
        this.loadOffers();
      }
    }
  }

  getRestaurantIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.RoleSpecificId ? parseInt(payload.RoleSpecificId) : null;
      } catch (e) {
        console.error('Error decoding token', e);
        return null;
      }
    }
    return null;
  }

  loadOffers() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/api/restaurantoffers?restaurantId=${this.restaurantId}`)
      .subscribe({
        next: (data) => {
          this.mapOffersToRequests(data);
          this.calculateStats(data);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading offers', err);
          this.loading = false;
        }
      });
  }

  mapOffersToRequests(offers: any[]) {
    this.requests = offers.map(offer => {
      // Calculate derived values
      const totalAmount = offer.pricePerHead * offer.maximumPeople; // Or estimated average
      const submittedDate = new Date(offer.createdAt);
      const now = new Date();
      const diffHrs = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60));
      let timeString = '';
      if (diffHrs < 24) timeString = `Submitted ${diffHrs} hours ago`;
      else timeString = `Submitted ${Math.floor(diffHrs / 24)} days ago`;

      return {
        tourName: offer.serviceRequirement?.tour?.title || 'Unknown Tour',
        status: offer.status,
        submittedTime: timeString,
        tourDate: new Date(offer.serviceRequirement?.dateNeeded).toLocaleDateString(),
        tourists: `${offer.minimumPeople}-${offer.maximumPeople} people`,
        mealType: offer.mealType || 'N/A',
        pricePerHead: offer.pricePerHead,
        totalAmount: totalAmount, // This is an estimate, actual amount depends on final pax
        calculation: `${offer.pricePerHead} × ${offer.maximumPeople} pax (max)`
      };
    });
  }

  calculateStats(offers: any[]) {
    const pending = offers.filter(o => o.status === 'Pending');
    const underReview = offers.filter(o => o.status === 'UnderReview' || o.status === 'Accepted'); // Grouping accepted for now or separate

    // Calculate total value of pending offers (using max people as estimate)
    const pendingValue = pending.reduce((sum, o) => sum + (o.pricePerHead * o.maximumPeople), 0);

    this.summaryStats = [
      { title: 'Total Pending Requests', value: pending.length },
      { title: 'Total Pending Value', value: 'PKR ' + pendingValue.toLocaleString() },
      { title: 'Under Review / Status', value: underReview.length }
    ];
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning-subtle text-warning border-warning-subtle';
      case 'Accepted': return 'bg-success-subtle text-success border-success-subtle';
      case 'Rejected': return 'bg-danger-subtle text-danger border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  getIconClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bi-clock-history';
      case 'Accepted': return 'bi-check-circle';
      case 'Rejected': return 'bi-x-circle';
      default: return 'bi-circle';
    }
  }
}
