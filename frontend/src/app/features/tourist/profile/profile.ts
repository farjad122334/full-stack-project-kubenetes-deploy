import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: string;
  dob: string;
  memberSince: string;
  totalTours: number;
  cnic: string;
  passport: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  adventureLevel: string;
  dietary: string;
  medical: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user: UserProfile = {
    name: '',
    email: '',
    phone: '',
    role: 'Tourist',
    dob: '',
    memberSince: 'January 2024', // Default for now
    totalTours: 0,
    cnic: '',
    passport: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    adventureLevel: 'Not Specified',
    dietary: 'None',
    medical: 'None'
  };

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    const userData = this.authService.getUser();
    if (userData) {
      this.user = {
        ...this.user,
        name: userData.name,
        email: userData.email,
        phone: userData.phoneNumber || 'Not Provided',
        role: userData.role,
        profilePicture: userData.profilePicture
      };
    }

    this.authService.getCurrentUser().subscribe({
      next: (freshUser) => {
        this.user = {
          ...this.user,
          name: freshUser.name,
          email: freshUser.email,
          phone: freshUser.phoneNumber || 'Not Provided',
          role: freshUser.role,
          profilePicture: freshUser.profilePicture
        };
      },
      error: (err) => console.error('Failed to refresh tourist profile', err)
    });
  }

  getProfilePictureUrl(path: string | null | undefined): string | null {
    return this.authService.getProfilePictureUrl(path);
  }

  onProfilePicSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      this.authService.updateProfile(formData).subscribe({
        next: () => {
          this.fetchData();
          alert('Profile picture updated!');
        },
        error: (err) => alert('Failed to update: ' + (err.error?.message || err.message))
      });
    }
  }

  get initials(): string {
    if (!this.user.name) return 'U';
    const names = this.user.name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
}
