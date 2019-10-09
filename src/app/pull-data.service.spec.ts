import { TestBed } from "@angular/core/testing";

import { PullDataService } from "./pull-data.service";

describe("PullDataService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PullDataService = TestBed.get(PullDataService);
    expect(service).toBeTruthy();
  });
});
