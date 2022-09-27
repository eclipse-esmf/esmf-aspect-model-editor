/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
import {DataFactory, Parser, Quad, Store, Util, Writer} from 'n3';
import {map, Observable, Subject, switchMap, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {ModelApiService} from '@ame/api';
import {DataTypeService, FileContentModel, LogService, SaveValidateErrorsCodes} from '@ame/shared';
import {Bamm} from '@ame/vocabulary';
import {RdfModel} from '../utils';

@Injectable({
  providedIn: 'root',
})
export class RdfService {
  private namedNode = DataFactory.namedNode;
  private _latestSavedRDF: string;
  private _externalRdfModels: Array<RdfModel> = [];
  private _currentRdfModel: RdfModel;

  public get externalRdfModels(): Array<RdfModel> {
    return this._externalRdfModels;
  }

  public set externalRdfModels(rdfModelsR: Array<RdfModel>) {
    this._externalRdfModels = rdfModelsR;
  }

  public get currentRdfModel(): RdfModel {
    return this._currentRdfModel;
  }

  public set currentRdfModel(rdfModel: RdfModel) {
    this._currentRdfModel = rdfModel;
  }

  constructor(private modelApiService: ModelApiService, private dataTypeService: DataTypeService, private logService: LogService) {
    if (!environment.production) {
      window['angular.rdfService'] = this;
    }
  }

  serializeModel(rdfModel: RdfModel): string {
    let rdfContent = '';
    let writer: Writer;
    const processedQuads = [];
    const metaModelNames = rdfModel.BAMMC().getMetaModelNames(false);

    try {
      writer = new Writer({
        contentType: 'text/turtle',
        prefixes: Object.assign({}, rdfModel.getPrefixes()),
        end: false,
      });
    } catch {
      return rdfContent;
    }

    rdfModel.store.forEach(
      quad => {
        if (processedQuads.find(processedQuad => processedQuad.equals(quad)) !== undefined) {
          return;
        } else if (Util.isBlankNode(quad.object) && Util.isBlankNode(quad.subject)) {
          return;
        } else if (Util.isBlankNode(quad.object)) {
          this.writeBlankNodes(quad, rdfModel, writer, metaModelNames);
        } else if (Util.isBlankNode(quad.subject)) {
          writer.blank(
            rdfModel.resolveBlankNodes(quad.subject.value).map(resolvedQuad => {
              processedQuads.push(resolvedQuad);
              return {
                predicate: resolvedQuad.predicate,
                object: resolvedQuad.object,
              };
            })
          );
        } else if (quad.object.value.startsWith(Bamm.XSD_URI)) {
          writer.addQuad(
            DataFactory.quad(quad.subject, quad.predicate, DataFactory.namedNode(quad.object.value.replace(`${Bamm.XSD_URI}#`, 'xsd:')))
          );
        } else if (quad.object.value === `${Bamm.RDF_URI}#langString`) {
          // TODO: Need to change in the future
          writer.addQuad(
            DataFactory.quad(quad.subject, quad.predicate, DataFactory.namedNode(quad.object.value.replace(`${Bamm.RDF_URI}#`, 'rdf:')))
          );
        } else if (quad.object.value.startsWith(rdfModel.BAMM().getNamespace())) {
          writer.addQuad(
            DataFactory.quad(
              quad.subject,
              quad.predicate,
              DataFactory.namedNode(quad.object.value.replace(`${rdfModel.BAMM().getNamespace()}`, `${rdfModel.BAMM().getAlias()}:`))
            )
          );
        } else if (quad.object.value === rdfModel.BAMM().RdfNil().value) {
          writer.addQuad(this.namedNode(quad.subject.value), this.namedNode(quad.predicate.value), writer.list([]));
        } else {
          writer.addQuad(quad);
        }

        processedQuads.push(quad);
      },
      null,
      null,
      null,
      null
    );

    writer.end((error, rdf) => (rdfContent = rdf));

    return rdfContent;
  }

  saveLatestModel(rdfModel: RdfModel): Observable<any> {
    if (!rdfModel) {
      this.logService.logInfo('Model is null. Skipping saving.');
      return throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
    }

    const serializedModel = this.serializeModel(rdfModel);
    if (this._latestSavedRDF && this._latestSavedRDF === serializedModel) {
      this.logService.logInfo('Model not changed. Skipping saving');
      return throwError(() => ({type: SaveValidateErrorsCodes.notChangedModel}));
    }

    return this.modelApiService.saveLatest(serializedModel).pipe(
      map(() => {
        this._latestSavedRDF = serializedModel;
        return {serializedModel, savedDate: new Date()};
      })
    );
  }

  saveModel(rdfModel: RdfModel): Observable<any> {
    const rdfContent = this.serializeModel(rdfModel);
    return this.modelApiService.saveModel(rdfContent);
  }

  loadModelLatest(): Observable<RdfModel> {
    return this.modelApiService.loadLatest().pipe(switchMap(rdf => this.loadModel(rdf)));
  }

  loadModel(rdf: string): Observable<RdfModel> {
    const subject = new Subject<RdfModel>();
    const store: Store = new Store();

    const parser = new Parser();
    parser.parse(rdf, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        this.currentRdfModel = new RdfModel(store, this.dataTypeService, prefixes);
        subject.next(this.currentRdfModel);
        subject.complete();
      }

      if (error) {
        this.logService.logInfo(`Error when parsing RDF ${error}`);
        subject.error(error);
        subject.complete();
      }
    });

    return subject;
  }

  loadExternalReferenceModelIntoStore(fileContent: FileContentModel): Observable<RdfModel> {
    const subject = new Subject<RdfModel>();
    const store: Store = new Store();
    const parser = new Parser();

    parser.parse(fileContent.aspectMetaModel, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        const rdfModel = new RdfModel(store, this.dataTypeService, prefixes);
        rdfModel.isExternalRef = true;
        rdfModel.aspectModelFileName = fileContent.fileName;
        this.externalRdfModels.push(rdfModel);
        subject.next(rdfModel);
        subject.complete();
      }

      if (error) {
        this.logService.logInfo(`Error when parsing RDF ${error}`);
        subject.error(error);
        subject.complete();
      }
    });

    return subject;
  }

  writeBlankNodes(quad: Quad, rdfModel: RdfModel, writer: Writer, metaModelNames: string[]) {
    const blankNodes = rdfModel.resolveRecursiveBlankNodes(quad.object.value, writer);
    const isBlankNode = blankNodes.some(({object}) => metaModelNames.includes(object.value));

    if (isBlankNode) {
      writer.addQuad(this.namedNode(quad.subject.value), this.namedNode(quad.predicate.value), writer.blank(blankNodes));
      return;
    }

    writer.addQuad(
      this.namedNode(quad.subject.value),
      this.namedNode(quad.predicate.value),
      writer.list(blankNodes.map(({object}) => object))
    );
  }
}
