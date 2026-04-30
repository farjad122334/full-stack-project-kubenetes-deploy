import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';

@Component({
    selector: 'app-booking-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%);">
      <div class="card border-0 shadow-lg text-center p-5" style="max-width: 480px; width: 100%; border-radius: 20px;">
        
        <div class="mb-4">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white"
               style="width: 80px; height: 80px; font-size: 2.5rem;">
            ✓
          </div>
        </div>

        <h2 class="fw-bold text-success mb-2">Payment Successful!</h2>
        <p class="text-muted mb-4">Your booking is now <strong>confirmed</strong>. We've sent a confirmation notification to your account.</p>

        <div class="card bg-light border-0 rounded-3 p-3 mb-4 text-start">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted small">Booking ID</span>
            <span class="fw-medium">
              <span *ngIf="isVerifying" class="spinner-border spinner-border-sm text-primary me-2"></span>
              #{{ bookingId }}
            </span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted small">Session ID</span>
            <span class="fw-medium text-truncate ms-2" style="max-width: 200px; font-size: 0.75rem;">{{ sessionId }}</span>
          </div>
        </div>

        <div *ngIf="bookingId === '...' && !verificationError" class="alert alert-info py-2 small mb-4">
          Verification in progress... If this takes too long, click verify below.
        </div>

        <div *ngIf="verificationError" class="alert alert-danger py-2 small mb-4">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ verificationError }}
        </div>

        <div class="d-grid gap-2">
          <button *ngIf="bookingId === '...'" (click)="verifyBooking()" class="btn btn-primary rounded-pill py-2 mb-2" [disabled]="isVerifying">
             <i class="bi bi-shield-check me-2"></i>Verify Payment Now
          </button>
          <a routerLink="/tourist/my-bookings" class="btn btn-success rounded-pill py-2">
            <i class="bi bi-ticket-perforated me-2"></i>View My Bookings
          </a>
          <a routerLink="/tourist/dashboard" class="btn btn-outline-secondary rounded-pill py-2">
            <i class="bi bi-house me-2"></i>Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  `
})
export class BookingSuccess implements OnInit {
    bookingId: string = '...';
    sessionId: string = '';
    isVerifying: boolean = true;
    verificationError: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private bookingService: BookingService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.sessionId = params['session_id'] || '';
            if (this.sessionId) {
                this.verifyBooking();
            } else {
                this.isVerifying = false;
            }
        });
    }

    verifyBooking() {
        this.isVerifying = true;
        this.verificationError = null;
        this.bookingService.verifySession(this.sessionId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.bookingId = res.bookingId;
                } else {
                    this.verificationError = res.message || 'Payment could not be verified.';
                }
                this.isVerifying = false;
            },
            error: (err) => {
                console.error('Verification failed', err);
                this.verificationError = 'Server error during verification. Please check your internet connection and try again.';
                this.isVerifying = false;
            }
        });
    }
}
