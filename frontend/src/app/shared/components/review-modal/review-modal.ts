import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';

@Component({
    selector: 'app-review-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './review-modal.html'
})
export class ReviewModal {
    @Input() tourId!: number;
    @Output() close = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<void>();

    stars = [1, 2, 3, 4, 5];
    rating = 0;
    comment = '';
    isSubmitting = false;
    error = '';

    constructor(private bookingService: BookingService) { }

    setRating(value: number) {
        this.rating = value;
    }

    getRatingLabel(): string {
        switch (this.rating) {
            case 1: return 'Poor 😠';
            case 2: return 'Fair 😐';
            case 3: return 'Good 🙂';
            case 4: return 'Very Good 😃';
            case 5: return 'Excellent 🤩';
            default: return 'Tap stars to rate';
        }
    }

    submit() {
        if (this.rating === 0) return;

        this.isSubmitting = true;
        this.error = '';

        const reviewData = {
            tourId: this.tourId,
            rating: this.rating,
            comment: this.comment
        };

        this.bookingService.submitReview(reviewData).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.submitted.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting = false;
                this.error = err.error?.message || 'Failed to submit review';
            }
        });
    }
}
