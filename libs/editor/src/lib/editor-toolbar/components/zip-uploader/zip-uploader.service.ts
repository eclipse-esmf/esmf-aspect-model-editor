import {Injectable} from '@angular/core';
import {ModelApiService} from '@bame/api';
import {BehaviorSubject, catchError, first, map, of, Subscription} from 'rxjs';
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
  private _hasError$ = new BehaviorSubject(false);

  get hasError$() {
    return this._hasError$.asObservable();
  }

  constructor(private modelApiService: ModelApiService, private editorService: EditorService) {}

  importZip(file: File) {
    return this.modelApiService.uploadZip(file).pipe(
      first(),
      map((response: any) => {
        this._hasError$.next(false);
        this.editorService.refreshSidebarNamespaces();
        return {
          rawResponse: response,
          result: response.correctFiles,
          incorrectFiles: response.incorrectFiles,
        };
      }),
      catchError(() => {
        this._hasError$.next(true);
        return of(null);
      })
    );
  }

  replaceFiles(files: string[]) {
    return this.modelApiService.replaceFiles(files);
  }
}
