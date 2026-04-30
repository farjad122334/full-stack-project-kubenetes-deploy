import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';
import { environment } from '../../../../environments/environment';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploaderComponent, ConfirmModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: any = null;
  isEditMode = false;
  editFormData: any = {};
  selectedImages: File[] = [];
  enlargedImageUrl: string | null = null;

  // Confirm Modal State
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: () => void = () => { };
  confirmText = 'Confirm';
  confirmType: 'primary' | 'danger' | 'warning' | 'info' | 'success' = 'danger';

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const user = this.authService.getUser();
    if (user && user.roleSpecificId) {
      this.restaurantService.getRestaurant(user.roleSpecificId).subscribe({
        next: (data) => {
          // Prefix image URLs if they are relative
          if (data && data.restaurantImages) {
            data.restaurantImages = data.restaurantImages.map((img: any) => ({
              ...img,
              imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${environment.apiUrl}${img.imageUrl}`
            }));
          }
          this.profile = data;
        },
        error: (err) => {
          this.toastService.show('Failed to load profile', 'error');
        }
      });
    }
  }

  editProfile() {
    this.editFormData = JSON.parse(JSON.stringify(this.profile));
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editFormData = {};
    this.selectedImages = [];
  }

  saveProfile() {
    if (!this.profile) return;

    // First update the profile details
    this.restaurantService.updateRestaurantProfile(this.profile.restaurantId, this.editFormData).subscribe({
      next: () => {
        // If there are images to upload, upload them next
        if (this.selectedImages.length > 0) {
          this.restaurantService.uploadRestaurantImages(this.profile.restaurantId, this.selectedImages).subscribe({
            next: () => {
              this.handleSaveSuccess('Profile and images updated successfully');
            },
            error: () => {
              this.toastService.show('Profile updated, but failed to upload images', 'warning');
              this.handleSaveSuccess();
            }
          });
        } else {
          this.handleSaveSuccess('Profile updated successfully');
        }
      },
      error: () => {
        this.toastService.show('Failed to update profile details', 'error');
      }
    });
  }

  private handleSaveSuccess(message?: string) {
    if (message) this.toastService.show(message, 'success');
    this.selectedImages = [];
    this.isEditMode = false;
    this.loadProfile();
  }

  onImagesSelected(files: File[]) {
    this.selectedImages = files;

    // If we are not in edit mode, upload immediately to the gallery
    if (!this.isEditMode && this.selectedImages.length > 0 && this.profile) {
      this.uploadImages();
    }
  }

  uploadImages() {
    if (!this.profile || this.selectedImages.length === 0) return;

    this.restaurantService.uploadRestaurantImages(this.profile.restaurantId, this.selectedImages).subscribe({
      next: () => {
        this.toastService.show('Images uploaded successfully', 'success');
        this.selectedImages = [];
        this.loadProfile();
      },
      error: () => {
        this.toastService.show('Failed to upload images', 'error');
      }
    });
  }

  enlargeImage(url: string) {
    this.enlargedImageUrl = url;
  }

  closeLightbox() {
    this.enlargedImageUrl = null;
  }

  onImageDeleted(imageId: number) {
    this.confirmTitle = 'Delete Image';
    this.confirmMessage = 'Are you sure you want to delete this image?';
    this.confirmText = 'Delete';
    this.confirmType = 'danger';

    this.confirmAction = () => {
      this.restaurantService.deleteRestaurantImage(imageId).subscribe({
        next: () => {
          this.toastService.show('Image deleted', 'success');
          this.loadProfile();
          this.showConfirmModal = false;
        },
        error: () => {
          this.toastService.show('Failed to delete image', 'error');
          this.showConfirmModal = false;
        }
      });
    };
    this.showConfirmModal = true;
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
          this.refreshProfile();
          alert('Profile picture updated!');
        },
        error: (err) => alert('Failed to update: ' + (err.error?.message || err.message))
      });
    }
  }

  private refreshProfile() {
    this.authService.getCurrentUser().subscribe({
      next: () => this.loadProfile(),
      error: (err) => console.error('Failed to sync profile', err)
    });
  }
}
