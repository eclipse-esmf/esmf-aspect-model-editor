import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationModel, NotificationsService } from '@bame/shared'
import { NotificationType } from '../../../../../../libs/shared/src/lib/enums/notification-type.enum';

@Component({
  selector: 'bci-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  displayedColumns: string[] = ['expand', 'date', 'type', 'message', 'goto', 'delete'];

  constructor(private dialogRef: MatDialogRef<NotificationsComponent>,
    public notificationsService: NotificationsService,
    public router: Router) { }

  ngOnInit() {
    this.notificationsService.getNotifications().forEach((notification) => {
      notification.expanded = false;
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  goTo(link: string): void {
    this.router.navigate([link]);
    this.onClose();
  }

  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.Warning:
        return 'Bosch-Ic-notification-warning';
      case NotificationType.Error:
        return 'Bosch-Ic-notification-error';
      default:
        return 'Bosch-Ic-information';
    }
  }

  clearNotification(notification: NotificationModel) {
    this.notificationsService.clearNotifications([notification]);
  }

  clearAllNotifications() {
    this.notificationsService.clearNotifications();
  }
}
