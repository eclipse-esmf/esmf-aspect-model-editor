import {Component, Inject} from '@angular/core';
import {CORE_CONFIG, ModalWindowService} from '@bci-web-core/core';
import {MatDialog} from '@angular/material/dialog';
import {CorporateInformationDialogComponent} from './corporate-information-dialog/corporate-information-dialog.component';
import {LegalNoticeDialogComponent} from './legal-notice-dialog/legal-notice-dialog.component';
import {AppConfig, BrowserService} from '@bame/shared';

@Component({
  selector: 'bci-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  constructor(
    private browserService: BrowserService,
    private modalWindowService: ModalWindowService,
    private matDialog: MatDialog,
    @Inject(CORE_CONFIG) public config: AppConfig
  ) {}

  openDisclosureDocument() {
    if (!this.browserService.isStartedAsElectronApp()) {
      const tabRef = window.open(this.browserService.getAssetBasePath() + '/footer-doc/disclosure/3rdparty-licenses.pdf', '_blank');
      tabRef.focus();
      tabRef.document.close();
      return;
    }

    const path = window.require('path');
    const BrowserWindow = window.require('@electron/remote').BrowserWindow;
    const electronBrowserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        plugins: true,
      },
    });

    const disclosureDocument = path.normalize(
      'file://' + path.dirname(window.location.pathname) + '/assets/footer-doc/disclosure/3rdparty-licenses.pdf'
    );

    electronBrowserWindow.loadURL(disclosureDocument);
  }

  onOpenCorporateInformationDialog() {
    this.modalWindowService
      .openDialogWithComponent(
        CorporateInformationDialogComponent,
        {
          width: '30%',
          height: '60%',
          panelClass: 'footer-modal',
        },
        this.matDialog
      )
      .afterClosed();
  }

  onOpenLegalNoticeDialog() {
    this.modalWindowService
      .openDialogWithComponent(
        LegalNoticeDialogComponent,
        {
          id: 'legalNoticeDialog',
          width: '100%',
          maxWidth: '1300px',
          maxHeight: '714px', // 650 + 64 padding
          height: '95%',
        },
        this.matDialog
      )
      .afterClosed();
  }
}
