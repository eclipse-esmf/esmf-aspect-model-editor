import {ModelService, RdfService} from '@ame/rdf/services';
import {Injectable, inject} from '@angular/core';
import {map, take} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModelSavingTrackerService {
  private modelService = inject(ModelService);
  private rdfService = inject(RdfService);
  private savedModel: string;

  private get currentModel$() {
    return this.modelService.synchronizeModelToRdf().pipe(
      take(1),
      map(() => this.rdfService.serializeModel(this.rdfService.currentRdfModel))
    );
  }

  public get isSaved$() {
    return this.currentModel$.pipe(map(currentModel => this.savedModel === currentModel));
  }

  public updateSavedModel() {
    this.currentModel$.subscribe(currentModel => (this.savedModel = currentModel));
  }
}
