import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';

@Component({
    selector: 'app-driver-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ImageUploaderComponent],
    templateUrl: './driver-signup.html',
    styleUrl: './driver-signup.css'
})
export class DriverSignup implements OnDestroy {

    currentStep = 1;
    steps = [
        { number: 1, name: 'Personal Info' },
        { number: 2, name: 'Verification' },
        { number: 3, name: 'Documents' },
        { number: 4, name: 'Vehicle Info' }
    ];

    fullName: string = '';
    email: string = '';
    phoneNumber: string = '';
    password: string = '';
    confirmPassword: string = '';

    // Phase 1 only requires these, others will be used in later phases
    profilePicture: File | null = null;

    // Placeholders for future phases
    licenseNumber: string = '';
    cnic: string = '';
    vehicleType: string = '';
    vehicleRegNumber: string = '';
    licenseExpiryDate: string = '';
    vehicleExpiryDate: string = '';
    vehicleTypes = ['Sedan', 'SUV', 'Van', 'Mini Bus', 'Bus'];

    showPassword = false;
    showConfirmPassword = false;

    selectedVehicleImages: File[] = [];

    licenseFile: File | null = null;
    cnicFrontFile: File | null = null;
    cnicBackFile: File | null = null;

    // AI Verification State
    isVerifyingAI = false;
    private apiKey: string = environment.geminiApiKey;
    private aiUrl: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    constructor(
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService,
        private route: ActivatedRoute,
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {
        // Check for resume parameters
        this.route.queryParams.subscribe(params => {
            if (params['email']) {
                this.email = params['email'];
            }
            if (params['resumeStep']) {
                const step = parseInt(params['resumeStep']);
                if (step === 2) {
                    this.currentStep = 2; // OTP
                    this.timeLeft = 0; // Allow immediate resend for resume
                    this.resendOtp(this.email);
                } else if (step === 3) {
                    this.currentStep = 3; // Documents
                }
            }
        });

        // Retrieve password passed from Login
        const navState = this.router.getCurrentNavigation()?.extras.state;
        if (navState && navState['password']) {
            this.password = navState['password'];
            this.confirmPassword = navState['password']; // Auto-fill confirm too to pass validation if user goes back
        } else if (history.state.password) {
            this.password = history.state.password;
            this.confirmPassword = history.state.password;
        }

        // Auto-fill from authenticated user if resuming
        const currentUser = this.authService.getUser();
        if (currentUser && currentUser.status === 'Incomplete') {
            if (!this.fullName && currentUser.name) {
                this.fullName = currentUser.name;
            }
            if (!this.phoneNumber && currentUser.phoneNumber) {
                this.phoneNumber = currentUser.phoneNumber;
            }
        }
    }

    // OTP Timer State
    timeLeft: number = 60;
    interval: any;
    isResending = false;

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    startTimer() {
        this.timeLeft = 60;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                clearInterval(this.interval);
            }
        }, 1000);
    }

    resendOtp(email: string) {
        if (this.timeLeft > 0 || this.isResending) return;

        this.isResending = true;
        this.authService.resendOtp(email).subscribe({
            next: () => {
                this.isResending = false;
                this.toastService.show("Verification code sent to your email", "success");
                this.startTimer();
            },
            error: (err) => {
                this.isResending = false;
                this.toastService.show(err.error?.message || "Failed to send OTP", "error");
            }
        });
    }

    goBack() {
        this.router.navigate(['/role-selection']);
    }

    // Step 1: Toggles
    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    // Step 2: OTP
    otpCode: string = '';

    // Step 3: Documents
    onProfilePicSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.profilePicture = file;
        }
    }

    onFileSelected(event: any, type: string) {
        const file = event.target.files[0];
        if (file) {
            switch (type) {
                case 'license':
                    this.licenseFile = file;
                    break;
                case 'cnicFront':
                    this.cnicFrontFile = file;
                    break;
                case 'cnicBack':
                    this.cnicBackFile = file;
                    break;
            }
        }
    }

    // Step 4: Vehicle Info
    vehicleModel: string = '';
    vehicleCapacity: string = '';

    onVehicleImagesSelected(files: File[]) {
        this.selectedVehicleImages = files;
    }

    // Navigation
    nextStep() {
        if (this.currentStep === 1) {
            if (!this.fullName || !this.email || !this.phoneNumber || !this.password || !this.confirmPassword) {
                this.toastService.show('Please fill in all fields', 'error');
                return;
            }
            if (this.password !== this.confirmPassword) {
                this.toastService.show('Passwords do not match', 'error');
                return;
            }

            // Call Backend to Initiate Signup (Send OTP)
            const initiateData = {
                name: this.fullName,
                email: this.email,
                password: this.password,
                phoneNumber: this.phoneNumber
            };

            this.authService.initiateDriverSignup(initiateData).subscribe({
                next: (res) => {
                    console.log('Initiated', res);
                    this.toastService.show('OTP sent to your email', 'success');
                    this.currentStep++;
                    this.startTimer();
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show(err.error?.message || 'Failed to initiate signup', 'error');
                }
            });

        } else if (this.currentStep === 2) {
            // Verify OTP
            if (!this.otpCode || this.otpCode.length < 6) {
                this.toastService.show('Please enter a valid 6-digit code', 'error');
                return;
            }

            this.authService.verifyOtp(this.email, this.otpCode).subscribe({
                next: (res) => {
                    console.log('Verified', res);
                    this.toastService.show('Email verified successfully', 'success');
                    // OTP Verification successful, move to next step
                    this.currentStep++;
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show(err.error?.message || 'Invalid OTP', 'error');
                }
            });

        } else if (this.currentStep === 3) {
            if (!this.licenseNumber || !this.cnic || !this.licenseExpiryDate) {
                this.toastService.show('Please fill in all document details including expiry date', 'error');
                return;
            }
            if (!this.licenseFile || !this.cnicFrontFile || !this.cnicBackFile) {
                this.toastService.show('Please upload all required documents', 'error');
                return;
            }

            // TRIGGER AI VERIFICATION
            this.verifyWithAI();
        }
    }

    private async verifyWithAI() {
        this.isVerifyingAI = true;
        this.toastService.show('AI is verifying your documents... please wait', 'info');

        try {
            const cnicFrontBase64 = await this.fileToBase64(this.cnicFrontFile!);
            const licenseBase64 = await this.fileToBase64(this.licenseFile!);
            const today = new Date().toISOString().split('T')[0];

            const payload = {
                contents: [{
                    parts: [
                        {
                            text: `You are a document verification expert. Compare the two provided images: a Pakistani CNIC (Front) and a Driving License.
                            Also compare them with these user-entered values:
                            - User-entered CNIC: ${this.cnic}
                            - User-entered License Number: ${this.licenseNumber}
                            - Current Date: ${today}

                            Perform these specific checks:
                            1. Extract the CNIC number from both cards. They MUST match each other.
                            2. Compare the extracted CNIC number from the cards with the User-entered CNIC (${this.cnic}). They MUST match.
                            3. Extract the License Number from the License card and compare it with the User-entered License Number (${this.licenseNumber}). They MUST match.
                            4. Extract the Expiry Date from the License card. It MUST be later than ${today}.

                            Return ONLY a JSON object in this format:
                            {
                                "isValid": boolean,
                                "checks": {
                                    "cnicMatchBetweenCards": boolean,
                                    "cnicMatchWithForm": boolean,
                                    "licenseMatchWithForm": boolean,
                                    "licenseNotExpired": boolean
                                },
                                "message": "string (Details about failure or success)"
                            }`
                        },
                        {
                            inline_data: {
                                mime_type: this.cnicFrontFile!.type,
                                data: cnicFrontBase64
                            }
                        },
                        {
                            inline_data: {
                                mime_type: this.licenseFile!.type,
                                data: licenseBase64
                            }
                        }
                    ]
                }]
            };

            this.http.post(this.aiUrl, payload).subscribe({
                next: (res: any) => {
                    this.isVerifyingAI = false;
                    try {
                        const text = res.candidates[0].content.parts[0].text;
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const result = JSON.parse(jsonMatch[0]);
                            if (result.isValid) {
                                this.toastService.show('Documents verified successfully by AI!', 'success');
                                this.currentStep++;
                            } else {
                                this.toastService.show(result.message || 'AI verification failed', 'error');
                            }
                        } else {
                            throw new Error('Could not parse AI response');
                        }
                    } catch (e) {
                        this.toastService.show('AI Verification failed. Please ensure images are clear.', 'error');
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.isVerifyingAI = false;
                    this.toastService.show('AI Service error. Please try again.', 'error');
                    this.cdr.detectChanges();
                }
            });

        } catch (e) {
            this.isVerifyingAI = false;
            this.toastService.show('Failed to process images', 'error');
            console.error('AI Processing Error:', e);
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }



    submitApplication() {
        console.log('Submitting application...');

        // Final Client-side validation
        if (!this.vehicleRegNumber || !this.vehicleType || !this.vehicleModel || !this.vehicleCapacity) {
            this.toastService.show('Please fill in all vehicle details', 'error');
            return;
        }

        const formData = new FormData();

        // Personal Info
        if (this.fullName) formData.append('name', this.fullName);
        formData.append('email', this.email); // Email is needed for lookup
        if (this.password) formData.append('password', this.password);
        if (this.phoneNumber) formData.append('phoneNumber', this.phoneNumber);

        // Document Info
        if (this.cnic) formData.append('cnic', this.cnic);
        if (this.licenseNumber) formData.append('licence', this.licenseNumber);
        if (this.licenseExpiryDate) formData.append('licenceExpiryDate', this.licenseExpiryDate);

        // Files
        if (this.profilePicture) formData.append('profilePicture', this.profilePicture);
        if (this.cnicFrontFile) formData.append('cnicFront', this.cnicFrontFile);
        if (this.cnicBackFile) formData.append('cnicBack', this.cnicBackFile);
        if (this.licenseFile) formData.append('licenceImage', this.licenseFile);

        // Vehicle Info
        if (this.vehicleRegNumber) formData.append('vehicleRegNumber', this.vehicleRegNumber);
        if (this.vehicleType) formData.append('vehicleType', this.vehicleType);
        if (this.vehicleModel) formData.append('vehicleModel', this.vehicleModel);
        if (this.vehicleCapacity) formData.append('vehicleCapacity', this.vehicleCapacity.toString());

        // Vehicle Images
        this.selectedVehicleImages.forEach(image => {
            formData.append('vehicleImages', image);
        });

        this.authService.signupDriver(formData).subscribe({
            next: (response) => {
                console.log('Signup Successful', response);
                this.toastService.show('Application Submitted Successfully!', 'success');
                this.router.navigate(['/login']); // or dashboard
            },
            error: (error) => {
                console.error('Signup Failed', error);
                this.toastService.show(error.error?.message || 'Signup failed', 'error');
            }
        });
    }
}
