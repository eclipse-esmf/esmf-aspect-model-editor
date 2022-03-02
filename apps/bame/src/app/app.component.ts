/**
 * Copyright (C) 2022 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {
  AlertService,
  AlertType,
  BciImprintComponent,
  BciMessagesIntl,
  BciMessagesService,
  BciSidebarService,
  ModalWindowService,
  NavigationService,
  PrimaryButton,
  SidebarNavItem,
} from '@bci-web-core/core';
import {Observable, of} from 'rxjs';
import {DocumentComponent} from './components/help/document.component';
import {first, switchMap} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DomainModelToRdfService} from '@bame/aspect-exporter';
import {SettingDialogComponent} from '@bame/settings-dialog';
import {LogService, NotificationsService} from '@bame/shared';
import {EditorService} from '@bame/editor';
import {ModelApiService} from '@bame/api';
import {NotificationsComponent} from './components/notifications/notifications.component';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'bci-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Aspect Model Editor';

  sidebarLinks: SidebarNavItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      cb: () => this.onOpenSettings(),
      icon: 'Bosch-Ic-settings',
    },
  ];

  sidebarFooterLinks: SidebarNavItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      cb: () => this.onLoadNotifications(),
      icon: 'Bosch-Ic-alarm',
      iconBadgeText: this.notificationsService.badgeText,
    },
    {
      id: 'help',
      cb: () => this.onShowHelpDialog(),
      title: 'Help',
      icon: 'Bosch-Ic-help',
    },
    {
      id: 'imprint',
      cb: () => this.onAbout(),
      title: 'Imprint',
      icon: 'Bosch-Ic-information',
    },
  ];

  constructor(
    private titleService: Title,
    private editorService: EditorService,
    private modelApiService: ModelApiService,
    private navigationService: NavigationService,
    private modalWindowService: ModalWindowService,
    private bciMessagesService: BciMessagesService,
    private bciSidebarService: BciSidebarService,
    private bciMessagesIntl: BciMessagesIntl,
    private loggerService: LogService,
    private alertService: AlertService,
    private matDialog: MatDialog,
    private notificationsService: NotificationsService,
    private domainModelToRdf: DomainModelToRdfService,
    private electronService: ElectronService
  ) {
    // Overwrite name of BciMessagesComponent
    this.bciMessagesIntl.title = 'Notifications';
    this.domainModelToRdf.listenForStoreUpdates();
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.getSidebarLinks().subscribe(sidebarLinks => (this.sidebarLinks = this.sidebarLinks.concat(sidebarLinks)));
    this.bciSidebarService.setSidebarState(true);
    this.setContextMenu();

    if (!window.location.search.includes('e2e=true')) {
      this.modelApiService
        .loadLatest()
        .pipe(first())
        .subscribe({
          next: aspectModel => {
            if (aspectModel.length > 0) {
              this.onLoadAutoSavedModel(aspectModel);
            }
          },
          error: error => {
            if (error.status === 400) {
              this.loggerService.logError(`Error during load auto saved model (${JSON.stringify(error)})`);
            } else if (error.status === 404) {
              this.loggerService.logInfo('Default aspect was loaded');
              this.loadNewAspectModel(
                this.modelApiService.getDefaultAspectModel(),
                () => {
                  this.notificationsService.info('Default model was loaded', null, null, 5000);
                },
                true
              );
            }
          },
        });
    }
  }

  private isGraphElement(target: HTMLElement) {
    let element = target;
    while (element.parentElement !== document.body) {
      if (element.id === 'graph') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  setContextMenu() {
    if (!this.electronService.remote) {
      return;
    }

    const {Menu} = this.electronService.remote;
    const shell = this.electronService.shell;

    window.addEventListener('contextmenu', e => {
      e.preventDefault();
      const target = e.target as HTMLAnchorElement;
      if (this.isGraphElement(target)) {
        return;
      }

      const template: any = [
        ...(target.tagName.toLowerCase() === 'a'
          ? [
              {
                label: target.href.startsWith('mailto:') ? 'Send email' : 'Open in browser',
                click: () => {
                  shell.openExternal((e.target as HTMLAnchorElement).href);
                },
              },
            ]
          : []),
        {role: 'cut', label: 'Cut selected text'},
        {role: 'copy', label: 'Copy selected text'},
        ...(target.tagName.toLowerCase() === 'a'
          ? [
              {
                label: 'Copy link address',
                click: () => {
                  navigator.clipboard.writeText(target.href);
                },
              },
            ]
          : []),
        {role: 'paste', label: 'Paste'},
      ];

      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  }

  getSidebarLinks(): Observable<SidebarNavItem[]> {
    return this.navigationService.getNavigationItems();
  }

  onAbout() {
    const imprintModal = this.modalWindowService.openDialogWithComponent(BciImprintComponent);
    this.keyDownEvents(imprintModal);
  }

  onLoadNotifications() {
    const notificationModal = this.modalWindowService.openDialogWithComponent(NotificationsComponent, {
      width: '60%',
    });
    this.keyDownEvents(notificationModal);
  }

  private keyDownEvents(matDialogRef: MatDialogRef<any>) {
    matDialogRef.keydownEvents().subscribe(keyBoardEvent => {
      // KeyCode might not be supported by electron.
      if (keyBoardEvent.code === 'Escape') {
        matDialogRef.close();
      }
    });
  }

  onOpenSettings() {
    this.modalWindowService
      .openDialogWithComponent(
        SettingDialogComponent,
        {
          width: '60%',
          height: '70%',
        },
        this.matDialog
      )
      .afterClosed();
  }

  onShowHelpDialog() {
    this.modalWindowService.openDialogWithComponent(DocumentComponent, {
      width: '55%',
    });
  }

  onLoadAutoSavedModel(aspectModel: string) {
    this.alertService
      .openAlertBox({
        type: AlertType.None,
        title: 'Load auto-saved model?',
        description: 'You can either continue with the auto-saved model or dismiss it to start with the default Aspect Model.\n',
        leftButtonTitle: 'Load auto-saved model',
        rightButtonTitle: 'Dismiss',
        primaryButton: PrimaryButton.LeftButton,
      })
      .afterClosed()
      .subscribe((chosenButton: string) => {
        if (chosenButton === 'left') {
          this.loadNewAspectModel(of(aspectModel), () => {
            this.notificationsService.info('Auto saved model was loaded');
          });
          this.editorService.updateLastSavedRdf({rdf: aspectModel});
          return;
        }

        this.loadNewAspectModel(
          this.modelApiService.getDefaultAspectModel(),
          () => {
            this.notificationsService.info('Default model was loaded', null, null);
          },
          true
        );
      });
  }

  private loadNewAspectModel(aspectModel: Observable<string>, callback, isDefault?: boolean) {
    aspectModel
      .pipe(
        switchMap(model => this.editorService.loadNewAspectModel(model, isDefault)),
        first()
      )
      .subscribe(callback);
  }
}
