import { TestBed } from '@angular/core/testing';

import { PullDataTestService } from './pull-data-test.service';

describe('PullDataTestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PullDataTestService = TestBed.get(PullDataTestService);
    expect(service).toBeTruthy();
  });
});
