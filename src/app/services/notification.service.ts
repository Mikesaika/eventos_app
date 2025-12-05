import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<NotificationData | null>();
    notification$ = this.notificationSubject.asObservable();

    show(message: string, type: 'success' | 'error' | 'info' = 'success') {
        this.notificationSubject.next({ message, type });
    }

    clear() {
        this.notificationSubject.next(null);
    }
}