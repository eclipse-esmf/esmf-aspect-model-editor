import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NamespacesCacheService} from '@bame/cache';
import {EditorDialogValidators} from '@bame/editor';
import {DefaultProperty, OverWrittenProperty} from '@bame/meta-model';
import {RdfService} from '@bame/rdf/services';
import {debounceTime, map, Observable, startWith} from 'rxjs';

@Component({
  selector: 'bci-structured-value-property-field',
  templateUrl: './structured-value-property-field.component.html',
  styleUrls: ['./structured-value-property-field.component.scss'],
})
export class StructuredValuePropertyFieldComponent implements OnInit {
  @Input() public overwrittenProperty: OverWrittenProperty = null;
  @Input() public fieldControl: FormControl;

  public filteredProperties$: Observable<any>;
  public control: FormControl;

  get currentCacheFile() {
    return this.namespaceCacheService.getCurrentCachedFile();
  }

  constructor(private namespaceCacheService: NamespacesCacheService, private rdfService: RdfService) {}

  ngOnInit() {
    this.control = new FormControl(
      {
        value: this.overwrittenProperty?.property?.name || '',
        disabled: !!this.overwrittenProperty?.property?.name || this.overwrittenProperty?.property?.isExternalReference(),
      },
      [Validators.required, EditorDialogValidators.namingLowerCase]
    );
    this.filteredProperties$ = this.control.valueChanges.pipe(
      startWith([]),
      debounceTime(250),
      map(value => this.currentCacheFile.getCachedProperties().filter(property => property.name.includes(value)))
    );
  }

  unlock() {
    this.control.enable();
    this.control.patchValue('');
    this.fieldControl.setValue('');
    this.overwrittenProperty = null;
  }

  isLowerCase(value: string) {
    return /[a-z]/.test(value?.[0] || '');
  }

  isAsteriskVisible(): boolean {
    return this.control.hasValidator(Validators.required);
  }

  createNewProperty(name: string) {
    const namespace = this.rdfService.currentRdfModel.getAspectModelUrn();
    const version = this.rdfService.currentRdfModel.getMetaModelVersion();
    const newProperty = new DefaultProperty(version, namespace + name, name, null);
    this.fieldControl.setValue(newProperty);
    this.control.disable();
  }

  onSelectionChange(property: DefaultProperty) {
    this.fieldControl.setValue(property);
    this.control.disable();
  }
}
