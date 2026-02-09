import {ModelApiService, WorkspaceStructure} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config} from '@ame/shared';
import {ExporterHelper, FileStatus, SidebarStateService} from '@ame/sidebar';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RdfModel, Samm} from '@esmf/aspect-model-loader';
import {Observable, Subject, forkJoin, map, of, switchMap} from 'rxjs';
import {FileEntry, FileInformation} from './editor-toolbar';
import {ModelLoaderService} from './model-loader.service';

@Injectable({providedIn: 'root'})
export class ModelCheckerService {
  private destroyRef = inject(DestroyRef);
  private modelApiService = inject(ModelApiService);
  private loadedFilesService = inject(LoadedFilesService);
  private modelLoader = inject(ModelLoaderService);
  private sidebarStateService = inject(SidebarStateService);

  /**
   * Gets all files from workspace and process if they have any error or missing dependencies
   *
   * @param signal used to get the current file in process
   * @returns Observable<FileStatus[]>}
   */
  detectWorkspaceErrors(signal?: Subject<string>): Observable<FileStatus[]> {
    let namespacesStructure: WorkspaceStructure;

    const extractDependencies = (fileEntries: Array<FileEntry>) => {
      const namespaces = this.sidebarStateService.namespacesState.namespaces();
      const unloadedFileEntries = this.filterUnloadedFiles(fileEntries, namespaces);

      if (unloadedFileEntries.length === 0) {
        const currentLoadedFile = this.loadedFilesService.currentLoadedFile;

        Object.values(namespaces)
          .flatMap(fileStatusArray => fileStatusArray)
          .forEach(fileStatus => {
            fileStatus.loaded = fileStatus.name === currentLoadedFile.name && namespaces[currentLoadedFile.namespace]?.includes(fileStatus);
          });
      }

      return this.modelApiService.fetchAllAspectMetaModel(unloadedFileEntries).pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(fileInformation => this.parseFileModels(fileInformation)),
        map(results => results.map(result => this.createFileStatus(result, namespacesStructure, signal))),
      );
    };

    return this.modelApiService.loadNamespacesStructure().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(structure => {
        namespacesStructure = structure;
        const fileEntries: Array<FileEntry> = Object.entries(structure).flatMap(([namespace, versions]) =>
          versions.flatMap(({version, models}) =>
            models.map(model => ({
              absoluteName: `${namespace}:${version}:${model.model}`,
              fileName: model.model,
              aspectModelUrn: model.aspectModelUrn,
              modelVersion: model.version,
            })),
          ),
        );
        return extractDependencies(fileEntries);
      }),
    );
  }

  private filterUnloadedFiles(fileEntries: Array<FileEntry>, namespaces: {[key: string]: FileStatus[]}) {
    return fileEntries.filter(file => {
      const [namespace, version, name] = RdfModelUtil.splitRdfIntoChunks(file.absoluteName);
      const isLoadedInWorkspace = namespaces[`${namespace}:${version}`]?.find(n => n.name === name)?.isLoadedInWorkspace;
      return !isLoadedInWorkspace;
    });
  }

  private parseFileModels(fileInformation: FileInformation[]) {
    const parseObservables = fileInformation.map(f =>
      this.modelLoader.parseRdfModel([{rdfAspectModel: f.aspectModel, sourceLocation: ''}]).pipe(
        map(rdfModel => ({
          rdfModel,
          absoluteName: f.absoluteName,
          aspectModelUrn: f.aspectModelUrn,
          modelVersion: f.modelVersion,
          fileName: f.fileName,
        })),
      ),
    );

    return parseObservables.length > 0 ? forkJoin(parseObservables) : of([]);
  }

  private createFileStatus(result: any, namespacesStructure: WorkspaceStructure, signal?: Subject<string>) {
    const {rdfModel, absoluteName, aspectModelUrn, modelVersion, fileName} = result;

    const dependencies = this.extractDependencies(rdfModel);
    const missingDependencies = this.findMissingDependencies(dependencies, namespacesStructure);

    const status = new FileStatus(fileName);
    const currentFile = this.loadedFilesService.currentLoadedFile;

    status.dependencies = dependencies;
    status.missingDependencies = missingDependencies;
    status.sammVersion = modelVersion || 'unknown';
    status.outdated = ExporterHelper.isVersionOutdated(modelVersion, config.currentSammVersion);
    status.loaded = currentFile?.absoluteName === absoluteName;
    status.errored = status.sammVersion === 'unknown' || missingDependencies.length > 0;
    status.aspectModelUrn = aspectModelUrn;

    signal?.next(absoluteName);

    return status;
  }

  private extractDependencies(rdfModel: RdfModel): string[] {
    return RdfModelUtil.resolveExternalNamespaces(rdfModel)
      .map(external => external.replace(/urn:samm:|#/gi, ''))
      .filter(dependency => !`urn:samm:${dependency}`.includes(Samm.BASE_URI));
  }

  private findMissingDependencies(dependencies: string[], namespacesStructure: WorkspaceStructure): string[] {
    return dependencies.filter(dependency => {
      const [namespace, version] = dependency.split(':');
      return !namespacesStructure[namespace]?.some(element => element.version === version);
    });
  }

  /**
   * Gets all files from workspace
   *
   * @returns all namespaces and their file information
   */
  detectWorkspace(onlyAspectModels?: boolean) {
    return this.modelApiService.loadNamespacesStructure(onlyAspectModels).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(structure => {
        const requests = {};
        for (const namespace in structure) {
          for (const element of structure[namespace]) {
            for (const value of element.models) {
              const fileInformation = {namespace: namespace, model: value.model, version: element.version};
              requests[value.aspectModelUrn] = fileInformation;
            }
          }
        }

        return requests;
      }),
    );
  }
}
