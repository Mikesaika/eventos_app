import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit {
  data: NotificationData | null = null;
  timeoutId: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.notification$.subscribe((notification) => {
      this.data = notification;

      if (notification) {
        // Oculta automáticamente después de 3 segundos
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.close(), 3000);
      }
    });
  }

  close() {
    this.data = null;
    this.notificationService.clear();
  }
}