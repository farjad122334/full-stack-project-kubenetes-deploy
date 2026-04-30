import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-registration-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-warning"><i class="bi bi-exclamation-triangle-fill me-2"></i>Incomplete Registration</h3>
        </div>
        <div class="modal-body">
          <p class="h5 text-center my-3">You have incomplete registration. Please complete registration first!</p>
          <p class="text-muted text-center small" *ngIf="message">{{ message }}</p>
          <div class="alert alert-info" *ngIf="step === '2'">
            <i class="bi bi-envelope-paper me-2"></i>We will send a new OTP to your email.
          </div>
        </div>
        <div class="modal-footer justify-content-center">
          <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onConfirm()">
            Complete Registration <i class="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .modal-header {
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .modal-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
  `]
})
export class ResumeRegistrationModalComponent {
  @Input() isVisible = false;
  @Input() message = '';
  @Input() step = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
