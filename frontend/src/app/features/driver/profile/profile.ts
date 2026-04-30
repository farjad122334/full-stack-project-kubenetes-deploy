import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface Document {
  name: string;
  uploadDate: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  icon: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any;
  profile = {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@safarnama.com',
    phone: '+92 300 1234567',
    joinedDate: 'June 15, 2024',
    location: 'Islamabad, Pakistan',
    status: 'Active',
    cnic: '12345-6789012-3',
    address: 'House 123, Street 45, F-10 Markaz, Islamabad'
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.user = this.authService.getUser();
    if (this.user) {
        this.profile.name = this.user.name;
        this.profile.email = this.user.email;
        this.profile.phone = this.user.phoneNumber || 'Not provided';
        this.profile.status = this.user.status || 'Active';
    }
    
    this.authService.getCurrentUser().subscribe({
        next: (userData) => {
            this.user = userData;
            this.profile.name = userData.name;
            this.profile.email = userData.email;
            this.profile.phone = userData.phoneNumber || 'Not provided';
            this.profile.status = userData.status || 'Active';
        },
        error: (err) => console.error('Failed to load user profile', err)
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
                this.fetchData(); // Refresh
                alert('Profile picture updated successfully!');
            },
            error: (err) => alert('Failed to update profile picture: ' + (err.error?.message || err.message))
        });
    }
  }

  license = {
    number: 'ISB-2345678',
    type: 'LTV (Light Transport Vehicle)',
    issueDate: 'Jan 10, 2020',
    expiryDate: 'Jan 10, 2027',
    status: 'Valid'
  };

  vehicle = {
    makeModel: 'Toyota Hiace',
    year: '2022',
    capacity: '15 Passengers'
  };

  documents: Document[] = [
    { name: 'Driving License', uploadDate: 'Jun 15, 2024', status: 'Verified', icon: 'bi-file-earmark-text' },
    { name: 'CNIC', uploadDate: 'Jun 15, 2024', status: 'Verified', icon: 'bi-file-person' },
    { name: 'Vehicle Registration', uploadDate: 'Jun 15, 2024', status: 'Verified', icon: 'bi-file-earmark-check' },
    { name: 'Route Permit', uploadDate: 'Jun 15, 2024', status: 'Verified', icon: 'bi-file-earmark-richtext' },
    { name: 'Insurance Certificate', uploadDate: 'Dec 28, 2025', status: 'Pending', icon: 'bi-file-earmark-pdf' }
  ];

  stats = {
    memberSince: 'June 15, 2024',
    totalTours: 24,
    totalEarnings: 'Rs. 45k',
    rating: 4.8
  };

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Verified': return 'bg-success-subtle text-success';
      case 'Pending': return 'bg-warning-subtle text-warning-emphasis';
      case 'Valid': return 'bg-success-subtle text-success';
      case 'Active': return 'bg-success-subtle text-success';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}
