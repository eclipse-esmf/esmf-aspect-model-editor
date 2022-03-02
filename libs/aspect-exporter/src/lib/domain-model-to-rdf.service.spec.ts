import {TestBed} from '@angular/core/testing';
import {expect, describe, it} from '@jest/globals';

import {DomainModelToRdfService} from './domain-model-to-rdf.service';

describe('DomainModelToRdfService', () => {
  let service: DomainModelToRdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainModelToRdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
