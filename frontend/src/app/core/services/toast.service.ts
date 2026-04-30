import { Injectable, signal } from '@angular/core';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        const id = Date.now();
        const toast: Toast = { message, type, id };
        this.toasts.update(toasts => [...toasts, toast]);

        setTimeout(() => {
            this.remove(id);
        }, 3000); // Auto dismiss after 3 seconds
    }

    remove(id: number) {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }
}
