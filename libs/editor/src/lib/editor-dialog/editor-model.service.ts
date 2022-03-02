/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {BaseMetaModelElement, DefaultUnit} from '@bame/meta-model';
import {BammCharacteristicInstantiator, MetaModelElementInstantiator} from '@bame/instantiator';
import {ModelService} from '@bame/rdf/services';

@Injectable({
  providedIn: 'root',
})
export class EditorModelService {
  protected metaModelElement: BaseMetaModelElement;
  protected dataChangedEventQueue = [];
  private metaModelElementSubject = new BehaviorSubject<BaseMetaModelElement>(null);
  private readOnly = false;
  private saveButtonEnabled = true;
  private bammCharacteristicInstantiator: BammCharacteristicInstantiator;

  constructor(private modelService: ModelService) {
    this.metaModelElementSubject.asObservable().subscribe(newMetaModelElement => {
      this.metaModelElement = newMetaModelElement;
    });
  }

  setMetaModelElement(metaModelElement: BaseMetaModelElement) {
    this.metaModelElement = metaModelElement;
  }

  getAspectModelUrn(): string {
    return this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn();
  }

  isSaveButtonEnabled() {
    return this.saveButtonEnabled;
  }

  isReadOnly(): boolean {
    return this.readOnly;
  }

  getMetaModelElement(): Observable<BaseMetaModelElement> {
    return this.metaModelElementSubject.asObservable();
  }

  _updateMetaModelElement(metaModelElement: BaseMetaModelElement): void {
    if (!this.bammCharacteristicInstantiator) {
      this.bammCharacteristicInstantiator = new BammCharacteristicInstantiator(
        new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, null)
      );
    }

    this.dataChangedEventQueue = [];
    this.readOnly =
      metaModelElement && this.bammCharacteristicInstantiator.getSupportedCharacteristicNames().includes(metaModelElement.aspectModelUrn);
    if (!this.readOnly && metaModelElement instanceof DefaultUnit) {
      this.readOnly = metaModelElement.isPredefined();
    }
    this.saveButtonEnabled = true;
    this.metaModelElementSubject.next(metaModelElement);
  }
}
