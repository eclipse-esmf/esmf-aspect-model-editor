import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {environment} from 'environments/environment';

@Injectable()
export class MxGraphAttributeService {
  private _inCollapsedMode = false;
  private _graph;
  private _editor: mxgraph.mxEditor;

  constructor() {
    if (!environment.production) {
      window['angular.mxGraphAttributeService'] = this;
    }
  }

  public get inCollapsedMode(): boolean {
    return this._inCollapsedMode;
  }

  public set inCollapsedMode(inCollapsedMode: boolean) {
    this._inCollapsedMode = inCollapsedMode;
  }

  public get graph(): mxgraph.mxGraph {
    return this._graph;
  }

  public set graph(value: mxgraph.mxGraph) {
    this._graph = value;
  }

  get editor(): mxgraph.mxEditor {
    return this._editor;
  }

  set editor(value: mxgraph.mxEditor) {
    this._editor = value;
  }
}
