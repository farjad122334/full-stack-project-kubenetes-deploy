import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface RatableEntity {
  tourId: number;
  tourTitle: string;
  drivers: { driverId: number, name: string }[];
  restaurants: { restaurantId: number, name: string, type: string }[];
}

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-modal.html',
  styleUrl: './rating-modal.css'
})
export class RatingModal implements OnInit {
  @Input() tourId!: number;
  @Input() touristId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  isLoading = true;
  isSubmitting = false;
  entityData: RatableEntity | null = null;
  error = '';

  // Rating forms state
  tourRating = { management: 0, pricing: 0, overall: 0, comment: '' };
  driverRatings: { [driverId: number]: { vehicle: 0, comfort: 0, behavior: 0, overall: 0, comment: '' } } = {};
  restaurantRatings: { [restaurantId: number]: { accommodation: 0, service: 0, staff: 0, overall: 0, comment: '' } } = {};

  steps = ['Tour', 'Transport', 'Accommodation'];
  currentStepIndex = 0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchEntities();
  }

  fetchEntities() {
    this.isLoading = true;
    this.http.get<RatableEntity>(`${environment.apiUrl}/api/ratings/tour/${this.tourId}/entities`).subscribe({
      next: (data) => {
        this.entityData = data;

        // Initialize driver rating objects
        data.drivers.forEach(d => {
          this.driverRatings[d.driverId] = { vehicle: 0, comfort: 0, behavior: 0, overall: 0, comment: '' };
        });

        // Initialize restaurant rating objects
        data.restaurants.forEach(r => {
          this.restaurantRatings[r.restaurantId] = { accommodation: 0, service: 0, staff: 0, overall: 0, comment: '' };
        });

        // Skip steps if no drivers or restaurants
        if (data.drivers.length === 0) {
          this.steps = this.steps.filter(s => s !== 'Transport');
        }
        if (data.restaurants.length === 0) {
          this.steps = this.steps.filter(s => s !== 'Accommodation');
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching entities to rate', err);
        this.error = 'Failed to load rating data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get currentStepName(): string {
    return this.steps[this.currentStepIndex];
  }

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  setRating(category: any, field: string, value: number) {
    category[field] = value;
  }

  submitRating() {
    this.isSubmitting = true;

    // Build payload mapping strictly to backend DTO structure
    const payload = {
      tourId: this.tourId,
      touristId: this.touristId,
      tourRating: {
        managementStars: this.tourRating.management || 1,
        pricingStars: this.tourRating.pricing || 1,
        overallStars: this.tourRating.overall || 1,
        comment: this.tourRating.comment
      },
      driverRatings: this.entityData?.drivers.map(d => ({
        driverUserId: d.driverId,
        vehicleConditionStars: this.driverRatings[d.driverId].vehicle || 1,
        comfortStars: this.driverRatings[d.driverId].comfort || 1,
        driverBehaviourStars: this.driverRatings[d.driverId].behavior || 1,
        overallStars: this.driverRatings[d.driverId].overall || 1,
        comment: this.driverRatings[d.driverId].comment
      })) || [],
      restaurantRatings: this.entityData?.restaurants.map(r => ({
        restaurantUserId: r.restaurantId,
        accommodationStars: this.restaurantRatings[r.restaurantId].accommodation || 1,
        serviceStars: this.restaurantRatings[r.restaurantId].service || 1,
        staffStars: this.restaurantRatings[r.restaurantId].staff || 1,
        overallStars: this.restaurantRatings[r.restaurantId].overall || 1,
        comment: this.restaurantRatings[r.restaurantId].comment
      })) || []
    };

    this.http.post(`${environment.apiUrl}/api/ratings/submit`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted.emit();
      },
      error: (err) => {
        console.error('Failed to submit ratings', err);
        this.error = 'Failed to submit ratings. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
