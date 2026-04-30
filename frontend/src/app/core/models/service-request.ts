export enum ServiceType {
    Transport = 'Transport',
    Meal = 'Meal',
    Accommodation = 'Accommodation',
    Guide = 'Guide'
}

export enum ServiceRequestStatus {
    Open = 'Open',
    Pending = 'Pending',
    Fulfilled = 'Fulfilled',
    Cancelled = 'Cancelled'
}

export interface ServiceRequest {
    serviceRequestId?: number; // Optional as it might be new
    tourId?: number;
    serviceType: ServiceType;
    location: string;
    dateNeeded: string; // Date string
    time?: string; // Time string for meals (e.g., "13:00")
    stayDurationDays?: number; // For accommodation
    estimatedBudget?: number;
    status: ServiceRequestStatus;
}
