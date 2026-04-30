import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    standalone: true,
    selector: 'app-tourist-layout',
    imports: [RouterModule, CommonModule],
    templateUrl: './tourist-layout.html',
    styleUrl: './tourist-layout.css'
})
export class TouristLayout implements OnInit {
    isSidebarOpen = false;
    user: any;
    unreadCount = 0;

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        this.user = this.authService.getUser();
    }

    ngOnInit() {
        this.loadUnreadCount();
        this.fetchCurrentUser();
        // Refresh unread count every 30 seconds
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

    getProfilePictureUrl(path: string | null | undefined): string | null {
        return this.authService.getProfilePictureUrl(path);
    }
}
