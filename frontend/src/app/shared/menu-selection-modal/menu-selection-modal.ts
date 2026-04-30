import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core'; // Added OnChanges
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface MenuItem {
  itemId: number;
  itemName: string;
  price: number;
  description?: string;
  selected: boolean;
  quantity: number;
}

@Component({
  selector: 'app-menu-selection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade show d-block" *ngIf="isVisible" tabindex="-1" style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 11000;">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold">Select Menu Items</h5>
              <p class="text-muted mb-0">{{ restaurantName }} - {{ offerType }}</p>
            </div>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body">
            <!-- Budget Info -->
            <div class="alert alert-info d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Quoted Price:</strong> PKR {{ quotedPricePerHead }} × {{ numberOfPeople }} people
              </div>
              <div class="fw-bold">Total: PKR {{ quotedTotal | number }}</div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted mt-2">Loading menu items...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && menuItems.length === 0" class="text-center py-4">
               <p class="text-muted">No menu items found for this restaurant.</p>
            </div>

            <!-- Menu Items Selection -->
            <div class="mb-3" *ngIf="!loading && menuItems.length > 0">
              <h6 class="fw-bold mb-3">Available Menu Items</h6>
              <div class="list-group">
                <div *ngFor="let item of menuItems" class="list-group-item border rounded-3 mb-2">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="form-check flex-grow-1">
                      <input class="form-check-input" type="checkbox" 
                        [id]="'item-' + item.itemId"
                        [(ngModel)]="item.selected"
                        (change)="updateCalculations()">
                      <label class="form-check-label ms-2" [for]="'item-' + item.itemId">
                        <strong>{{ item.itemName }}</strong>
                        <br>
                        <small class="text-muted">{{ item.description }}</small>
                      </label>
                    </div>
                    <div class="text-end" style="min-width: 200px;">
                      <span class="badge bg-primary mb-2">PKR {{ item.price }}</span>
                      <div class="input-group input-group-sm" *ngIf="item.selected">
                        <span class="input-group-text">Qty</span>
                        <input type="number" class="form-control" 
                          [(ngModel)]="item.quantity"
                          (ngModelChange)="updateCalculations()"
                          min="1" [max]="numberOfPeople" style="max-width: 70px;">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Calculation -->
            <div class="card bg-light border-0 p-3">
              <div class="d-flex justify-content-between mb-2">
                <span>Selected Items Total:</span>
                <strong>PKR {{ selectedTotal | number }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Quoted Total:</span>
                <strong>PKR {{ quotedTotal | number }}</strong>
              </div>
              <hr>
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Difference:</span>
                <span [class]="getDifferenceClass()">
                  PKR {{ difference | number }} ({{ differencePercent | number:'1.1-1' }}%)
                  <i class="bi" [ngClass]="isWithinTolerance ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'"></i>
                </span>
              </div>
              <small class="text-muted mt-2" *ngIf="!isWithinTolerance">
                <i class="bi bi-info-circle me-1"></i> Total should be within ±5% of quoted price
              </small>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
            <button type="button" class="btn btn-success" 
              (click)="triggerConfirm()"
              [disabled]="!isWithinTolerance || selectedItems.length === 0">
              <i class="bi bi-check-circle me-1"></i> Confirm & Approve Offer
            </button>
          </div>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .modal.show {
      display: block;
    }
  `]
})
export class MenuSelectionModal {
  @Input() isVisible: boolean = false;
  @Input() restaurantName: string = '';
  @Input() restaurantId: number = 0;
  @Input() offerType: string = '';
  @Input() quotedPricePerHead: number = 0;
  @Input() numberOfPeople: number = 0;
  @Output() onConfirm = new EventEmitter<MenuItem[]>();
  @Output() onClose = new EventEmitter<void>();

  menuItems: MenuItem[] = [];
  selectedTotal: number = 0;
  quotedTotal: number = 0;
  difference: number = 0;
  differencePercent: number = 0;
  isWithinTolerance: boolean = true; // Default true to allow proceeding if prices match exactly initially or are ignored? No, logic updates it.
  loading: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnChanges() {
    console.log('MenuSelectionModal ngOnChanges:', { isVisible: this.isVisible, restaurantId: this.restaurantId });
    if (this.isVisible && this.restaurantId) {
      this.loadMenu();
      this.quotedTotal = this.quotedPricePerHead * this.numberOfPeople;
      this.updateCalculations();
    }
  }

  loadMenu() {
    this.loading = true;
    const url = `${environment.apiUrl}/api/restaurantmenu?restaurantId=${this.restaurantId}`;
    console.log('Loading menu from:', url);
    this.http.get<any[]>(url)
      .subscribe({
        next: (menus) => {
          console.log('Menu loaded:', menus);
          // Flatten menus to items
          this.menuItems = menus.flatMap(m => m.menuItems || []).map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            price: item.price,
            description: item.description,
            selected: false,
            quantity: this.numberOfPeople // Default to total people
          }));
          this.loading = false;
          this.updateCalculations();
        },
        error: (err) => {
          console.error('Error loading menu', err);
          this.loading = false;
        }
      });
  }

  updateCalculations() {
    this.selectedTotal = this.menuItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    this.difference = Math.abs(this.selectedTotal - this.quotedTotal);
    this.differencePercent = (this.difference / this.quotedTotal) * 100;
    this.isWithinTolerance = this.differencePercent <= 5;
  }

  get selectedItems(): MenuItem[] {
    return this.menuItems.filter(item => item.selected);
  }

  getDifferenceClass(): string {
    if (this.isWithinTolerance) return 'text-success fw-bold';
    return 'text-warning fw-bold';
  }

  triggerConfirm() {
    if (this.isWithinTolerance && this.selectedItems.length > 0) {
      this.confirm();
    }
  }

  confirm() {
    this.onConfirm.emit(this.selectedItems);
  }

  close() {
    this.onClose.emit();
  }
}
