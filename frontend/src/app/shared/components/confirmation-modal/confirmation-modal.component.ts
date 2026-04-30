import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modal fade show d-block" *ngIf="isVisible" tabindex="-1" style="background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 11000;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" [class.text-danger]="type === 'danger'" [class.text-warning]="type === 'warning'">
              {{ title }}
            </h5>
            <button type="button" class="btn-close" (click)="cancel()"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0 fs-6">{{ message }}</p>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="cancel()">
              {{ cancelText }}
            </button>
            <button type="button" class="btn rounded-pill px-4 text-white"
              [ngClass]="type === 'danger' ? 'btn-danger' : (type === 'warning' ? 'btn-warning' : 'btn-primary')"
              (click)="confirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal { z-index: 1055; }
  `]
})
export class ConfirmationModalComponent {
    @Input() isVisible: boolean = false;
    @Input() title: string = 'Confirm Action';
    @Input() message: string = 'Are you sure you want to proceed?';
    @Input() confirmText: string = 'Confirm';
    @Input() cancelText: string = 'Cancel';
    @Input() type: 'danger' | 'warning' | 'info' = 'info';

    @Output() onConfirm = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();

    confirm() {
        this.onConfirm.emit();
    }

    cancel() {
        this.onCancel.emit();
    }
}
