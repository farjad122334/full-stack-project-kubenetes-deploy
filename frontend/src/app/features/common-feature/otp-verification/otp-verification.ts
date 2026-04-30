import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-otp-verification',
    imports: [CommonModule, FormsModule],
    templateUrl: './otp-verification.html',
    styleUrl: './otp-verification.css'
})
export class OtpVerification {
    otp: string[] = ['', '', '', '', '', ''];
    email: string = 'user@example.com'; // Should be retrieved from route/state
    timer: number = 60;
    canResend: boolean = false;

    constructor(
        private router: Router,
        private toastService: ToastService
    ) {
        this.startTimer();
    }

    onInput(index: number, event: any) {
        const value = event.target.value;
        this.otp[index] = value;
        if (value && index < 5) {
            // Use setTimeout to allow the UI to update and prevent event bleeding
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }, 10);
        }
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    onKeyDown(index: number, event: any) {
        if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    }

    startTimer() {
        this.canResend = false;
        this.timer = 60;
        const interval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
            } else {
                this.canResend = true;
                clearInterval(interval);
            }
        }, 1000);
    }

    resendCode() {
        if (this.canResend) {
            this.toastService.show("Code resent successfully!", "success");
            this.startTimer();
        }
    }

    verify() {
        const code = this.otp.join('');
        if (code.length === 6) {
            // Mock verification
            console.log('Verifying OTP:', code);
            this.toastService.show("Email verified successfully!", "success");
            this.router.navigate(['/login']);
        } else {
            this.toastService.show("Please enter a valid 6-digit code", "error");
        }
    }
}
