import { TestBed } from "@angular/core/testing";

import { PullDataService } from "./pull-data.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("PullDataService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
  );

  it("should be created", () => {
    const service: PullDataService = TestBed.get(PullDataService);
    expect(service).toBeTruthy();
  });
});
