import {Injectable} from '@angular/core';
import {NotificationsService} from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class ElectronTunnelService {
  private ipcRenderer = window.require?.('electron').ipcRenderer;

  constructor(private notificationsService: NotificationsService) {}

  public subscribeMessages() {
    if (!this.ipcRenderer) {
      return;
    }

    this.onServiceNotStarted();
  }

  private onServiceNotStarted() {
    this.ipcRenderer.on('backend-startup-error', () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
  }
}
