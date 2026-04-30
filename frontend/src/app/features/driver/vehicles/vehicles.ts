import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Vehicle {
    vehicleId?: number;
    driverId: number;
    registrationNumber: string;
    vehicleType: string;
    model: string;
    capacity: number;
    status: string;
}

import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
    selector: 'app-vehicles',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageUploaderComponent, ConfirmModal],
    templateUrl: './vehicles.html',
    styleUrl: './vehicles.css'
})
export class Vehicles implements OnInit {
    vehicles: any[] = [];
    isLoading = true;
    showAddModal = false;
    selectedImages: File[] = [];

    // New Vehicle Form
    newVehicle: any = {
        registrationNumber: '',
        vehicleType: '',
        model: '',
        capacity: undefined,
        status: 'Active'
    };

    // Confirm Modal State
    showConfirmModal = false;
    confirmTitle = '';
    confirmMessage = '';
    confirmAction: () => void = () => { };
    confirmText = 'Confirm';
    confirmType: 'primary' | 'danger' | 'warning' | 'info' | 'success' = 'danger';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastService: ToastService,
        private vehicleService: VehicleService
    ) { }

    onImagesSelected(files: File[]): void {
        this.selectedImages = files;
    }

    ngOnInit(): void {
        this.loadVehicles();
    }

    loadVehicles(): void {
        const user = this.authService.getUser();
        if (!user || !user.roleSpecificId) {
            this.toastService.show('User session not found', 'error');
            return;
        }

        this.isLoading = true;
        this.http.get<Vehicle[]>(`${environment.apiUrl}/api/vehicles/driver/${user.roleSpecificId}`)
            .subscribe({
                next: (data) => {
                    this.vehicles = data;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading vehicles:', err);
                    this.toastService.show('Failed to load vehicles', 'error');
                    this.isLoading = false;
                }
            });
    }

    openAddModal(): void {
        this.showAddModal = true;
        this.newVehicle = {
            registrationNumber: '',
            vehicleType: '',
            model: '',
            capacity: undefined,
            status: 'Active'
        };
    }

    closeAddModal(): void {
        this.showAddModal = false;
    }

    addVehicle(): void {
        const user = this.authService.getUser();
        if (!user || !user.roleSpecificId) return;

        if (!this.newVehicle.registrationNumber || !this.newVehicle.vehicleType || !this.newVehicle.capacity) {
            this.toastService.show('Please fill in all required fields', 'warning');
            return;
        }

        const payload = {
            ...this.newVehicle,
            driverId: user.roleSpecificId
        };

        // Note: I need to ensure the backend supports POST to api/vehicles. 
        // If not, I'll need to add it to VehiclesController.
        this.http.post<any>(`${environment.apiUrl}/api/vehicles`, payload)
            .subscribe({
                next: (res) => {
                    if (this.selectedImages.length > 0) {
                        this.vehicleService.uploadVehicleImages(res.vehicleId, this.selectedImages)
                            .subscribe({
                                next: () => {
                                    this.toastService.show('Vehicle and images added successfully', 'success');
                                    this.loadVehicles();
                                    this.closeAddModal();
                                },
                                error: () => {
                                    this.toastService.show('Vehicle added but images failed to upload', 'warning');
                                    this.loadVehicles();
                                    this.closeAddModal();
                                }
                            });
                    } else {
                        this.toastService.show('Vehicle added successfully', 'success');
                        this.loadVehicles();
                        this.closeAddModal();
                    }
                },
                error: (err) => {
                    console.error('Error adding vehicle:', err);
                    this.toastService.show('Failed to add vehicle', 'error');
                }
            });
    }

    deleteVehicle(id?: number): void {
        if (!id) return;

        this.confirmTitle = 'Remove Vehicle';
        this.confirmMessage = 'Are you sure you want to remove this vehicle?';
        this.confirmText = 'Remove';
        this.confirmType = 'danger';

        this.confirmAction = () => {
            this.http.delete(`${environment.apiUrl}/api/vehicles/${id}`)
                .subscribe({
                    next: () => {
                        this.toastService.show('Vehicle removed successfully', 'success');
                        this.loadVehicles();
                        this.showConfirmModal = false;
                    },
                    error: (err) => {
                        console.error('Error deleting vehicle:', err);
                        this.toastService.show('Failed to remove vehicle', 'error');
                        this.showConfirmModal = false;
                    }
                });
        };
        this.showConfirmModal = true;
    }

    getVehicleIcon(type: string): string {
        const t = type.toLowerCase();
        if (t.includes('car')) return 'bi-car-front-fill';
        if (t.includes('bus') || t.includes('coaster')) return 'bi-bus-front-fill';
        if (t.includes('van') || t.includes('hiace')) return 'bi-truck-flatbed';
        return 'bi-truck';
    }
}
