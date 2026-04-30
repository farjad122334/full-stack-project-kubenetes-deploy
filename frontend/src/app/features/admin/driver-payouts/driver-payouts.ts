import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface DriverPayout {
    offerId: number;
    transportationFare: number;
    isPaid: boolean;
    paidAt: string;
    payoutInitiated?: boolean; // Track if payout has been triggered
    driverName: string;
    driverPhone: string;
    vehicleModel: string;
    vehicleCapacity: number;
}

@Component({
    selector: 'app-driver-payouts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './driver-payouts.html',
    styleUrl: './driver-payouts.css'
})
export class DriverPayouts implements OnInit {
    tourId: number | null = null;
    drivers: DriverPayout[] = [];
    loading = true;
    error = '';
    processingPayoutId: number | null = null;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        public router: Router
    ) { }

    ngOnInit(): void {
        this.tourId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.tourId) {
            this.loadDrivers();
        } else {
            this.error = 'Invalid Tour ID';
            this.loading = false;
        }
    }

    loadDrivers(): void {
        this.loading = true;
        this.http.get<DriverPayout[]>(`${environment.apiUrl}/api/payouts/drivers/${this.tourId}`)
            .subscribe({
                next: (data) => {
                    this.drivers = data;
                    this.loading = false;
                },
                error: (err) => {
                    this.error = 'Failed to load drivers for payout';
                    this.loading = false;
                }
            });
    }

    initiatePayout(driver: DriverPayout): void {
        this.processingPayoutId = driver.offerId;
        this.http.post(`${environment.apiUrl}/api/payouts/driver/${driver.offerId}/pay`, {})
            .subscribe({
                next: () => {
                    alert('Payout process initiated for ' + driver.driverName + '. Please click Confirm to finalize.');
                    driver.payoutInitiated = true;
                    this.processingPayoutId = null;
                },
                error: (err) => {
                    alert('Failed to initiate payout');
                    this.processingPayoutId = null;
                }
            });
    }

    confirmPayout(driver: DriverPayout): void {
        this.processingPayoutId = driver.offerId;
        this.http.post(`${environment.apiUrl}/api/payouts/driver/${driver.offerId}/confirm`, {})
            .subscribe({
                next: () => {
                    driver.isPaid = true;
                    driver.paidAt = new Date().toISOString();
                    this.processingPayoutId = null;
                },
                error: (err) => {
                    alert('Failed to confirm payout');
                    this.processingPayoutId = null;
                }
            });
    }

    get allPaid(): boolean {
        return this.drivers.length > 0 && this.drivers.every(d => d.isPaid);
    }

    finalizeTour(): void {
        if (!this.allPaid) return;

        this.loading = true;
        this.http.post(`${environment.apiUrl}/api/tours/${this.tourId}/complete`, {})
            .subscribe({
                next: () => {
                    alert('Tour finalized and completed!');
                    this.router.navigate(['/admin/finalized-tours']);
                },
                error: (err) => {
                    alert('Failed to finalize tour');
                    this.loading = false;
                }
            });
    }
}
