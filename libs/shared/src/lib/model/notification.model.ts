import { NotificationType } from "../enums/notification-type.enum";

export class NotificationModel {
    public expanded = false;
    public date: Date = new Date();

    constructor(public title?: string, public description?: string, public link?: string, public type?: NotificationType) { }

    get formattedTime(): string {
        return this.date.toLocaleTimeString();
    }

    get formattedDate(): string {
        const d = this.date.getDate();
        const m = this.date.getMonth() + 1;
        const y = this.date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
}
