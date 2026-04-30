import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-role-selection',
    imports: [CommonModule, RouterModule],
    templateUrl: './role-selection.html',
    styleUrl: './role-selection.css'
})
export class RoleSelection {

    constructor(private router: Router, private toastService: ToastService) { }

    selectRole(role: string) {
        // Navigate to tourist signup page for tourist role
        if (role === 'tourist') {
            this.router.navigate(['/tourist-signup']);
        } else if (role === 'driver') {
            this.router.navigate(['/driver-signup']);
        } else if (role === 'manager') {
            this.router.navigate(['/restaurant-signup']);
        } else {
            // Placeholder for other roles until their signup pages are ready
            this.toastService.show('Registration for ' + role + ' is coming soon!', 'info');
        }
    }

    goBack() {
        this.router.navigate(['/login']);
    }
}
