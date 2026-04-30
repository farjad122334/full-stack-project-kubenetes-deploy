import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../../core/services/driver.service';
import { AuthService } from '../../../core/services/auth.service';

interface TourRequest {
  id: number;
  title: string;
  route: string;
  duration: string;
  date: string;
  appliedDate: string;
  price: number;
  status: string;
  adminStatus: string;
  statusClass: string;
}

@Component({
  selector: 'app-requests',
  inputs: [],
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class Requests implements OnInit {
  requests: TourRequest[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private driverService: DriverService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const user = this.authService.getUser();
    const driverId = user?.roleSpecificId;

    if (!driverId) {
      this.error = 'Driver information not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.driverService.getDriverOffers(driverId).subscribe({
      next: (response: any) => {
        const offers = Array.isArray(response) ? response : (response?.data || []);

        if (offers.length === 0) {
          this.requests = [];
          this.loading = false;
          return;
        }

        this.requests = offers.map((offer: any) => {
          const tour = offer.tour;
          const statusMap: { [key: string]: { label: string, class: string, admin: string } } = {
            'pending': { label: 'Pending', class: 'bg-warning-subtle text-warning', admin: 'Awaiting admin approval' },
            'accepted': { label: 'Approved', class: 'bg-info-subtle text-info', admin: 'Approved (Tour in progress)' },
            'confirmed': { label: 'Approved', class: 'bg-success-subtle text-success', admin: 'Approved (Tour Finalized)' },
            'rejected': { label: 'Rejected', class: 'bg-danger-subtle text-danger', admin: 'Rejected by admin' }
          };

          const s = statusMap[(offer.status || '').toString().toLowerCase()] || { label: offer.status, class: 'bg-secondary-subtle text-secondary', admin: 'Status Unknown' };

          return {
            id: offer.offerId,
            title: tour?.title || 'Unknown Tour',
            route: `${tour?.departureLocation || ''} → ${tour?.destination || ''}`,
            duration: tour ? `${(new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime()) / (1000 * 3600 * 24) + 1} Days` : 'N/A',
            date: tour ? new Date(tour.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            appliedDate: new Date(offer.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            price: offer.transportationFare,
            status: s.label,
            statusClass: s.class,
            adminStatus: s.admin
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading driver offers:', err);
        // If 404, just show empty list gracefully
        if (err.status === 404) {
          this.requests = [];
          this.error = null;
        } else {
          this.error = 'Failed to load requests. Please try again later.';
        }
        this.loading = false;
      }
    });
  }
}
