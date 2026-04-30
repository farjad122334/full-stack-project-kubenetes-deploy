import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    notificationId: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    actionUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/api/notifications`;

    constructor(private http: HttpClient) { }

    getUserNotifications(userId: number): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
    }

    getUnreadCount(userId: number): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count/${userId}`);
    }

    markAsRead(notificationId: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/mark-read/${notificationId}`, {});
    }

    markAllAsRead(userId: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/mark-all-read/${userId}`, {});
    }
}
