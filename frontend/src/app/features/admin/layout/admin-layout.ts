import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    standalone: true,
    selector: 'app-admin-layout',
    imports: [RouterModule, CommonModule],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
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
