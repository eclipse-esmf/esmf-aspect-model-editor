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

import {NamedNode, Quad, Quad_Object, Quad_Subject, Util} from 'n3';
import {
  Base,
  BaseMetaModelElement,
  Characteristic,
  Constraint,
  DefaultAbstractProperty,
  DefaultEntityValue,
  DefaultProperty,
  DefaultScalar,
  Entity,
  Event,
  Operation,
  OverWrittenProperty,
  Property,
  Type,
  Unit,
} from '@ame/meta-model';
import {InstantiatorService} from './instantiator.service';
import {
  AbstractPropertyInstantiator,
  BammUnitInstantiator,
  CharacteristicInstantiator,
  CodeCharacteristicInstantiator,
  CollectionCharacteristicInstantiator,
  ConstraintInstantiator,
  DurationCharacteristicInstantiator,
  EitherCharacteristicInstantiator,
  EncodingConstraintInstantiator,
  EntityInstantiator,
  EntityValueInstantiator,
  EnumerationCharacteristicInstantiator,
  EventInstantiator,
  FixedPointConstraintInstantiator,
  LanguageConstraintInstantiator,
  LengthConstraintInstantiator,
  ListCharacteristicInstantiator,
  LocaleConstraintInstantiator,
  MeasurementCharacteristicInstantiator,
  OperationInstantiator,
  PredefinedPropertyInstantiator,
  PropertyInstantiator,
  QuantifiableCharacteristicInstantiator,
  RangeConstraintInstantiator,
  RegularExpressionConstraintInstantiator,
  SetCharacteristicInstantiator,
  SingleEntityInstantiator,
  SortedSetCharacteristicInstantiator,
  StateCharacteristicInstantiator,
  StructuredValueCharacteristicInstantiator,
  TimeSeriesCharacteristicInstantiator,
  TraitCharacteristicInstantiator,
} from './instantiators';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {InstantiatorListElement, RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {NotificationsService} from '@ame/shared';
import {PredefinedEntityInstantiator} from './instantiators/bamme-predefined-entity-instantiator';

export class MetaModelElementInstantiator {
  private characteristicInstantiator: CharacteristicInstantiator;
  private constraintInstantiator: ConstraintInstantiator;
  private queueInstantiators: Function[] = [];

  public bamm = this.rdfModel.BAMM();
  public bammc = this.rdfModel.BAMMC();
  public bamme = this.rdfModel.BAMME();
  public bammu = this.rdfModel.BAMMU();
  public isIsolated = false;

  constructor(
    public rdfModel: RdfModel,
    public cachedFile: CachedFile,
    public fileName?: string,
    public instantiatorService?: InstantiatorService,
    public namespaceCacheService?: NamespacesCacheService,
    public recursiveModelElements?: Map<string, Array<BaseMetaModelElement>>,
    public notificationsService?: NotificationsService
  ) {
    this.characteristicInstantiator = this.setupCharacteristicInstantiators();
    this.constraintInstantiator = this.setupConstraintInstantiators();
  }

  addInstantiatorFunctionToQueue(event: Function) {
    this.queueInstantiators.unshift(event);
  }

  executeQueueInstantiators() {
    while (this.queueInstantiators.length) {
      const event = this.queueInstantiators.pop();
      if (typeof event === 'function') {
        event();
      }
    }
  }

  getProperties(subject: Quad_Subject, predicate: NamedNode): Array<OverWrittenProperty> {
    const properties: Array<OverWrittenProperty> = [];
    this.rdfModel.store.getQuads(subject, predicate, null, null).forEach(propertyQuad => {
      const elements = this.rdfModel.getListElements(propertyQuad.object);

      for (const element of elements) {
        this.getProperty(element, (property: OverWrittenProperty) => {
          properties.push(property);
        });
      }
    });

    return properties;
  }

  getProperty(element: InstantiatorListElement, callback: Function) {
    const propertyInstantiator = new PropertyInstantiator(this);
    const abstractPropertyInstantiator = new AbstractPropertyInstantiator(this);
    const predefinedPropertyInstantiator = new PredefinedPropertyInstantiator(this);
    const isPredefined = !!predefinedPropertyInstantiator.propertyInstances[element.quad.value];
    let quads: Quad[];

    if (isPredefined) {
      return callback({property: predefinedPropertyInstantiator.propertyInstances[element.quad.value](), keys: {}});
    }

    if (Util.isBlankNode(element.quad)) {
      const firstQuad = this.rdfModel.store.getQuads(element.quad, null, null, null).find(e => this.bamm.isRdfFirst(e.predicate.value));
      quads = firstQuad ? this.rdfModel.store.getQuads(firstQuad.object, null, null, null) : [];
      element.quad = firstQuad.object;
    } else {
      quads = this.rdfModel.store.getQuads(element.quad, null, null, null);
    }

    const hasAbstractProperties = quads.some(quad => this.bamm.isAbstractPropertyElement(quad.object.value));

    if (quads.length) {
      return hasAbstractProperties
        ? callback(abstractPropertyInstantiator.createAbstractProperty(element))
        : callback(propertyInstantiator.createProperty(element));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Property>(element.quad.value);
    if (extReference) {
      extReference.setExternalReference(true);
      return callback({property: extReference, keys: propertyInstantiator.resolveOverwrittenKeys(element)});
    }

    this.addInstantiatorFunctionToQueue(() => {
      const {externalReference} = this.getExternalElement<Property>(element.quad);
      callback({property: externalReference, keys: propertyInstantiator.resolveOverwrittenKeys(element)});
    });
  }

  getOperations(subject: Quad_Subject, predicate: NamedNode): Array<Operation> {
    const operations: Array<Operation> = [];
    this.rdfModel.store.getQuads(subject, predicate, null, null).forEach(propertyQuad => {
      const elements = this.rdfModel.getListElements(propertyQuad.object);

      for (const element of elements) {
        this.getOperation(element, (operation: Operation) => {
          operations.push(operation);
        });
      }
    });

    return operations;
  }

  getOperation(element: InstantiatorListElement, callback: Function) {
    const operationInstantiator = new OperationInstantiator(this);

    if (this.rdfModel.store.getQuads(element.quad, null, null, null).length) {
      return callback(operationInstantiator.createOperation(element));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Operation>(element.quad.value);
    if (extReference) {
      extReference.setExternalReference(true);
      return callback(element);
    }

    this.addInstantiatorFunctionToQueue(() => {
      const {externalReference} = this.getExternalElement<Operation>(element.quad);
      callback(externalReference);
    });
  }

  getEvents(subject: Quad_Subject, predicate: NamedNode): Array<Event> {
    const events: Array<Event> = [];
    this.rdfModel.store.getQuads(subject, predicate, null, null).forEach(propertyQuad => {
      const elements = this.rdfModel.getListElements(propertyQuad.object);

      for (const element of elements) {
        this.getEvent(element, (event: Event) => {
          events.push(event);
        });
      }
    });

    return events;
  }

  getEvent(element: InstantiatorListElement, callback: Function) {
    const eventInstantiator = new EventInstantiator(this);

    if (this.rdfModel.store.getQuads(element.quad, null, null, null).length) {
      return callback(eventInstantiator.createEvent(element));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Event>(element.quad.value);
    if (extReference) {
      extReference.setExternalReference(true);
      return callback(element);
    }

    this.addInstantiatorFunctionToQueue(() => {
      const {externalReference} = this.getExternalElement<Event>(element.quad);
      callback(externalReference);
    });
  }

  loadOutputProperty(quad: Quad, _isPropertyExtRef: boolean, callback: Function): void {
    if (this.rdfModel.store.getQuads(quad.object, null, null, null).length) {
      const property = new PropertyInstantiator(this).createProperty({quad: quad.object, blankNode: false}).property;
      return callback(property);
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Operation>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      if (typeof callback === 'function') {
        return callback(extReference);
      }
    }

    this.addCallbackToQueue(quad, callback);
  }

  loadCharacteristic(quad: Quad, isPropertyExtRef: boolean, callback: Function): void {
    if (
      this.rdfModel.store.getQuads(quad.object, null, null, null).length ||
      RdfModelUtil.isPredefinedCharacteristic(quad.object.value, this.rdfModel.BAMMC())
    ) {
      return callback(this.characteristicInstantiator.create(quad, isPropertyExtRef));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Characteristic>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      if (typeof callback === 'function') {
        return callback(extReference);
      }
    }

    this.addCallbackToQueue(quad, callback);
  }

  loadConstraint(quad: Quad, callback: Function): void {
    if (this.rdfModel.store.getQuads(quad.object, null, null, null).length) {
      return callback(this.constraintInstantiator.create(quad));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Constraint>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      if (typeof callback === 'function') {
        return callback(extReference);
      }
    }

    this.addCallbackToQueue(quad, callback);
  }

  loadEntityValue<T>(quad: Quad, callback: Function) {
    const entityValueQuads = this.rdfModel.store.getQuads(quad.object, null, null, null);
    if (entityValueQuads.length) {
      return callback(new EntityValueInstantiator(this).createEntityValue(entityValueQuads, quad.object));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<DefaultEntityValue>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      if (typeof callback === 'function') {
        return callback(extReference);
      }
    }

    this.addCallbackToQueue<T>(quad, callback);
  }

  private addCallbackToQueue<T>(quad: Quad, callback: Function) {
    this.addInstantiatorFunctionToQueue(() => {
      const {externalReference} = this.getExternalElement<T>(quad.object);
      if (typeof callback === 'function') {
        callback(externalReference);
      }
    });
  }

  getDataType(quad: Quad, callback: Function): Type {
    // Not every characteristic has a dataType e.g. the Either characteristic.
    // Thus, null is a valid value and needs to be considered.
    if (!quad) {
      return callback(null);
    }

    if (Util.isBlankNode(quad.object)) {
      quad = this.rdfModel.resolveBlankNodes(quad.object.value).shift();
    }

    if (quad.object.value === this.bamme.TimeSeriesEntity) {
      const predefinedEntityInstantiator = new PredefinedEntityInstantiator(this);
      return callback(predefinedEntityInstantiator.entityInstances[this.bamme.TimeSeriesEntity]());
    }

    const typeQuad = quad ? RdfModelUtil.getEffectiveType(quad, this.rdfModel) : null;
    if (!typeQuad) {
      return callback(null);
    }

    const quadEntity = this.rdfModel.store.getQuads(typeQuad.object, null, null, null);
    if (quadEntity && quadEntity.length > 0 && RdfModelUtil.isEntity(quadEntity[0], this.rdfModel)) {
      const entity = new EntityInstantiator(this).createEntity(quadEntity);
      return callback(this.cachedFile.resolveElement(entity, this.isIsolated));
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Entity>(typeQuad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      return callback(extReference);
    }

    if (
      !quadEntity.length &&
      !typeQuad.object.value.startsWith('http://www.w3.org/2001/XMLSchema') &&
      !typeQuad.object.value.startsWith('http://www.w3.org/1999/02/22-rdf-syntax-ns')
    ) {
      this.addInstantiatorFunctionToQueue(() => {
        const {externalReference} = this.getExternalElement(typeQuad.object);
        return callback(externalReference);
      });
    }

    const quadPropertyRefined = this.rdfModel.store.getQuads(quad.subject, this.bamm.ExtendsProperty(), null, null);
    if (quadPropertyRefined && quadPropertyRefined.length > 0) {
      const entity = new EntityInstantiator(this).createEntity(quadPropertyRefined);
      return callback(this.cachedFile.resolveElement(entity, this.isIsolated));
    }

    return callback(new DefaultScalar(typeQuad.object.value));
  }

  getUnit(quad: Quad, callback: Function): void {
    if (this.rdfModel.store.getQuads(quad.object, null, null, null).length) {
      const unit = new BammUnitInstantiator(this).createUnit(quad.object.value);
      return callback(unit);
    }

    const extReference = this.namespaceCacheService.findElementOnExtReference<Unit>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      if (typeof callback === 'function') {
        return callback(extReference);
      }
    }

    this.addCallbackToQueue(quad, callback);
  }

  getCharacteristic(quad: Quad): Characteristic {
    return this.characteristicInstantiator.create(quad);
  }

  getConstraint(quad: Quad): Characteristic {
    return this.constraintInstantiator.create(quad);
  }

  public setUniqueElementName(modelElement: BaseMetaModelElement, name?: string) {
    name = name || `${modelElement.className}`.replace('Default', '');

    if (modelElement instanceof DefaultProperty || modelElement instanceof DefaultAbstractProperty) {
      name = name[0].toLowerCase() + name.substring(1);
    }

    let counter = 1;
    let tmpAspectModelUrn: string = null;
    let tmpName: string = null;
    do {
      tmpName = `${name}${counter++}`;
      tmpAspectModelUrn = `${this.rdfModel.getAspectModelUrn()}${tmpName}`;
    } while (this.cachedFile.getCachedElement<BaseMetaModelElement>(tmpAspectModelUrn));
    modelElement.aspectModelUrn = tmpAspectModelUrn;
    modelElement.name = tmpName;
  }

  initBaseProperties(quads: Array<Quad>, metaModelElement: BaseMetaModelElement, rdfModel: RdfModel) {
    let typeQuad: Quad;

    quads.forEach(quad => {
      if (this.bamm.isNameProperty(quad.predicate.value)) {
        metaModelElement.name = quad.object.value;
      } else if (this.bamm.isDescriptionProperty(quad.predicate.value)) {
        this.addDescription(quad, metaModelElement);
      } else if (this.bamm.isPreferredNameProperty(quad.predicate.value)) {
        this.addPreferredName(quad, metaModelElement);
      } else if (this.bamm.isSeeProperty(quad.predicate.value)) {
        metaModelElement.addSeeReference(quad.object.value);
      } else if (quad.predicate.value === this.bamm.RdfType().value) {
        typeQuad = quad;
      }
    });

    if (!metaModelElement.name) {
      this.setUniqueElementName(metaModelElement);
    }

    if (typeQuad && !Util.isBlankNode(typeQuad.subject)) {
      (<Base>metaModelElement).aspectModelUrn = `${typeQuad.subject.value}`;
    } else {
      (<Base>metaModelElement).aspectModelUrn = `${this.rdfModel.getAspectModelUrn()}${metaModelElement.name}`;
    }

    if (!(<Base>metaModelElement).metaModelVersion) {
      (<Base>metaModelElement).metaModelVersion = rdfModel.BAMM().version;
    }
  }

  /**
   * After instantiating the file where the element is found, the element is returned
   * along with its rdfModel
   *
   * @param quad - NameNode, Quad_Object, Quad_Subject
   * @returns the external rdfModel and the instantiated model
   */
  getExternalElement<T>(quad: NamedNode | Quad_Object, skipSetExternal = false): {externalRdfModel: RdfModel; externalReference: T} {
    let externalReference = this.namespaceCacheService.findElementOnExtReference<T>(quad.value);
    const externalRdfModel = this.getRdfModelByElement(quad);

    if (externalReference) {
      return {externalRdfModel, externalReference};
    }

    if (externalRdfModel) {
      const fileName = externalRdfModel.aspectModelFileName;
      const cachedFile = this.namespaceCacheService.addFile(externalRdfModel.getAspectModelUrn(), fileName);
      this.instantiatorService.instantiateFile(externalRdfModel, cachedFile, fileName);
    }

    const predefinedUnit = new BammUnitInstantiator(this).createPredefinedUnit(quad.value);

    if (predefinedUnit) {
      // Is not assignable to T
      externalReference = <any>predefinedUnit;
    } else {
      externalReference = this.namespaceCacheService.findElementOnExtReference<T>(quad.value);
    }

    if (!skipSetExternal && !externalReference) {
      this.notificationsService.error(
        'Error when loading the Aspect model. The Aspect model contains an external reference that is not included in the' +
          ' namespace file structure or is invalid. Please also check the file structure of your local model folder with ' +
          'the defined standard in the documentation',
        `The following URN cannot be loaded: ${quad.value}`,
        null,
        5000
      );
      return {externalRdfModel: null, externalReference: null};
    }

    skipSetExternal || (externalReference as any).setExternalReference(true);
    return {externalRdfModel, externalReference};
  }

  getRdfModelByElement(quad: NamedNode | Quad_Object): RdfModel {
    return this.instantiatorService.rdfService.externalRdfModels.find(
      (extRdfModel: RdfModel) => extRdfModel.store.getQuads(quad, null, null, null).length
    );
  }

  private addDescription(quad: Quad, metaModelElement: BaseMetaModelElement) {
    if (this.rdfModel.getLocale(quad)) {
      metaModelElement.addDescription(this.rdfModel.getLocale(quad), quad.object.value);
    } else {
      metaModelElement.addDescription('en', quad.object.value);
    }
  }

  private addPreferredName(quad: Quad, metaModelElement: BaseMetaModelElement) {
    if (this.rdfModel.getLocale(quad)) {
      metaModelElement.addPreferredName(this.rdfModel.getLocale(quad), quad.object.value);
    } else {
      metaModelElement.addPreferredName('en', quad.object.value);
    }
  }

  private setupCharacteristicInstantiators(): CharacteristicInstantiator {
    const characteristicInstantiator = new CharacteristicInstantiator(this);
    const durationCharacteristicInstantiator = new DurationCharacteristicInstantiator(this, characteristicInstantiator);
    const enumerationCharacteristicInstantiator = new EnumerationCharacteristicInstantiator(this, durationCharacteristicInstantiator);
    const measurementCharacteristicInstantiator = new MeasurementCharacteristicInstantiator(this, enumerationCharacteristicInstantiator);
    const quantifiableCharacteristicInstantiator = new QuantifiableCharacteristicInstantiator(this, measurementCharacteristicInstantiator);
    const eitherCharacteristicInstantiator = new EitherCharacteristicInstantiator(this, quantifiableCharacteristicInstantiator);
    const collectionCharacteristicInstantiator = new CollectionCharacteristicInstantiator(this, eitherCharacteristicInstantiator);
    const structuredValueCharInstantiator = new StructuredValueCharacteristicInstantiator(this, collectionCharacteristicInstantiator);
    const listCharacteristicInstantiator = new ListCharacteristicInstantiator(this, structuredValueCharInstantiator);
    const singleEntityInstantiator = new SingleEntityInstantiator(this, listCharacteristicInstantiator);
    const stateCharacteristicInstantiator = new StateCharacteristicInstantiator(this, singleEntityInstantiator);
    const codeCharacteristicInstantiator = new CodeCharacteristicInstantiator(this, stateCharacteristicInstantiator);
    const sortedSetCharacteristicInstantiator = new SortedSetCharacteristicInstantiator(this, codeCharacteristicInstantiator);
    const setCharacteristicInstantiator = new SetCharacteristicInstantiator(this, sortedSetCharacteristicInstantiator);
    const timeSeriesCharacteristicInstantiator = new TimeSeriesCharacteristicInstantiator(this, setCharacteristicInstantiator);
    return new TraitCharacteristicInstantiator(this, timeSeriesCharacteristicInstantiator);
  }

  private setupConstraintInstantiators(): ConstraintInstantiator {
    const constraintInstantiator = new ConstraintInstantiator(this);
    const rangeConstraintInstantiator = new RangeConstraintInstantiator(this, constraintInstantiator);
    const regularExpressionConstraintInstantiator = new RegularExpressionConstraintInstantiator(this, rangeConstraintInstantiator);
    const languageConstraintInstantiator = new LanguageConstraintInstantiator(this, regularExpressionConstraintInstantiator);
    const lengthConstraintInstantiator = new LengthConstraintInstantiator(this, languageConstraintInstantiator);
    const localeConstraintInstantiator = new LocaleConstraintInstantiator(this, lengthConstraintInstantiator);
    const fixedPointConstraintInstantiator = new FixedPointConstraintInstantiator(this, localeConstraintInstantiator);
    return new EncodingConstraintInstantiator(this, fixedPointConstraintInstantiator);
  }
}
