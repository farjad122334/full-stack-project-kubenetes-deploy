import { ServiceRequest } from './service-request';

export enum PricingUnit {
    PerPerson = 'PerPerson',
    PerRoomPerNight = 'PerRoomPerNight',
    FixedTotal = 'FixedTotal',
    PerDay = 'PerDay'
}

export enum OfferStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected'
}

export interface ServiceOffer {
    serviceOfferId?: number;
    serviceRequestId: number;
    vendorId: number;
    vendorName?: string; // For display

    price: number;
    unit: PricingUnit;
    quantityOffered: number;

    description?: string;
    status: OfferStatus;

    // Optional expanded property
    serviceRequest?: ServiceRequest;
}
