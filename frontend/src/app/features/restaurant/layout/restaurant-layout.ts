import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    standalone: true,
    selector: 'app-restaurant-layout',
    imports: [CommonModule, RouterModule],
    templateUrl: './restaurant-layout.html',
    styleUrl: './restaurant-layout.css'
})
export class RestaurantLayout implements OnInit {
    isSidebarOpen = false;
    user: any;
    unreadCount = 0;
    businessType: string = '';

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        this.user = this.authService.getUser();
        // Extract businessType from user data or JWT token
        this.businessType = this.user?.businessType || '';
    }

    ngOnInit() {
        this.loadUnreadCount();
        this.fetchCurrentUser();
        setInterval(() => this.loadUnreadCount(), 30000);
    }

    fetchCurrentUser() {
        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                this.user = user;
            },
            error: (err) => console.error('Failed to fetch user', err)
        });
    }

    loadUnreadCount() {
        if (this.user && this.user.id) {
            this.notificationService.getUnreadCount(this.user.id).subscribe({
                next: (res) => this.unreadCount = res.count,
                error: (err) => console.error('Failed to load unread count', err)
            });
        }
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout() {
        this.authService.logout();
    }

    // Helper methods for dynamic sidebar navigation
    showMenuTab(): boolean {
        return this.businessType === 'Restaurant' || this.businessType === 'Hotel';
    }

    showRoomsTab(): boolean {
        return this.businessType === 'GuestHouse' || this.businessType === 'Guest House' || this.businessType === 'Hotel';
    }

    getProfilePictureUrl(path: string | null | undefined): string | null {
        return this.authService.getProfilePictureUrl(path);
    }
}
