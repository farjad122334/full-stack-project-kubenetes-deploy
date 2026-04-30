import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TourService } from '../../../core/services/tour.service';
import { Tour } from '../../../core/models/tour.interface';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class Explore {
  tours: Tour[] = [];

  constructor(private tourService: TourService) { }

  ngOnInit(): void {
    this.tourService.getTours().subscribe({
      next: (tours) => {
        // Show published, finalized, and ready tours to tourists
        const visibleStatuses = ['Published', 'Finalized', 'Ready'];
        this.tours = tours.filter(tour => visibleStatuses.includes(tour.status));
      },
      error: (err) => {
        console.error('Error fetching tours:', err);
      }
    });
  }
}
