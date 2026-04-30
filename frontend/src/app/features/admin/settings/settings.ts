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

  // Profile Settings
  profile = {
    fullName: 'Admin User',
    email: 'admin@tourismo.com',
    phone: '+92 300 1234567',
    role: 'System Administrator',
    avatar: 'assets/images/avatar.png'
  };

  // Security Settings
  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    loginAlerts: true
  };

  // Notification Settings
  notifications = {
    newBookings: true,
    payments: true,
    driverApplications: true,
    customerReviews: false,
    weeklyReports: true
  };

  // System Preferences
  system = {
    language: 'English',
    timezone: 'Asia/Karachi (PKT)',
    currency: 'PKR - Pakistani Rupee',
    dateFormat: 'DD/MM/YYYY'
  };

  saveProfile() {
    console.log('Profile saved:', this.profile);
    // Add toast or alert logic here
  }

  updateSecurity() {
    console.log('Security updated:', this.security);
    // Add validation logic here
  }

  savePreferences() {
    console.log('Preferences saved:', this.system);
  }

}
