import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-tourist-signup',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './tourist-signup.html',
    styleUrl: './tourist-signup.css'
})
export class TouristSignup {

    fullName: string = '';
    email: string = '';
    phoneNumber: string = '';
    password: string = '';
    confirmPassword: string = '';
    acceptedTerms = false;

    showPassword = false;
    showConfirmPassword = false;
    isLoading = false;
    profilePicture: File | null = null;

    constructor(
        private router: Router,
        private toastService: ToastService,
        private authService: AuthService
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    createAccount() {
        // Validate all fields
        if (!this.fullName || !this.email || !this.phoneNumber || !this.password || !this.confirmPassword) {
            this.toastService.show("Please fill in all fields", "error");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.toastService.show("Please enter a valid email address", "error");
            return;
        }

        // Password validation
        if (this.password.length < 8) {
            this.toastService.show("Password must be at least 8 characters long", "error");
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.toastService.show("Passwords do not match", "error");
            return;
        }

        if (!this.acceptedTerms) {
            this.toastService.show("Please accept the terms and conditions", "error");
            return;
        }

        // Call backend API
        this.isLoading = true;

        const formData = new FormData();
        formData.append('name', this.fullName);
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('phoneNumber', this.phoneNumber);

        if (this.profilePicture) {
            formData.append('profilePicture', this.profilePicture);
        }

        this.authService.signupTourist(formData).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.toastService.show("OTP Sent! Please verify your email.", "success");
                // Navigate to verify-otp with email
                this.router.navigate(['/verify-otp'], { queryParams: { email: this.email } });
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Signup error:', error);
                const errorMessage = error.error?.message || error.message || "Failed to create account. Please try again.";
                this.toastService.show(errorMessage, "error");
            }
        });
    }

    onProfilePicSelected(event: any) {
        this.profilePicture = event.target.files[0];
    }

    goBack() {
        this.router.navigate(['/role-selection']);
    }
}
