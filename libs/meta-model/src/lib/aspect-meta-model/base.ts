/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {IsNamed} from './is-named';
import {IsVersioned} from './is-versioned';
import {IsDescribed} from './is-described';
import {ExternalReference} from './external-reference';
import {AspectModelVisitor} from '@bame/mx-graph';

export interface BaseElement extends IsNamed, IsVersioned {}

export interface BaseMetaModelElement extends BaseElement, IsDescribed, ExternalReference {
  fileName: string;
  get className();
  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T;
}

export abstract class Base implements BaseMetaModelElement {
  private preferredNames: Map<string, string>;
  private descriptions: Map<string, string>;
  private see?: Array<string> = [];
  private anonymouseNode = false;
  private externalReference = false;
  public fileName: string;

  abstract get className();

  protected constructor(public metaModelVersion: string, public aspectModelUrn: string, public name: string) {
    this.preferredNames = new Map();
    this.descriptions = new Map();
  }

  isAnonymousNode(): boolean {
    return this.anonymouseNode;
  }

  setAnonymouseNode(value: boolean) {
    this.anonymouseNode = value;
  }

  addDescription(locale: string, description: string) {
    this.descriptions.set(locale, description);
  }

  getDescription(locale: string): string {
    return this.descriptions.get(locale);
  }

  removeDescription(locale: string): string {
    const descTmp = this.getDescription(locale);
    this.descriptions.delete(locale);
    return descTmp;
  }

  setSeeReferences(references: Array<string>) {
    this.see = references;
  }

  addPreferredName(locale: string, preferredName: string) {
    this.preferredNames.set(locale, preferredName);
  }

  getPreferredName(locale: string): string {
    return this.preferredNames.get(locale);
  }

  removePreferredName(locale: string): string {
    const preferredNameTmp = this.getPreferredName(locale);
    this.preferredNames.delete(locale);
    return preferredNameTmp;
  }

  getAllLocalesDescriptions(): Array<string> {
    return Array.from(this.descriptions.keys());
  }

  getAllLocalesPreferredNames(): Array<string> {
    return Array.from(this.preferredNames.keys());
  }

  getSeeReferences(): Array<string> {
    return this.see;
  }

  addSeeReference(reference: string) {
    return this.see.push(reference);
  }

  abstract accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(baseMetalModelElement: BaseMetaModelElement) {
    // This is intentional
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(baseMetalModelElement: BaseMetaModelElement) {
    // This is intentional
  }

  setExternalReference(external: boolean) {
    this.externalReference = external;
  }

  isExternalReference() {
    return this.externalReference;
  }
}
