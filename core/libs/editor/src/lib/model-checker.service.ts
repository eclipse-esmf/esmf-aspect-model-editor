import {ModelApiService, ModelData, WorkspaceStructure} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config} from '@ame/shared';
import {ExporterHelper, FileStatus, SidebarStateService} from '@ame/sidebar';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Samm} from '@esmf/aspect-model-loader';
import {Observable, Subject, forkJoin, map, of, switchMap} from 'rxjs';
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
   * @returns {Observable<Record<string, FileStatus>>}
   */
  detectWorkspaceErrors(signal?: Subject<string>): Observable<Record<string, FileStatus>> {
    let namespacesStructure: WorkspaceStructure;
    const extractDependencies = (absoluteName: string, modelData: ModelData, modelVersion: string) => {
      const namespaces = this.sidebarStateService.namespacesState.namespaces();
      const chunks = RdfModelUtil.splitRdfIntoChunks(absoluteName);
      const namespace = namespaces[`${chunks[0]}:${chunks[1]}`];
      if (namespace?.find(n => n.name === chunks[2])?.isLoadedInWorkspace) {
        return null;
      }

      return this.modelApiService.fetchAspectMetaModel(modelData.aspectModelUrn).pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(rdf => this.modelLoader.parseRdfModel([rdf])),
        map(rdfModel => {
          const dependencies = RdfModelUtil.resolveExternalNamespaces(rdfModel)
            .map(external => external.replace(/urn:samm:|#/gi, ''))
            .filter(dependency => !`urn:samm:${dependency}`.includes(Samm.BASE_URI));

          const missingDependencies: string[] = [];

          for (const dependency of dependencies) {
            const [namespace, version] = dependency.split(':');
            const namespaceElements = namespacesStructure[namespace];

            const versionExists = namespaceElements?.some(element => element.version === version);

            if (!versionExists) {
              missingDependencies.push(dependency);
            }
          }

          const status = new FileStatus(modelData.model);
          const currentFile = this.loadedFilesService.currentLoadedFile;

          status.dependencies = dependencies;
          status.missingDependencies = missingDependencies;
          status.sammVersion = modelVersion || 'unknown';
          status.outdated = ExporterHelper.isVersionOutdated(modelVersion, config.currentSammVersion);
          status.loaded = currentFile?.absoluteName === absoluteName;
          status.errored = status.sammVersion === 'unknown' || Boolean(status.missingDependencies.length);
          status.aspectModelUrn = modelData.aspectModelUrn;

          signal?.next(absoluteName);

          return status;
        }),
      );
    };

    return this.modelApiService.loadNamespacesStructure().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(structure => {
        namespacesStructure = structure;
        const requests = {};
        for (const namespace in structure) {
          for (const {version, models} of structure[namespace]) {
            for (const model of models) {
              const absoluteName = `${namespace}:${version}:${model.model}`;
              requests[absoluteName] = extractDependencies(absoluteName, model, model.version);
            }
          }
        }

        const entries = Object.fromEntries(
          Object.entries(requests).filter((entry): entry is [string, Observable<FileStatus>] => entry[1] !== null),
        );

        return Object.keys(entries).length ? forkJoin(entries) : of({} as Record<string, FileStatus>);
      }),
    );
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
