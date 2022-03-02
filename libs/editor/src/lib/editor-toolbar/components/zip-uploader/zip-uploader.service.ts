import {Injectable} from '@angular/core';
import {ModelApiService} from '@bame/api';
import {BehaviorSubject, catchError, first, of, Subscription, tap} from 'rxjs';
import {EditorService} from '../../../editor.service';

export interface Validation {
  focusNode: string;
  resultMessage: string;
  resultSeverity: string;
  value: string;
}

export interface ValidationResult {
  validationErrors: Validation[];
  aspectModelFileName: string;
  fileAlreadyDefined: boolean;
}

export interface State {
  loading: boolean;
  path: string;
  name: string;
  result: ValidationResult[];
  incorrectFiles: string[];
  loaded?: boolean;
  subscription?: Subscription;
  error?: string;
  rawResponse?: any;
}

@Injectable({providedIn: 'root'})
export class ZipUploaderService {
  public states: State[] = [];

  private _hasError$ = new BehaviorSubject(false);

  get hasError$() {
    return this._hasError$.asObservable();
  }

  constructor(private modelApiService: ModelApiService, private editorService: EditorService) {}

  tryImportZip(path: string, name: string): State {
    const state: State = this.states.find(s => s.path === path);
    if (state) {
      return state;
    }

    return this.importZip(path, name);
  }

  importZip(path: string, name: string) {
    const state: State = {
      name,
      path,
      loading: true,
      result: null,
      incorrectFiles: [],
      loaded: false,
    };

    const subscription = this.modelApiService
      .uploadZip(path)
      .pipe(
        first(),
        tap((response: any) => {
          state.rawResponse = response;
          state.result = response.correctFiles;
          state.incorrectFiles = response.incorrectFiles;
          this._hasError$.next(false);
          this.states.push(state);
          this.editorService.refreshSidebarNamespaces();
        }),
        catchError(() => {
          this._hasError$.next(true);
          return of(null);
        })
      )
      .subscribe(() => {
        subscription?.unsubscribe();
        state.loaded = true;
        state.loading = false;
      });
    state.subscription = subscription;
    return state;
  }

  replaceFiles(files: string[]) {
    return this.modelApiService.replaceFiles(files);
  }

  removeState(state: State) {
    const index = this.states.findIndex(s => s.path === state.path);
    if (index < 0) {
      return false;
    }

    this.states.splice(index, 1);
    return true;
  }
}
