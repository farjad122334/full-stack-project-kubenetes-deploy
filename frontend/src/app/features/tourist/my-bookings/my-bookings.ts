import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReviewModal } from '../../../shared/components/review-modal/review-modal';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

interface DisplayBooking {
  id: number;
  tourId: number;
  title: string;
  location: string;
  status: string;
  bookingDate: string;
  startDate: string;
  endDate: string;
  duration: string;
  totalCost: number;
  persons: number;
  tour: any;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewModal],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {

  bookings: DisplayBooking[] = [];
  isLoading: boolean = true;
  isPayingId: number | null = null;

  // Review Modal State
  selectedTourId: number | null = null;
  showReviewModal: boolean = false;

  // Map Modal State
  selectedBookingForMap: DisplayBooking | null = null;
  showMapModal: boolean = false;
  @ViewChild('bookingMapContainer') bookingMapContainer!: ElementRef;
  bookingMap!: L.Map;
  bookingMarker!: L.Marker;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private toastService: ToastService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.roleSpecificId) {
      this.loadBookings(user.roleSpecificId);
    }
  }

  loadBookings(touristId: number): void {
    this.bookingService.getTouristBookings(touristId).subscribe({
      next: (data) => {
        this.bookings = data
          .filter(b => {
            const s = b.status?.toLowerCase();
            const ts = b.tour?.status?.toLowerCase();
            return s !== 'completed' && s !== 'cancelled' && ts !== 'completed' && ts !== 'cancelled';
          })
          .map(b => ({
            id: b.bookingId,
            tourId: b.tourId,
            title: b.tour?.title || 'Unknown Tour',
            location: b.tour?.destination || 'N/A',
            status: b.status,
            bookingDate: new Date(b.bookingDate).toLocaleDateString(),
            startDate: b.tour?.startDate ? new Date(b.tour.startDate).toLocaleDateString() : 'TBA',
            endDate: b.tour?.endDate ? new Date(b.tour.endDate).toLocaleDateString() : 'TBA',
            duration: b.tour ? `${b.tour.durationDays} Days` : 'N/A',
            totalCost: b.totalAmount,
            persons: b.numberOfPeople,
            tour: b.tour
          }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading = false;
      }
    });
  }

  openReviewModal(tourId: number) {
    this.selectedTourId = tourId;
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedTourId = null;
  }

  submitReview(bookingId: number) {
    this.toastService.show('Thank you for your review!', 'success');
  }

  openMapModal(booking: DisplayBooking) {
    this.selectedBookingForMap = booking;
    this.showMapModal = true;
    
    // Give time for modal to render
    setTimeout(() => {
        this.initializeMapForBooking();
    }, 100);
  }

  closeMapModal() {
    this.showMapModal = false;
    this.selectedBookingForMap = null;
  }

  initializeMapForBooking() {
    if (!this.selectedBookingForMap || !this.bookingMapContainer) return;

    const tour = this.selectedBookingForMap.tour;
    const lat = tour.departureLatitude;
    const lng = tour.departureLongitude;

    const initLeafletMap = (position: [number, number]) => {
        // clean up existing map if any
        if (this.bookingMap) {
            this.bookingMap.remove();
        }

        this.bookingMap = L.map(this.bookingMapContainer.nativeElement).setView(position, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.bookingMap);

        const icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        this.bookingMarker = L.marker(position, { icon }).addTo(this.bookingMap)
            .bindPopup('Departure Point').openPopup();
            
        setTimeout(() => {
            this.bookingMap.invalidateSize();
        }, 100);
    };

    if (lat && lng) {
        initLeafletMap([lat, lng]);
    } else {
        // Fallback to geocoding the address if coords are missing
        const q = encodeURIComponent(tour.departureLocation);
        this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`).subscribe({
            next: (results) => {
                if (results && results.length > 0) {
                    initLeafletMap([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
                } else {
                    this.toastService.show('Location map unavailable', 'warning');
                }
            },
            error: () => this.toastService.show('Location map unavailable', 'warning')
        });
    }
  }

  payNow(bookingId: number): void {
    this.isPayingId = bookingId;
    this.bookingService.createCheckoutSession(bookingId).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error('Checkout error:', err);
        this.toastService.show('Failed to initiate payment. Please try again.', 'error');
        this.isPayingId = null;
      }
    });
  }

  get completedCount(): number {
    return this.bookings.filter(t => t.status === 'Completed').length;
  }

  get ongoingCount(): number {
    return this.bookings.filter(t => t.status === 'Confirmed').length;
  }

  get pendingCount(): number {
    return this.bookings.filter(t => t.status === 'Pending').length;
  }

  formatCurrency(value: number): string {
    return 'Rs. ' + value.toLocaleString();
  }
}
