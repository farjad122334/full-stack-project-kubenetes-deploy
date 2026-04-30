import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-shared-notifications',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notifications.html'
})
export class SharedNotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    isLoading: boolean = false;
    currentUserId: number | null = null;

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const user = this.authService.getUser();
        if (user && user.id) {
            this.currentUserId = user.id;
            this.loadNotifications();
        }
    }

    loadNotifications() {
        if (!this.currentUserId) return;

        this.isLoading = true;
        this.notificationService.getUserNotifications(this.currentUserId).subscribe({
            next: (data) => {
                this.notifications = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load notifications', err);
                this.isLoading = false;
            }
        });
    }

    get unreadCount(): number {
        return this.notifications.filter(n => !n.isRead).length;
    }

    markAsRead(notification: Notification) {
        if (notification.isRead) return;

        this.notificationService.markAsRead(notification.notificationId).subscribe({
            next: () => {
                notification.isRead = true;
            }
        });
    }

    markAllAsRead() {
        if (!this.currentUserId) return;

        this.notificationService.markAllAsRead(this.currentUserId).subscribe({
            next: () => {
                this.notifications.forEach(n => n.isRead = true);
            }
        });
    }

    clearAll() {
        // We might not have a "Delete All" in backend yet, so just local for now
        // Or we could implement Mark All As Read
        this.markAllAsRead();
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'BookingSuccess':
            case 'AccountApproved': return 'text-success bg-success-subtle';
            case 'TourFinalized': return 'text-primary bg-primary-subtle';
            case 'AccountRejected': return 'text-danger bg-danger-subtle';
            case 'info': return 'text-info bg-info-subtle';
            default: return 'text-primary bg-primary-subtle';
        }
    }

    getBootstrapIcon(type: string): string {
        switch (type) {
            case 'BookingSuccess': return 'bi-ticket-perforated';
            case 'AccountApproved': return 'bi-check-circle';
            case 'TourFinalized': return 'bi-map';
            case 'AccountRejected': return 'bi-x-circle';
            case 'info': return 'bi-info-circle';
            default: return 'bi-bell';
        }
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    }

    onNotificationClick(notification: Notification) {
        this.markAsRead(notification);
        if (notification.actionUrl) {
            this.router.navigateByUrl(notification.actionUrl);
        }
    }
}
