import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats: {
    activeBookings: number;
    upcomingTrips: number;
    completedTrips: number;
    newNotifications: number;
  } = {
      activeBookings: 0,
      upcomingTrips: 0,
      completedTrips: 0,
      newNotifications: 0
    };

  activeTab: 'overview' | 'bookings' | 'history' = 'overview';
  recentBookings: any[] = [];
  activeBookings: any[] = [];
  completedBookings: any[] = [];
  upcomingTrips: any[] = [];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.roleSpecificId) {
      this.loadBookings(user.roleSpecificId);
    }
  }

  loadBookings(touristId: number): void {
    console.log('Loading bookings for touristId:', touristId);
    this.bookingService.getTouristBookings(touristId).subscribe({
      next: (bookings) => {
        console.log('Bookings loaded:', bookings);
        const allMapped = bookings.map(b => ({
          id: b.bookingId,
          tourId: b.tourId,
          tourName: b.tour?.title || 'Unknown Tour',
          location: b.tour?.destination || 'N/A',
          date: new Date(b.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          startDate: b.tour?.startDate ? new Date(b.tour.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA',
          persons: b.numberOfPeople,
          totalAmount: b.totalAmount,
          status: b.status,
          tour: b.tour
        }));

        const activeList = allMapped.filter(b => {
          const status = b.status?.toLowerCase();
          const tourStatus = b.tour?.status?.toLowerCase();
          return status !== 'completed' && status !== 'cancelled' && tourStatus !== 'completed' && tourStatus !== 'cancelled';
        });

        const historyList = allMapped.filter(b => {
          const status = b.status?.toLowerCase();
          const tourStatus = b.tour?.status?.toLowerCase();
          return status === 'completed' || status === 'cancelled' || tourStatus === 'completed' || tourStatus === 'cancelled';
        });

        this.recentBookings = activeList.slice(0, 5);
        this.activeBookings = activeList;
        this.completedBookings = historyList;

        // Filter for upcoming trips
        this.upcomingTrips = bookings
          .filter(b => b.status === 'Confirmed')
          .slice(0, 3)
          .map(b => ({
            name: b.tour.title,
            location: b.tour.destination,
            date: new Date(b.tour.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            duration: `${b.tour.durationDays} Days`
          }));

        // Calculate stats
        this.stats.activeBookings = bookings.filter(b => {
          const s = b.status?.toLowerCase();
          const ts = b.tour?.status?.toLowerCase();
          return s === 'confirmed' && ts !== 'completed' && ts !== 'cancelled';
        }).length;
        this.stats.upcomingTrips = this.upcomingTrips.length;
        this.stats.completedTrips = bookings.filter(b => {
          const s = b.status?.toLowerCase();
          const ts = b.tour?.status?.toLowerCase();
          return s === 'completed' || ts === 'completed';
        }).length;
        this.stats.newNotifications = 0;
      },
      error: (err) => {
        console.error('Error loading tourist bookings:', err);
      }
    });
  }

  setTab(tab: 'overview' | 'bookings' | 'history'): void {
    this.activeTab = tab;
  }

  viewDetails(tourId: number) {
    console.log('View details for tour:', tourId);
  }
}
