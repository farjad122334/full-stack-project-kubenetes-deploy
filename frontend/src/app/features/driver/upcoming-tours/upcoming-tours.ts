import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UpcomingTour {
    id: number;
    title: string;
    route: string;
    date: string;
    duration: string;
    participants: number;
    driversNeeded: number;
    accommodationsNeeded: number;
    estimatedPayment: number;
    driversStatus: { needed: number; label: string };
    hotelsStatus: { needed: number; label: string };
}

@Component({
    standalone: true,
    selector: 'app-upcoming-tours',
    imports: [CommonModule],
    templateUrl: './upcoming-tours.html',
    styleUrl: './upcoming-tours.css'
})
export class UpcomingTours {
    tours: UpcomingTour[] = [
        {
            id: 1,
            title: 'Skardu & Deosai Plains Expedition',
            route: 'Islamabad → Skardu → Deosai',
            date: 'Feb 15, 2026',
            duration: '7 Days',
            participants: 15,
            driversNeeded: 3,
            accommodationsNeeded: 2,
            estimatedPayment: 35000,
            driversStatus: { needed: 3, label: 'Drivers: 3 needed' },
            hotelsStatus: { needed: 2, label: 'Hotels: 2 needed' }
        },
        {
            id: 2,
            title: 'Fairy Meadows & Nanga Parbat',
            route: 'Islamabad → Fairy Meadows',
            date: 'Feb 20, 2026',
            duration: '5 Days',
            participants: 10,
            driversNeeded: 2,
            accommodationsNeeded: 1,
            estimatedPayment: 28000,
            driversStatus: { needed: 2, label: 'Drivers: 2 needed' },
            hotelsStatus: { needed: 1, label: 'Hotels: 1 needed' }
        },
        {
            id: 3,
            title: 'Chitral & Kalash Valley Tour',
            route: 'Peshawar → Chitral → Kalash',
            date: 'Mar 1, 2026',
            duration: '6 Days',
            participants: 12,
            driversNeeded: 2,
            accommodationsNeeded: 2,
            estimatedPayment: 30000,
            driversStatus: { needed: 2, label: 'Drivers: 2 needed' },
            hotelsStatus: { needed: 2, label: 'Hotels: 2 needed' }
        },
        {
            id: 4,
            title: 'Hunza Cherry Blossom Special',
            route: 'Islamabad → Hunza → Khunjerab',
            date: 'Mar 10, 2026',
            duration: '4 Days',
            participants: 20,
            driversNeeded: 4,
            accommodationsNeeded: 3,
            estimatedPayment: 25000,
            driversStatus: { needed: 4, label: 'Drivers: 4 needed' },
            hotelsStatus: { needed: 3, label: 'Hotels: 3 needed' }
        }
    ];
}
