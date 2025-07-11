import {ModelApiService, ModelData, WorkspaceStructure} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {ExporterHelper} from '@ame/migrator';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config} from '@ame/shared';
import {FileStatus} from '@ame/sidebar';
import {Injectable, inject} from '@angular/core';
import {Samm} from '@esmf/aspect-model-loader';
import {Observable, Subject, forkJoin, map, of, switchMap} from 'rxjs';
import {ModelLoaderService} from './model-loader.service';

@Injectable({
  providedIn: 'root',
})
export class ModelCheckerService {
  private modelApiService = inject(ModelApiService);
  private loadedFilesService = inject(LoadedFilesService);
  private modelLoader = inject(ModelLoaderService);

  /**
   * Gets all files from workspace and process if they have any error or missing dependencies
   *
   * @param signal used to get the current file in process
   * @returns {Observable<Record<string, FileStatus>>}
   */
  detectWorkspaceErrors(signal?: Subject<string>): Observable<Record<string, FileStatus>> {
    let namespacesStructure: WorkspaceStructure;

    const extractDependencies = (absoluteName: string, modelData: ModelData) =>
      this.modelApiService.getAspectMetaModel(modelData.aspectModelUrn).pipe(
        switchMap(rdf => this.modelLoader.parseRdfModel([rdf])),
        map(rdfModel => {
          const dependencies = RdfModelUtil.resolveExternalNamespaces(rdfModel)
            .map(external => external.replace(/urn:samm:|urn:bamm:|#/gi, ''))
            .filter(dependency => !`urn:samm:${dependency}`.includes(Samm.BASE_URI));

          const missingDependencies: string[] = [];

          for (const dependency of dependencies) {
            const [namespace, version] = dependency.split(':');
            if (!namespacesStructure[`${namespace}:${version}`]) missingDependencies.push(dependency);
          }
          const status = new FileStatus(modelData.model);
          const currentFile = this.loadedFilesService.currentLoadedFile;

          status.dependencies = dependencies;
          status.missingDependencies = missingDependencies;
          status.unknownSammVersion = rdfModel.samm.version === 'unknown';
          status.outdated = ExporterHelper.isVersionOutdated(rdfModel.samm.version, config.currentSammVersion);
          status.loaded = currentFile?.absoluteName === absoluteName;
          status.errored = status.unknownSammVersion || Boolean(status.missingDependencies.length);
          status.aspectModelUrn = modelData.aspectModelUrn;

          signal?.next(absoluteName);

          return status;
        }),
      );

    return this.modelApiService.getNamespacesStructure().pipe(
      switchMap(structure => {
        namespacesStructure = structure;
        const requests = {};
        for (const namespace in structure) {
          for (const {version, models} of structure[namespace]) {
            for (const model of models) {
              const absoluteName = `${namespace}:${version}:${model.model}`;
              requests[absoluteName] = extractDependencies(absoluteName, model);
            }
          }
        }

        return Object.keys(requests).length ? forkJoin(requests) : of({});
      }),
    );
  }

  /**
   * Gets all files from workspace
   *
   * @returns all namespaces and their file information
   */
  detectWorkspace() {
    return this.modelApiService.getNamespacesStructure().pipe(
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
