import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tour {
    title: string;
    description: string;
    startDate: string;
    duration: string;
    location: string;
    tourists: number;
    mealType: string;
}

@Component({
    selector: 'app-explore-tours',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './explore-tours.html',
    styleUrl: './explore-tours.css'
})
export class ExploreTours {

    tours: Tour[] = [
        {
            title: 'Murree Hill Station Tour',
            description: 'A scenic tour to Murree hills with local sightseeing',
            startDate: 'Jan 15, 2026',
            duration: '2 Days',
            location: 'Murree',
            tourists: 35,
            mealType: 'Lunch'
        },
        {
            title: 'Hunza Valley Adventure',
            description: 'Experience the beauty of Hunza Valley',
            startDate: 'Jan 20, 2026',
            duration: '5 Days',
            location: 'Hunza',
            tourists: 50,
            mealType: 'Dinner'
        },
        {
            title: 'Lahore Heritage Tour',
            description: 'Historical landmarks and cultural sites',
            startDate: 'Jan 18, 2026',
            duration: '1 Day',
            location: 'Lahore',
            tourists: 25,
            mealType: 'Lunch'
        },
        {
            title: 'Swat Valley Exploration',
            description: 'Explore the Switzerland of Pakistan',
            startDate: 'Jan 25, 2026',
            duration: '4 Days',
            location: 'Swat',
            tourists: 40,
            mealType: 'Lunch & Dinner'
        },
        {
            title: 'Islamabad City Tour',
            description: 'Modern capital city tour with monuments',
            startDate: 'Jan 12, 2026',
            duration: '1 Day',
            location: 'Islamabad',
            tourists: 20,
            mealType: 'Lunch'
        },
        {
            title: 'Naran Kaghan Valley Tour',
            description: 'Beautiful mountain valleys and lakes',
            startDate: 'Feb 1, 2026',
            duration: '3 Days',
            location: 'Naran',
            tourists: 45,
            mealType: 'Dinner'
        }
    ];

    selectedTour: Tour | null = null;
    offerPrice: number | null = null;

    openOfferModal(tour: Tour) {
        this.selectedTour = tour;
        this.offerPrice = null; // Reset price
    }

    closeOfferModal() {
        this.selectedTour = null;
        this.offerPrice = null;
    }

    get totalAmount(): number {
        if (!this.selectedTour || !this.offerPrice) return 0;
        return this.offerPrice * this.selectedTour.tourists;
    }

    submitOffer() {
        if (this.selectedTour && this.offerPrice) {
            console.log(`Offer sent for ${this.selectedTour.title}: ${this.totalAmount}`);
            // Here you would call a service to submit the offer
            this.closeOfferModal();
        }
    }

}
