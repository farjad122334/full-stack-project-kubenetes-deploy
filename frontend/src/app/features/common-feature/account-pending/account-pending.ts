import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-account-pending',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './account-pending.html',
    styleUrl: './account-pending.css'
})
export class AccountPendingComponent {

    constructor(public authService: AuthService, private router: Router) { }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
