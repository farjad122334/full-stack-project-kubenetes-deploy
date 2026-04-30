export interface RoomImage {
    roomImageId: number;
    roomCategoryId: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
}

export interface RoomCategory {
    roomCategoryId: number;
    restaurantId: number;
    categoryName: string;
    description?: string;
    pricePerNight: number;
    maxGuests: number;
    totalRooms: number;
    availableRooms: number;
    amenities?: string; // JSON string from backend
    amenitiesArray?: string[]; // Parsed array for frontend use
    createdAt: string;
    roomImages: RoomImage[];
}

export interface RoomCategoryFormData {
    categoryName: string;
    description?: string;
    pricePerNight: number;
    maxGuests: number;
    totalRooms: number;
    amenities?: string[];
}
