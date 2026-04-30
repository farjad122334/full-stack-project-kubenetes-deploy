import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface MenuItem {
    name: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
}

interface Order {
    id: number;
    tourName: string;
    approvalDate: string;
    tourDate: string;
    tourists: number;
    mealType: string;
    location: string;
    totalValue?: number;
    perPersonValue?: number;
    status: string;
    menuItems?: MenuItem[];
    isMenuVisible?: boolean;
    isServed?: boolean;
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './orders.html',
    styleUrl: './orders.css'
})
export class Orders implements OnInit {

    orders: Order[] = [];
    loading = false;
    activeTab: 'confirmed' | 'history' = 'confirmed';

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.http.get<any[]>(`${environment.apiUrl}/api/restaurantassignments`)
            .subscribe({
                next: (data) => {
                    this.mapAssignmentsToOrders(data);
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading orders', err);
                    this.loading = false;
                }
            });
    }

    mapAssignmentsToOrders(assignments: any[]) {
        this.orders = assignments.map(a => {
            const menuItems = a.restaurantOffer?.offerMenuItems?.map((om: any) => ({
                name: om.menuItem?.itemName || 'Unknown Item',
                quantity: a.expectedPeople, // Assuming quantity matches pax count for per-head offers
                pricePerUnit: om.menuItem?.price || 0,
                total: (om.menuItem?.price || 0) * a.expectedPeople
            })) || [];

            return {
                id: a.assignmentId,
                tourName: a.tour?.title || 'Unknown Tour',
                approvalDate: new Date(a.assignedAt).toLocaleDateString(),
                tourDate: new Date(a.serviceRequirement?.dateNeeded || a.tour?.startDate).toLocaleDateString(),
                tourists: a.expectedPeople,
                mealType: a.restaurantOffer?.mealType || 'N/A',
                location: a.serviceRequirement?.location || a.tour?.destination || 'N/A',
                totalValue: a.finalPrice,
                perPersonValue: a.pricePerHead,
                status: a.isServed ? 'Served' : 'Confirmed',
                menuItems: menuItems,
                isMenuVisible: false,
                isServed: a.isServed
            };
        });
    }

    get filteredOrders(): Order[] {
        return this.orders.filter(o => this.activeTab === 'confirmed' ? !o.isServed : o.isServed);
    }

    setActiveTab(tab: 'confirmed' | 'history') {
        this.activeTab = tab;
    }

    toggleMenu(order: Order) {
        order.isMenuVisible = !order.isMenuVisible;
    }

    markAsServed(order: Order) {
        if (!confirm('Are you sure you want to mark this order as served?')) return;

        this.loading = true;
        this.http.put(`${environment.apiUrl}/api/restaurantassignments/${order.id}/serve`, { isServed: true, paymentMethod: 'Online' })
            .subscribe({
                next: () => {
                    order.isServed = true;
                    order.status = 'Served';
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error marking as served', err);
                    this.loading = false;
                    alert('Failed to mark as served.');
                }
            });
    }

}
