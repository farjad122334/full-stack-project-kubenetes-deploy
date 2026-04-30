import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { VerifyOtp } from '../verify-otp/verify-otp';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';

@Component({
    selector: 'app-restaurant-signup',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        VerifyOtp,
        ImageUploaderComponent
    ],
    templateUrl: './restaurant-signup.html',
    styleUrl: './restaurant-signup.css'
})
export class RestaurantSignup {

    // Phase 1: Personal & Logo
    ownerName: string = '';
    email: string = '';
    phoneNumber: string = '';
    password: string = '';
    confirmPassword: string = '';
    profilePicture: File | null = null;

    // Phase 3: Restaurant Info
    restaurantName: string = '';
    address: string = '';
    postalCode: string = '';
    businessType: string = '';

    // Phase 2: Business Type
    businessLicenseFile: File | null = null;

    businessTypes = [
        { value: 'Restaurant', label: 'Restaurant (Meals Only)', icon: '🍽️' },
        { value: 'Hotel', label: 'Hotel (Rooms + Meals)', icon: '🏨' },
        { value: 'GuestHouse', label: 'Guest House (Rooms Only)', icon: '🏠' }
    ];

    showPassword = false;
    showConfirmPassword = false;

    selectedRestaurantImages: File[] = [];

    currentStep = 1;
    steps = [
        { number: 1, name: 'Personal Info' },
        { number: 2, name: 'Verification' },
        { number: 3, name: 'Business Details' }
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService,
        private route: ActivatedRoute
    ) {

        // Check for resume parameters
        this.route.queryParams.subscribe(params => {
            if (params['email']) {
                this.email = params['email'];
            }

            if (params['resumeStep']) {
                const step = parseInt(params['resumeStep'], 10);

                if (step === 2) {
                    this.currentStep = 2;
                    this.resendOtp(this.email);
                } else if (step === 3) {
                    this.currentStep = 3;
                }
            }
        });

        // Retrieve password passed from Login
        const navState = this.router.getCurrentNavigation()?.extras.state;

        if (navState && navState['password']) {
            this.password = navState['password'];
            this.confirmPassword = navState['password'];
        } else if (history.state.password) {
            this.password = history.state.password;
            this.confirmPassword = history.state.password;
        }

        // Auto-fill from authenticated user if resuming
        const currentUser = this.authService.getUser();
        console.log('[RestaurantSignup] Current User for auto-fill:', currentUser);

        if (currentUser && currentUser.status === 'Incomplete') {

            if (!this.restaurantName && currentUser.businessName) {
                this.restaurantName = currentUser.businessName;
            }

            if (!this.businessType && currentUser.businessType) {
                this.businessType = currentUser.businessType;
            }

            if (!this.ownerName && currentUser.name) {
                this.ownerName = currentUser.name;
            }

            if (!this.phoneNumber && currentUser.phoneNumber) {
                this.phoneNumber = currentUser.phoneNumber;
            }
        }
    }

    resendOtp(email: string) {
        this.authService.resendOtp(email).subscribe({
            next: () =>
                this.toastService.show('Verification code sent to your email', 'success'),
            error: err =>
                this.toastService.show(
                    err.error?.message || 'Failed to send OTP',
                    'error'
                )
        });
    }

    // --- Navigation & Flow ---
    goBack() {
        if (this.currentStep === 1) {
            this.router.navigate(['/role-selection']);
        } else {
            this.currentStep--;
        }
    }

    nextStep() {
        if (this.currentStep === 1) {
            this.validateAndInitiateSignup();
        } else if (this.currentStep === 3) {
            this.validateRestaurantDetailsAndSubmit();
        }
    }

    // --- Phase 1 Logic ---
    validateAndInitiateSignup() {
        if (
            !this.ownerName ||
            !this.email ||
            !this.phoneNumber ||
            !this.password ||
            !this.confirmPassword
        ) {
            this.toastService.show('Please fill in all personal details', 'error');
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.toastService.show('Passwords do not match', 'error');
            return;
        }

        const data = {
            name: this.ownerName,
            email: this.email,
            password: this.password,
            phoneNumber: this.phoneNumber
        };

        this.authService.initiateRestaurantSignup(data).subscribe({
            next: () => {
                this.toastService.show('OTP sent to your email', 'success');
                this.currentStep++;
            },
            error: err => {
                this.toastService.show(
                    err.error?.message || 'Signup initialization failed',
                    'error'
                );
            }
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onProfilePicSelected(event: any) {
        this.profilePicture = event.target.files[0];
    }

    // --- Phase 2 Logic ---
    onOtpVerified() {
        this.currentStep++;
    }

    // --- Phase 3 Logic ---
    onLicenseSelected(event: any) {
        this.businessLicenseFile = event.target.files[0];
    }

    onImagesSelected(files: File[]) {
        this.selectedRestaurantImages = files;
    }

    validateRestaurantDetailsAndSubmit() {
        if (!this.restaurantName || !this.businessType) {
            this.toastService.show('Please provide business name and type', 'error');
            return;
        }

        if (!this.address || !this.postalCode) {
            this.toastService.show('Please fill in all business details', 'error');
            return;
        }

        if (!this.businessLicenseFile) {
            this.toastService.show('Please upload business license', 'error');
            return;
        }

        this.submitApplication();
    }

    submitApplication() {
        const formData = new FormData();

        formData.append('name', this.ownerName);
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('phoneNumber', this.phoneNumber);
        formData.append('restaurantName', this.restaurantName);
        formData.append('address', this.address);
        formData.append('businessType', this.businessType);
        formData.append('postalCode', this.postalCode);
        formData.append('ownerName', this.ownerName);

        if (this.profilePicture) {
            formData.append('profilePicture', this.profilePicture);
        }

        if (this.businessLicenseFile) {
            formData.append('licenseDocument', this.businessLicenseFile);
        }

        this.selectedRestaurantImages.forEach(image => {
            formData.append('restaurantImages', image);
        });

        this.authService.signupRestaurant(formData).subscribe({
            next: () => {
                this.toastService.show(
                    'Restaurant Application Submitted Successfully!',
                    'success'
                );
                this.router.navigate(['/login']);
            },
            error: err => {
                console.error('Signup Error Details:', err);
                this.toastService.show(
                    err.error?.message || 'Submission failed',
                    'error'
                );
            }
        });
    }
}
