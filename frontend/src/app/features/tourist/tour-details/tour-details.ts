import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Tour } from '../../../core/models/tour.interface';
import { TourService } from '../../../core/services/tour.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-tour-details',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './tour-details.html',
    styleUrls: ['./tour-details.css']
})
export class TourDetailsComponent implements OnInit {

    tour: Tour | undefined;
    isLoading: boolean = true;
    isBooking: boolean = false;
    seatsRemaining: number = 0;
    isAlreadyBooked: boolean = false;

    // Booking Fields
    selectedBookingType: string = 'Individual';
    numberOfPeople: number = 1;
    totalPrice: number = 0;
    minPeople: number = 1;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tourService: TourService,
        private bookingService: BookingService,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.tourService.getTourById(id).subscribe({
                next: (data) => {
                    this.tour = data;
                    if (this.tour) {
                        this.seatsRemaining = (this.tour.totalSeats || 0) - (this.tour.seatsBooked || 0);
                        this.updatePrice();
                        this.checkIfBooked();
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error("Error fetching tour", err);
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    updatePrice() {
        if (!this.tour) return;

        let price = this.tour.pricePerHead || 0;
        let discount = 0;

        if (this.selectedBookingType === 'Individual') {
            this.numberOfPeople = 1;
            this.minPeople = 1;
            discount = 0;
        } else if (this.selectedBookingType === 'Couple') {
            this.numberOfPeople = 2;
            this.minPeople = 2;
            if (this.tour.coupleDiscountPercentage) {
                discount = (price * 2) * (this.tour.coupleDiscountPercentage / 100);
            }
        } else if (this.selectedBookingType === 'Bulk') {
            this.minPeople = 6;
            // Removed auto-reset to allow validation error to show

            if (this.tour.bulkDiscountPercentage) {
                discount = (price * this.numberOfPeople) * (this.tour.bulkDiscountPercentage / 100);
            }
        }

        this.totalPrice = (price * this.numberOfPeople) - discount;
    }

    checkIfBooked() {
        if (!this.tour) return;
        const user = this.authService.getUser();
        if (user && user.roleSpecificId) {
            this.bookingService.getTouristBookings(user.roleSpecificId).subscribe({
                next: (bookings) => {
                    this.isAlreadyBooked = bookings.some(b => b.tourId === this.tour?.id && b.status !== 'Cancelled');
                }
            });
        }
    }

    bookTour() {
        if (!this.tour || this.isBooking) return;

        // Validation
        if (this.selectedBookingType === 'Bulk' && this.numberOfPeople < 6) {
            this.toastService.show('Bulk booking requires at least 6 people', 'warning');
            return;
        }

        if (this.numberOfPeople > this.seatsRemaining) {
            this.toastService.show(`Only ${this.seatsRemaining} seats left for this tour`, 'error');
            return;
        }

        const user = this.authService.getUser();
        if (!user || !user.roleSpecificId) {
            this.toastService.show('Please log in as a tourist to book', 'error');
            this.router.navigate(['/login']);
            return;
        }

        this.isBooking = true;

        const bookingRequest = {
            tourId: this.tour.id,
            touristId: user.roleSpecificId,
            numberOfPeople: this.numberOfPeople,
            totalAmount: this.totalPrice,
            bookingType: this.selectedBookingType
        };

        this.toastService.show('Initiating payment session...', 'info');

        this.bookingService.createBookingSession(bookingRequest).subscribe({
            next: (session) => {
                window.location.href = session.url;
            },
            error: (err) => {
                console.error('Booking failed', err);
                const errorMsg = err.error?.message || err.error || err.message || 'Unknown error';
                this.toastService.show('Booking Failed: ' + errorMsg, 'error');
                this.isBooking = false;
            }
        });
    }

}
