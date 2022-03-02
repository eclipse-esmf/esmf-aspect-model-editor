import {Component, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {EditorService} from '@bame/editor';
import {MxGraphService} from '@bame/mx-graph';
import {Settings} from '../../model';
import {ConfigurationService} from '../../services';

@Component({
  selector: 'bci-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  settings: Settings;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.settings = this.configurationService.getSettings();
  }

  onChange() {
    this.configurationService.setSettings(this.settings);
  }

  onLayoutChange() {
    this.mxGraphService.formatShapes();
  }

  changeSaveTimeout() {
    this.onChange();
    this.editorService.refreshSaveModel();
  }

  toggleSaveTimeout(toggle: MatSlideToggleChange) {
    toggle.checked ? this.editorService.startSaveLatestModel() : this.editorService.stopSaveLatestModel();
  }

  changeValidateTimeout() {
    this.onChange();
    this.editorService.refreshValidateModel();
  }

  toggleValidateTimeout(toggle: MatSlideToggleChange) {
    toggle.checked ? this.editorService.startValidateModel() : this.editorService.stopValidateModel();
  }
}
