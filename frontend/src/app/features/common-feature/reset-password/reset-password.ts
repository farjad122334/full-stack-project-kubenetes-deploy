import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
    email: string = '';
    otpCode: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    showPassword1: boolean = false;
    showPassword2: boolean = false;
    isLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'];
            this.otpCode = params['otpCode'];

            if (!this.email || !this.otpCode) {
                this.toastService.show('Invalid access', 'error');
                this.router.navigate(['/forgot-password']);
            }
        });
    }

    togglePasswordVisibility(field: number) {
        if (field === 1) this.showPassword1 = !this.showPassword1;
        else if (field === 2) this.showPassword2 = !this.showPassword2;
    }

    onSubmit() {
        if (!this.newPassword || !this.confirmPassword) {
            this.toastService.show('Please fill in both fields', 'error');
            return;
        }

        if (this.newPassword.length < 6) {
            this.toastService.show('Password must be at least 6 characters long', 'error');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.toastService.show('Passwords do not match', 'error');
            return;
        }

        this.isLoading = true;
        const requestData = {
            email: this.email,
            otpCode: this.otpCode,
            newPassword: this.newPassword
        };

        this.authService.resetPassword(requestData).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.toastService.show('Password reset successfully! You can now login.', 'success');
                this.router.navigate(['/login']);
            },
            error: (error: any) => {
                this.isLoading = false;
                this.toastService.show(error.error?.message || 'Error resetting password', 'error');
            }
        });
    }
}
