import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-driver-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './driver-details.component.html',
    styleUrls: ['./driver-details.component.css']
})
export class DriverDetails implements OnInit {
    driver: any = null;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private driverService: DriverService,
        private vehicleService: VehicleService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.loadDriver(id);
            }
        });
    }

    loadDriver(id: number) {
        this.loading = true;
        this.driverService.getDriverById(id).subscribe({
            next: (data) => {
                this.driver = data;
                this.loading = false;
                // Construct full URLs for documents
                if (this.driver.documents) {
                    this.driver.documents.cnicFront = this.getUrl(this.driver.documents.cnicFront);
                    this.driver.documents.cnicBack = this.getUrl(this.driver.documents.cnicBack);
                    this.driver.documents.license = this.getUrl(this.driver.documents.license);
                }
            },
            error: (err) => {
                console.error('Failed to load driver', err);
                this.toastService.show('Failed to load driver details', 'error');
                this.loading = false;
            }
        });
    }

    private getUrl(path: string | null): string {
        if (!path) return 'assets/images/placeholder.jpg';
        if (path.startsWith('http')) return path;
        return `${environment.apiUrl}${path}`;
    }

    approveVehicle(vehicleId: number) {
        this.vehicleService.updateVehicleStatus(vehicleId, 'Active').subscribe({
            next: () => {
                const vehicle = this.driver.vehicles.find((v: any) => v.vehicleId === vehicleId);
                if (vehicle) vehicle.status = 'Active';
                this.toastService.show('Vehicle approved successfully', 'success');
            },
            error: () => this.toastService.show('Failed to approve vehicle', 'error')
        });
    }

    rejectVehicle(vehicleId: number) {
        this.vehicleService.updateVehicleStatus(vehicleId, 'Rejected').subscribe({
            next: () => {
                const vehicle = this.driver.vehicles.find((v: any) => v.vehicleId === vehicleId);
                if (vehicle) vehicle.status = 'Rejected';
                this.toastService.show('Vehicle rejected', 'success');
            },
            error: () => this.toastService.show('Failed to reject vehicle', 'error')
        });
    }

    approveDriver() {
        this.driverService.updateDriverStatus(this.driver.driverId, 'Verified').subscribe({
            next: () => {
                this.driver.accountStatus = 'Verified';
                this.toastService.show('Driver account verified', 'success');
            },
            error: () => this.toastService.show('Failed to verify driver', 'error')
        });
    }

    rejectDriver() {
        this.driverService.updateDriverStatus(this.driver.driverId, 'Rejected').subscribe({
            next: () => {
                this.driver.accountStatus = 'Rejected';
                this.toastService.show('Driver account rejected', 'success');
            },
            error: () => this.toastService.show('Failed to reject driver', 'error')
        });
    }
}
