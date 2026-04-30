import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.css'
})
export class Settings {
    // Notification Preferences
    emailNotifications = true;
    smsNotifications = false;
    pushNotifications = true;
    bookingUpdates = true;
    promotionalOffers = false;
    newsletter = true;

    // Security
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    twoFactor = false;

    // Appearance & Region
    darkMode = false;
    preferredLanguage = 'English';
    timeZone = 'Pakistan Standard Time (PST) - UTC+5';
    currency = 'PKR - Pakistani Rupee';

    updatePassword() {
        console.log('Update password clicked');
    }

    downloadData() {
        console.log('Download data clicked');
    }

    deactivateAccount() {
        console.log('Deactivate account clicked');
    }

    deleteAccount() {
        console.log('Delete account clicked');
    }
}
