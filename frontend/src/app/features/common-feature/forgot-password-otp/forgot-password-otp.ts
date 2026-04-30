import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-forgot-password-otp',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forgot-password-otp.html',
    styleUrls: ['./forgot-password-otp.css']
})
export class ForgotPasswordOtpComponent implements OnInit {
    email: string = '';
    otpCode: string = '';
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
            if (!this.email) {
                this.toastService.show('Email is missing', 'error');
                this.router.navigate(['/forgot-password']);
            }
        });
    }

    onSubmit() {
        if (!this.otpCode || this.otpCode.length !== 6) {
            this.toastService.show('Please enter a valid 6-digit OTP', 'error');
            return;
        }

        this.isLoading = true;
        this.authService.verifyPasswordResetOtp(this.email, this.otpCode).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.toastService.show('OTP verified successfully', 'success');
                this.router.navigate(['/reset-password'], { queryParams: { email: this.email, otpCode: this.otpCode } });
            },
            error: (error: any) => {
                this.isLoading = false;
                this.toastService.show(error.error?.message || 'Invalid OTP', 'error');
            }
        });
    }

    resendOtp() {
        this.authService.forgotPassword(this.email).subscribe({
            next: (response: any) => {
                this.toastService.show(response.message || 'OTP resent successfully', 'success');
            },
            error: (error: any) => {
                this.toastService.show(error.error?.message || 'Failed to resend OTP', 'error');
            }
        });
    }
}
