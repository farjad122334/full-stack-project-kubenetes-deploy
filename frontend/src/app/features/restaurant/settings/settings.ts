import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.css'
})
export class Settings implements OnInit {
    isStripeConnected = false;
    isConnecting = false;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user?.roleSpecificId) {
            this.http.get<any>(`${environment.apiUrl}/api/restaurants/${user.roleSpecificId}`)
                .subscribe({
                    next: (restaurant) => { this.isStripeConnected = !!restaurant?.stripeAccountId; },
                    error: () => { }
                });
        }
    }

    connectStripe(): void {
        const user = this.authService.getUser();
        if (!user?.roleSpecificId) return;
        this.isConnecting = true;
        const body = {
            returnUrl: `${window.location.origin}/restaurant/settings`,
            refreshUrl: `${window.location.origin}/restaurant/settings`
        };
        this.http.post<{ url: string }>(
            `${environment.apiUrl}/api/restaurants/${user.roleSpecificId}/onboarding-link`, body
        ).subscribe({
            next: (res) => { window.location.href = res.url; },
            error: (err) => {
                this.toastService.show('Failed to connect Stripe. Please try again.', 'error');
                this.isConnecting = false;
            }
        });
    }

    // Password Section
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';

    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    // Notification Preferences
    notifications = {
        offerSubmitted: true,
        offerApproved: true,
        offerRejected: true,
        orderFinalized: true,
        email: true,
        sms: false
    };

    togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
        if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
        if (field === 'new') this.showNewPassword = !this.showNewPassword;
        if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
    }

    updatePassword() {
        if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
            this.toastService.show('Please fill in all password fields.', 'warning');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.toastService.show('New password and confirm password do not match.', 'error');
            return;
        }

        this.authService.updatePassword({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        }).subscribe({
            next: (res) => {
                this.toastService.show(res.message || 'Password updated successfully!', 'success');
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
            },
            error: (err) => {
                this.toastService.show(err.error?.message || 'Failed to update password.', 'error');
            }
        });
    }
}
