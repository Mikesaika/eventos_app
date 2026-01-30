import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationData {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning'; 
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new BehaviorSubject<NotificationData | null>(null);
    notification$ = this.notificationSubject.asObservable();

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
        this.notificationSubject.next({ message, type });
        setTimeout(() => {
            this.clear();
        }, 5000);
    }

    clear() {
        this.notificationSubject.next(null);
    }
}