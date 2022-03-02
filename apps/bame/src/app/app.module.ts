import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BciCoreModule, BciLayoutModule, BciSharedModule} from '@bci-web-core/core';
import {environment} from 'environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {EditorCanvasModule} from './components/editor-canvas/editor-canvas.module';
import {CommonModule} from '@angular/common';
import {HelpModule} from './components/help/help.module';
import {NgxElectronModule} from 'ngx-electron';
import {MxGraphModule} from '@bame/mx-graph';
import {DomainModelToRdfModule} from '@bame/aspect-exporter';
import {SettingDialogModule} from '@bame/settings-dialog';
import {LogService} from '@bame/shared';
import {ToastrModule} from 'ngx-toastr';
import {NotificationsModule} from './components/notifications/notifications.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BciCoreModule.forRoot({prod_environment: environment.production, core_config_url: '/assets/config/config.json'}),
    BciLayoutModule,
    BciSharedModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    AppRoutingModule,
    EditorCanvasModule,
    SettingDialogModule,
    HelpModule,
    NgxElectronModule,
    DomainModelToRdfModule,
    MxGraphModule,
    NotificationsModule,
    ToastrModule.forRoot()
  ],
  providers: [LogService],
  bootstrap: [AppComponent],
})
export class AppModule {}
