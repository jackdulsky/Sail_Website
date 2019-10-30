import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";
import { filter } from "minimatch";

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

  private sub2: any;
  loadGUID;
  doneloading = 0;
  doneChecking = true;
  loadJSON;
  redirectDestination;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.loadGUID = String(params["guid"]);
      this.loadJSON = String(params["filterjson"]);
      this.redirectDestination = String(params["destination"]);

      this.injectGUID(this.loadGUID, this.loadJSON);
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
  }

  //INSERT GUID FILTERS FROM DATABASE
  //CALL INSERTING JSON AFTER
  injectGUID(guid: string, filtersAdded: any) {
    var insertFilter;
    var loop = true;
    try {
    } catch (e) {
      console.log("INVALID GUID");
    }
    this.sub2 = this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      setTimeout(() => {
        try {
          insertFilter = JSON.parse(filter[0]["JSON"]);
          console.log("PRE JSON 0", this.filterService.teamPortalActiveClubID);

          this.filterService.pushDBFormat(insertFilter);
        } catch (e) {
          console.log("INVALID GUID");
        }
        console.log("PRE JSON", this.filterService.teamPortalActiveClubID);

        this.injectFilters();
      }, 1000);
    });

    // while (loop) {
    //   if (doneloading) {
    //     this.injectFilters(filtersAdded);
    //     loop = false;
    //   }
    // }
  }

  //UPLOAD JSON TO FILTER STRUCUTRE
  //CALL ROUTE AFTER
  injectFilters() {
    this.router.url;
    var filters = this.loadJSON;

    this.filterService.loadJSON(JSON.parse(filters));
    for (let query in this.filterService.newFIDBID) {
      if (Number(this.filterService.newFIDBID[query]) == -2) {
        this.filterService.teamPortalActiveClubID = cloneDeep(
          this.filterService.newFIDs[query]["2"][0]
        );

        this.filterService.teamPortalSelected = this.filterService.teamsMap[
          this.filterService.teamPortalActiveClubID
        ];
      }
      this.doneloading += 1;
      this.doneChecking = false;
    }
    var id = cloneDeep(this.filterService.teamPortalActiveClubID);
    this.rerouteAfterUpload();
  }

  //ROUTE TO APPROPRIATE PLACE
  rerouteAfterUpload() {
    if (
      this.doneChecking ||
      this.doneloading != Object.keys(this.filterService.newFIDBID).length
    ) {
      setInterval(this.rerouteAfterUpload, 100);
    } else {
      this.router.navigate([
        "/" + this.redirectDestination.split(",").join("/")
      ]);
    }
  }
}
//C18400E2-DE4E-A997-A09E-6D9B2F53E113
//http://localhost:4200/loading/1A7C11F8-3CBB-95FE-27F5-5B70834093DB/%5B%5B%22-2%22,%222%22,%5B%221012%22,%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
//http://localhost:4200/loading/C18400E2-DE4E-A997-A09E-6D9B2F53E113/%5B%5B%22-2%22,%222%22,%5B%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46
//94A6AFBD-7FAD-8F71-AD16-34930D667AC4
//http://localhost:4200/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
