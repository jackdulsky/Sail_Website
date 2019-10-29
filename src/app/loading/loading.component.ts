import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"]
})
export class LoadingComponent implements OnInit {
  constructor(
    public filterService: FiltersService,
    public router: Router,
    public route: ActivatedRoute,
    public pullData: PullDataService
  ) {}
  private sub: any;
  loadGUID;
  loadJSON;
  redirectDestination;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.loadGUID = String(params["guid"]);
      this.loadJSON = String(params["filterjson"]);
      this.redirectDestination = String(params["destination"]);
      console.log(
        "LOADING",
        this.loadGUID,
        this.loadJSON,
        this.redirectDestination
      );
      console.log(
        "pre-load guid filters",
        this.filterService.newDBFormat,
        this.filterService.newFIDBID,
        this.filterService.newFIDs
      );
      this.injectGUID(this.loadGUID, this.loadJSON);
      console.log(
        "post-load guid filters",
        this.filterService.newDBFormat,
        this.filterService.newFIDBID,
        this.filterService.newFIDs
      );

      console.log(
        "pre-load json filters",
        this.filterService.newDBFormat,
        this.filterService.newFIDBID,
        this.filterService.newFIDs
      );

      console.log(
        "post-load json filters",
        this.filterService.newDBFormat,
        this.filterService.newFIDBID,
        this.filterService.newFIDs
      );

      console.log("navigating to ", this.redirectDestination);
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  injectGUID(guid: string, filtersAdded: any) {
    var insertFilter;
    this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      insertFilter = JSON.parse(filter[0]["JSON"]);
      console.log("Got guid filters", insertFilter);

      this.filterService.pushDBFormat(insertFilter);
      this.injectFilters(filtersAdded);
    });
  }
  injectFilters(filters: any) {
    this.filterService.loadJSON(JSON.parse(filters));
    // this.router.navigate([this.redirectDestination]);
    // this.router.navigate(["/club/1002"]);
  }
}
//C18400E2-DE4E-A997-A09E-6D9B2F53E113
