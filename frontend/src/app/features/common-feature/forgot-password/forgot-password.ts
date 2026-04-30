import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
    email: string = '';
    isLoading: boolean = false;

    constructor(
        private authService: AuthService,
        private toastService: ToastService,
        private router: Router
    ) { }

    onSubmit() {
        if (!this.email) {
            this.toastService.show('Please enter your email', 'error');
            return;
        }

        this.isLoading = true;
        this.authService.forgotPassword(this.email).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.toastService.show(response.message || 'OTP sent successfully', 'success');
                this.router.navigate(['/forgot-password-otp'], { queryParams: { email: this.email } });
            },
            error: (error: any) => {
                this.isLoading = false;
                this.toastService.show(error.error?.message || 'Error occurred', 'error');
            }
        });
    }
}
