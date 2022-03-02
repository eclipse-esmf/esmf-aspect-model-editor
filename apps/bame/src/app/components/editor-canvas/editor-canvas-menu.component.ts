/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, OnInit} from '@angular/core';
import {EditorService} from '@bame/editor';
import {ConfigurationService, Settings} from '@bame/settings-dialog';
import {BrowserService} from '@bame/shared';

@Component({
  selector: 'bci-editor-canvas-menu',
  templateUrl: './editor-canvas-menu.component.html',
  styleUrls: ['./editor-canvas-menu.component.scss'],
})
export class EditorCanvasMenuComponent implements OnInit {
  fitIcon: string;
  actualIcon: string;
  settings: Settings;

  constructor(
    private browserService: BrowserService,
    private editorService: EditorService,
    public configurationService: ConfigurationService
  ) {
    this.settings = configurationService.getSettings();
  }

  ngOnInit() {
    this.fitIcon = this.browserService.getAssetBasePath() + '/config/editor/img/menu/black/fit.svg';
    this.actualIcon = this.browserService.getAssetBasePath() + '/config/editor/img/menu/black/actual.svg';
  }

  zoomIn() {
    this.editorService.zoomIn();
  }

  zoomOut() {
    this.editorService.zoomOut();
  }

  fit() {
    this.editorService.fit();
  }

  actualSize() {
    this.editorService.actualSize();
  }
}
