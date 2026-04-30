import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RoomCategory, RoomCategoryFormData } from '../../../core/models/room-category.interface';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-rooms',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageUploaderComponent],
    templateUrl: './rooms.html',
    styleUrl: './rooms.css'
})
export class Rooms implements OnInit {
    roomCategories: RoomCategory[] = [];
    loading = true;
    restaurantId: number = 0;

    // Modal state
    showModal = false;
    isEditMode = false;
    selectedCategory: RoomCategory | null = null;

    // Form data
    formData: RoomCategoryFormData = {
        categoryName: '',
        description: '',
        pricePerNight: 0,
        maxGuests: 1,
        totalRooms: 1,
        amenities: []
    };

    // Image handling
    selectedImages: File[] = [];
    existingImages: any[] = [];

    // Amenities
    newAmenity = '';

    // Delete confirmation
    showDeleteModal = false;
    categoryToDelete: RoomCategory | null = null;

    constructor(
        private restaurantService: RestaurantService,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user && user.roleSpecificId) {
            this.restaurantId = user.roleSpecificId;
            this.loadRoomCategories();
        }
    }

    loadRoomCategories(): void {
        this.loading = true;
        this.restaurantService.getRoomCategories(this.restaurantId).subscribe({
            next: (categories) => {
                // Parse amenities JSON and prefix image URLs
                this.roomCategories = categories.map(cat => ({
                    ...cat,
                    amenitiesArray: cat.amenities ? JSON.parse(cat.amenities) : [],
                    roomImages: cat.roomImages.map(img => ({
                        ...img,
                        imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${environment.apiUrl}${img.imageUrl}`
                    }))
                }));
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading room categories:', err);
                this.toastService.show('Failed to load room categories', 'error');
                this.loading = false;
            }
        });
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.selectedCategory = null;
        this.resetForm();
        this.showModal = true;
    }

    openEditModal(category: RoomCategory): void {
        this.isEditMode = true;
        this.selectedCategory = category;
        this.formData = {
            categoryName: category.categoryName,
            description: category.description || '',
            pricePerNight: category.pricePerNight,
            maxGuests: category.maxGuests,
            totalRooms: category.totalRooms,
            amenities: category.amenitiesArray || []
        };
        this.existingImages = category.roomImages.map(img => ({
            imageId: img.roomImageId,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary
        }));
        this.selectedImages = [];
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.resetForm();
    }

    resetForm(): void {
        this.formData = {
            categoryName: '',
            description: '',
            pricePerNight: 0,
            maxGuests: 1,
            totalRooms: 1,
            amenities: []
        };
        this.selectedImages = [];
        this.existingImages = [];
        this.newAmenity = '';
    }

    onImagesSelected(files: File[]): void {
        this.selectedImages = files;
    }

    onImageDeleted(imageId: number): void {
        if (this.isEditMode) {
            this.restaurantService.deleteRoomImage(this.restaurantId, imageId).subscribe({
                next: () => {
                    this.existingImages = this.existingImages.filter(img => img.imageId !== imageId);
                    this.toastService.show('Image deleted successfully', 'success');
                },
                error: (err) => {
                    console.error('Error deleting image:', err);
                    this.toastService.show('Failed to delete image', 'error');
                }
            });
        }
    }

    addAmenity(): void {
        if (this.newAmenity.trim() && !this.formData.amenities?.includes(this.newAmenity.trim())) {
            this.formData.amenities = [...(this.formData.amenities || []), this.newAmenity.trim()];
            this.newAmenity = '';
        }
    }

    removeAmenity(amenity: string): void {
        this.formData.amenities = this.formData.amenities?.filter(a => a !== amenity);
    }

    saveRoomCategory(): void {
        if (!this.validateForm()) {
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('CategoryName', this.formData.categoryName);
        formDataToSend.append('Description', this.formData.description || '');
        formDataToSend.append('PricePerNight', this.formData.pricePerNight.toString());
        formDataToSend.append('MaxGuests', this.formData.maxGuests.toString());
        formDataToSend.append('TotalRooms', this.formData.totalRooms.toString());
        formDataToSend.append('Amenities', JSON.stringify(this.formData.amenities || []));

        if (this.isEditMode && this.selectedCategory) {
            // For update, use JSON body instead of FormData
            const updateData = {
                categoryName: this.formData.categoryName,
                description: this.formData.description || '',
                pricePerNight: this.formData.pricePerNight,
                maxGuests: this.formData.maxGuests,
                totalRooms: this.formData.totalRooms,
                amenities: JSON.stringify(this.formData.amenities || [])
            };

            this.restaurantService.updateRoomCategory(this.restaurantId, this.selectedCategory.roomCategoryId, updateData).subscribe({
                next: () => {
                    // Upload new images if any
                    if (this.selectedImages.length > 0) {
                        this.uploadAdditionalImages(this.selectedCategory!.roomCategoryId);
                    } else {
                        this.toastService.show('Room category updated successfully', 'success');
                        this.closeModal();
                        this.loadRoomCategories();
                    }
                },
                error: (err) => {
                    console.error('Error updating room category:', err);
                    this.toastService.show('Failed to update room category', 'error');
                }
            });
        } else {
            // For create, append images to FormData
            this.selectedImages.forEach(image => {
                formDataToSend.append('Images', image);
            });

            this.restaurantService.createRoomCategory(this.restaurantId, formDataToSend).subscribe({
                next: () => {
                    this.toastService.show('Room category created successfully', 'success');
                    this.closeModal();
                    this.loadRoomCategories();
                },
                error: (err) => {
                    console.error('Error creating room category:', err);
                    this.toastService.show('Failed to create room category', 'error');
                }
            });
        }
    }

    uploadAdditionalImages(categoryId: number): void {
        this.restaurantService.uploadRoomImages(this.restaurantId, categoryId, this.selectedImages).subscribe({
            next: () => {
                this.toastService.show('Room category and images updated successfully', 'success');
                this.closeModal();
                this.loadRoomCategories();
            },
            error: (err) => {
                console.error('Error uploading images:', err);
                this.toastService.show('Room category updated but failed to upload images', 'warning');
                this.closeModal();
                this.loadRoomCategories();
            }
        });
    }

    validateForm(): boolean {
        if (!this.formData.categoryName.trim()) {
            this.toastService.show('Category name is required', 'error');
            return false;
        }
        if (this.formData.pricePerNight <= 0) {
            this.toastService.show('Price must be greater than 0', 'error');
            return false;
        }
        if (this.formData.maxGuests <= 0) {
            this.toastService.show('Max guests must be greater than 0', 'error');
            return false;
        }
        if (this.formData.totalRooms <= 0) {
            this.toastService.show('Total rooms must be greater than 0', 'error');
            return false;
        }
        if (!this.isEditMode && this.selectedImages.length === 0) {
            this.toastService.show('Please upload at least one image', 'error');
            return false;
        }
        return true;
    }

    confirmDelete(category: RoomCategory): void {
        this.categoryToDelete = category;
        this.showDeleteModal = true;
    }

    cancelDelete(): void {
        this.categoryToDelete = null;
        this.showDeleteModal = false;
    }

    deleteRoomCategory(): void {
        if (!this.categoryToDelete) return;

        this.restaurantService.deleteRoomCategory(this.restaurantId, this.categoryToDelete.roomCategoryId).subscribe({
            next: () => {
                this.toastService.show('Room category deleted successfully', 'success');
                this.cancelDelete();
                this.loadRoomCategories();
            },
            error: (err) => {
                console.error('Error deleting room category:', err);
                this.toastService.show(err.error?.message || 'Failed to delete room category', 'error');
                this.cancelDelete();
            }
        });
    }

    getPrimaryImage(category: RoomCategory): string {
        const primary = category.roomImages.find(img => img.isPrimary);
        return primary?.imageUrl || category.roomImages[0]?.imageUrl || 'https://placehold.co/400x300/e3e3e3/666?text=No+Image';
    }
}
