export interface Tour {
    id: number;
    name: string;
    description: string;
    price: number;
    couplePrice?: number;
    totalSeats: number;
    seatsBooked: number;
    location: string; // Departure
    destination: string; // Final Destination
    duration: string; // e.g., "3 Days"
    startDate?: string;
    endDate?: string;
    imageUrl: string;
    rating: number;
    type: 'Single' | 'Multi';
    vehicles: number;
    destinations?: string[]; // For multi-destination tours

    // New fields from Backend
    pricePerHead?: number;
    coupleDiscountPercentage?: number;
    bulkDiscountPercentage?: number;
    bulkBookingMinPersons?: number;
    status: string;
}
