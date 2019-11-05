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
  guidExists = true;
  doneloading = 0;
  doneChecking = true;
  loadJSON;
  jsonExists = true;
  redirectDestination;
  reroutExists = true;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.loadGUID = String(params["guid"]);
      if (String(this.loadGUID) == "undefined") {
        this.guidExists = false;
      }
      this.loadJSON = String(params["filterjson"]);

      if (String(this.loadJSON) == "undefined") {
        this.jsonExists = false;
      }

      this.redirectDestination = String(params["destination"]);
      if (String(this.redirectDestination) == "undefined") {
        this.reroutExists = false;
      }

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
    this.sub2 = this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      setTimeout(() => {
        try {
          insertFilter = JSON.parse(filter[0]["JSON"]);

          this.filterService.pushDBFormat(insertFilter);
        } catch (e) {
          console.log("INVALID GUID");
        }

        this.injectFilters();
      }, 1500);
    });
  }

  //UPLOAD JSON TO FILTER STRUCUTRE
  //CALL ROUTE AFTER
  injectFilters() {
    setTimeout(() => {
      if (this.jsonExists) {
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
      }
      this.rerouteAfterUpload();
    }, 200);
  }

  //ROUTE TO APPROPRIATE PLACE
  rerouteAfterUpload() {
    if (this.reroutExists) {
      if (
        this.doneChecking ||
        this.doneloading != Object.keys(this.filterService.newFIDBID).length
      ) {
        setInterval(this.rerouteAfterUpload, 100);
      } else {
        try {
          this.router.navigate([
            "/" + this.redirectDestination.split(",").join("/")
          ]);
        } catch (e) {
          this.router.navigate([""]);
        }
      }
    } else {
      this.router.navigate(["/base-report"]);
    }
  }
}
//C18400E2-DE4E-A997-A09E-6D9B2F53E113
//http://localhost:4200/loading/1A7C11F8-3CBB-95FE-27F5-5B70834093DB/%5B%5B%22-2%22,%222%22,%5B%221012%22,%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
//http://localhost:4200/loading/C18400E2-DE4E-A997-A09E-6D9B2F53E113/%5B%5B%22-2%22,%222%22,%5B%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46
//94A6AFBD-7FAD-8F71-AD16-34930D667AC4
//http://localhost:4200/loading/94A6AFBD-7FAD-8F71-AD16-34930D667AC4/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
//http://localhost:4200/loading/C18400E2-DE4E-A997-A09E-6D9B2F53E113/%5B%5B%22-2%22,%222%22,%5B%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5B%22-4%22,%224%22,%5B%222014%22%5D%5D%5D%5D/club,report,46
//http://localhost:4200/loading/C18400E2-DE4E-A997-A09E-6D9B2F53E113/[["-2","2",["1024","1026"]],["-11","10092",["10000001"]],["-4","4",["2014"]]]/club,report,46
//upload years guid testing 717FBBBF-DE7C-25AE-24D3-0004E04396B6
