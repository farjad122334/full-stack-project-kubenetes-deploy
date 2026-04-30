import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ResumeRegistrationModalComponent } from '../../../shared/components/resume-registration-modal/resume-registration-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResumeRegistrationModalComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  showPassword = false;

  // Resume Registration Modal State
  isResumeModalVisible = false;
  resumeMessage = '';
  resumeStep = '';
  resumeEmail = '';
  resumeRole = ''; // Helper to know where to redirect

  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      this.toastService.show("Please enter email and password", "error");
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        this.toastService.show("Login Successful!", "success");

        // Role comes from backend as 'Admin', 'Tourist', etc.
        const role = response.user.role;
        const status = response.user.status;

        console.log('Login Response:', response);

        if (status === 'Incomplete') {
          this.resumeStep = response.user.registrationStep.toString();
          this.resumeEmail = response.user.email;
          this.resumeRole = response.user.role.toLowerCase();
          this.resumeMessage = `Welcome back! You have an incomplete registration as a ${this.resumeRole}. Click below to continue.`;
          this.isResumeModalVisible = true;
          return;
        }

        if ((role === 'Restaurant' || role === 'Driver') && status !== 'Approved' && status !== 'Verified') {
          this.router.navigate(['/account-pending']);
          return;
        }

        if (role === 'Tourist') {
          this.router.navigate(['/tourist']);
        } else if (role === 'Driver') {
          this.router.navigate(['/driver']);
        } else if (role === 'Restaurant') {
          this.router.navigate(['/restaurant']);
        } else if (role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);

        const errorMessage = error.error?.message || "Invalid email or password";

        // Check for special incomplete registration message
        if (errorMessage.startsWith('INCOMPLETE_REGISTRATION')) {
          const parts = errorMessage.split('|');
          // Format: INCOMPLETE_REGISTRATION|step|email|message|role
          if (parts.length >= 4) {
            this.resumeStep = parts[1];
            this.resumeEmail = parts[2];
            this.resumeMessage = parts[3];
            this.isResumeModalVisible = true;

            // Extract Role if available (New format has 5 parts)
            if (parts.length >= 5) {
              this.resumeRole = parts[4].toLowerCase();
            } else {
              // Fallback for backward compatibility or if missing
              if (this.resumeMessage.toLowerCase().includes('driver')) {
                this.resumeRole = 'driver';
              } else if (this.resumeMessage.toLowerCase().includes('restaurant')) {
                this.resumeRole = 'restaurant';
              }
            }
          }
        } else {
          this.toastService.show(errorMessage, "error");
        }
      }
    });
  }

  onResumeConfirm() {
    this.isResumeModalVisible = false;

    // Navigate to signup page with params
    const queryParams = {
      email: this.resumeEmail,
      resumeStep: this.resumeStep
    };

    if (this.resumeRole === 'driver') {
      this.router.navigate(['/driver-signup'], {
        queryParams,
        state: { password: this.password }
      });
    } else if (this.resumeRole === 'restaurant') {
      this.router.navigate(['/restaurant-signup'], {
        queryParams,
        state: { password: this.password }
      });
    } else {
      // Fallback if role ambiguous
      this.toastService.show("Could not determine signup type. Please contact support.", "error");
    }
  }

  onResumeCancel() {
    this.isResumeModalVisible = false;
  }
}
