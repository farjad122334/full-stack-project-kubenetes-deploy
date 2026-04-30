import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
    ServiceRequest,
    ServiceType,
    ServiceRequestStatus
} from '../../../core/models/service-request';
import { ToastService } from '../../../core/services/toast.service';
import * as L from 'leaflet';

@Component({
    selector: 'app-plan-tour',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './plan-tour.html',
    styleUrl: './plan-tour.css'
})
export class PlanTour implements AfterViewInit {
    @ViewChild('mapContainer') mapContainer!: ElementRef;
    map!: L.Map;
    marker!: L.Marker;

    /* =======================
       STEP CONTROL (UI)
    ======================== */
    currentStep: number = 1; // 1=Details, 2=Pricing, 3=Requirements

    nextStep(): void {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    /* =======================
       TOUR DETAILS
    ======================== */
    tourName = '';
    destination = '';
    departureCity = '';
    departureLocation = '';
    startDate = '';
    endDate = '';
    maxParticipants: number | null = null;
    tourType = '';
    description = '';
    departureLat: number | null = null;
    departureLng: number | null = null;
    selectedImage: File | null = null;
    imagePreview: string | null = null;

    /* =======================
       PRICING
    ======================== */
    basePrice: number | null = null;
    coupleDiscount: number | null = null;
    bulkDiscount: number | null = null;

    /* =======================
       SERVICE REQUIREMENTS
    ======================== */
    featureRequirements: ServiceRequest[] = [];

    newReqType: ServiceType = ServiceType.Meal;
    newReqLocation = '';
    newReqDate = '';
    newReqTime = '';
    newReqDuration = 1;

    constructor(
        private router: Router,
        private http: HttpClient,
        private toastService: ToastService
    ) { }

    ngAfterViewInit(): void {
        this.initializeMap();
    }

    initializeMap(): void {
        const defaultLoc: [number, number] = [33.6844, 73.0479]; // Islamabad
        
        this.map = L.map(this.mapContainer.nativeElement).setView(defaultLoc, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        const icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        this.marker = L.marker(defaultLoc, { draggable: true, icon }).addTo(this.map);

        // Update coordinates on marker drag
        this.marker.on('dragend', () => {
            const pos = this.marker.getLatLng();
            if (pos) {
                this.updateLocationFromCoords(pos.lat, pos.lng);
            }
        });

        // Update coordinates on map click
        this.map.on('click', (event: L.LeafletMouseEvent) => {
            if (event.latlng) {
                this.marker.setLatLng(event.latlng);
                this.updateLocationFromCoords(event.latlng.lat, event.latlng.lng);
            }
        });

        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    updateLocationFromCoords(lat: number, lng: number): void {
        this.departureLat = lat;
        this.departureLng = lng;
        
        this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .subscribe({
                next: (result) => {
                    if (result && result.display_name) {
                        this.departureLocation = result.display_name;
                    }
                },
                error: (err) => console.error('Geocoding error', err)
            });
    }

    /* =======================
       ACTIONS
    ======================== */
    saveAsDraft(): void {
        console.log('Tour saved as draft');
    }

    addRequirement(): void {
        if (!this.newReqLocation || !this.newReqDate) {
            this.toastService.show('Please fill in Location and Date', 'warning');
            return;
        }

        const request: ServiceRequest = {
            serviceType: this.newReqType,
            location: this.newReqLocation,
            dateNeeded: this.newReqDate,
            time: this.newReqType === ServiceType.Meal ? this.newReqTime : undefined,
            stayDurationDays:
                this.newReqType === ServiceType.Accommodation
                    ? this.newReqDuration
                    : undefined,
            status: ServiceRequestStatus.Open
        };

        this.featureRequirements.push(request);
        this.resetRequirementForm();
    }

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedImage = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeRequirement(index: number): void {
        this.featureRequirements.splice(index, 1);
    }

    createTourPlan(): void {

        if (
            !this.tourName ||
            !this.destination ||
            !this.departureCity ||
            !this.departureLocation ||
            !this.startDate ||
            !this.endDate ||
            !this.maxParticipants ||
            !this.basePrice
        ) {
            this.toastService.show('Please fill in all required tour and pricing details', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('title', this.tourName);
        formData.append('description', this.description);
        formData.append('departureCity', this.departureCity);
        formData.append('departureLocation', this.departureLocation);
        if (this.departureLat) formData.append('departureLatitude', this.departureLat.toString());
        if (this.departureLng) formData.append('departureLongitude', this.departureLng.toString());
        formData.append('destination', this.destination);
        formData.append('startDate', this.startDate);
        formData.append('endDate', this.endDate);
        formData.append('maxCapacity', this.maxParticipants.toString());
        formData.append('pricePerHead', this.basePrice.toString());
        formData.append('coupleDiscountPercentage', (this.coupleDiscount ?? 0).toString());
        formData.append('bulkDiscountPercentage', (this.bulkDiscount ?? 0).toString());
        formData.append('bulkBookingMinPersons', '10');

        if (this.selectedImage) {
            formData.append('image', this.selectedImage);
        }

        this.featureRequirements.forEach((req, index) => {
            formData.append(`serviceRequirements[${index}].type`, req.serviceType);
            formData.append(`serviceRequirements[${index}].location`, req.location);
            formData.append(`serviceRequirements[${index}].dateNeeded`, req.dateNeeded);
            if (req.time) formData.append(`serviceRequirements[${index}].time`, req.time);
            if (req.stayDurationDays) formData.append(`serviceRequirements[${index}].stayDurationDays`, req.stayDurationDays.toString());
            formData.append(`serviceRequirements[${index}].estimatedPeople`, this.maxParticipants!.toString());
        });

        this.http.post<any>(`${environment.apiUrl}/api/tours`, formData)
            .subscribe({
                next: () => {
                    this.toastService.show('Tour created successfully', 'success');
                    this.router.navigate(['/admin/manage-tours']);
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show(err.error?.message || 'Failed to create tour', 'error');
                }
            });
    }

    /* =======================
       UTILITIES
    ======================== */
    resetRequirementForm(): void {
        this.newReqLocation = '';
        this.newReqDate = '';
        this.newReqTime = '';
        this.newReqDuration = 1;
    }

    getEndDate(startDate: string, nights: number): Date {
        const date = new Date(startDate);
        date.setDate(date.getDate() + nights);
        return date;
    }

    calculateDuration(): number {
        if (!this.startDate || !this.endDate) return 0;
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
}
