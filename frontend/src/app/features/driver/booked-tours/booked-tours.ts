import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-booked-tours',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './booked-tours.html',
    styleUrl: './booked-tours.css'
})
export class BookedTours implements OnInit {

    activeTab: 'confirmed' | 'pending' | 'ready' = 'confirmed';
    loading: boolean = false;
    error: string = '';

    confirmedTours: any[] = [];
    pendingTours: any[] = [];
    readyTours: any[] = [];

    constructor(
        private driverService: DriverService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadBookedTours();
    }

    loadBookedTours(): void {
        const user = this.authService.getUser();
        if (!user || user.role !== 'Driver' || !user.roleSpecificId) {
            this.error = 'Driver information not found';
            return;
        }

        this.loading = true;
        this.driverService.getBookedTours(user.roleSpecificId).subscribe({
            next: (data) => {
                this.confirmedTours = data.confirmedTours || [];
                this.pendingTours = data.pendingTours || [];
                this.readyTours = data.readyTours || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading booked tours:', err);
                this.error = 'Failed to load booked tours';
                this.loading = false;
            }
        });
    }

    setActiveTab(tab: 'confirmed' | 'pending' | 'ready') {
        this.activeTab = tab;
    }
}
