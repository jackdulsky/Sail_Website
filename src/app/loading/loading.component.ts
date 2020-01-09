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
    // this.filterService.getBulkImport();

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
        console.log("LOOP 26");
        try {
          insertFilter = JSON.parse(filter[0]["JSON"]);

          this.filterService.pushDBFormat(insertFilter);
        } catch (e) {
          //console.log("INVALID GUID");
        }

        this.injectFilters();
      }, 1500);
    });
  }

  //UPLOAD JSON TO FILTER STRUCUTRE
  //CALL ROUTE AFTER
  injectFilters() {
    setTimeout(() => {
      console.log("LOOP 28");
      if (this.jsonExists) {
        var filters = this.loadJSON;
        this.filterService.loadJSON(JSON.parse(decodeURIComponent(filters)));
        for (let query in this.filterService.FIDBID) {
          this.doneloading += 1;
          this.doneChecking = false;
        }
      }
      this.filterService.setActiveClub();
      this.filterService.setActivePlayer();
      this.rerouteAfterUpload();
    }, 200);
  }
  //http://localhost:4200/loading/bcaaad3d-3395-389a-81a1-17dff1ada31b/[[%22-3%22,%223%22,[%221009876%22]],[%E2%80%9C-3%E2%80%9D,%221000%22,[%22192226%22]]]/Player,report,2676
  //http://localhost:4200/loading/bcaaad3d-3395-389a-81a1-17dff1ada31b/[[%22-3%22,%223%22,[%221009876%22]],[%E2%80%9C-3%E2%80%9D,%221000%22,[%22192226%22]]]/Player,report,2676
  //http://localhost:4200/loading/bcaaad3d-3395-389a-81a1-17dff1ada31b/[[%22-3%22,%223%22,[%221009876%22]],[%22-3%22,%221000%22,[%22192226%22]]]/Player,report,2676

  //http://localhost:4200/loading/fe554fcb-1ef9-1cc7-483d-456e3ac348c9/[[%22-3%22,%223%22,[%221009876%22]],[%22-3%22,%221000%22,[%22192226%22]]]/Player,report,2676
  //ROUTE TO APPROPRIATE PLACE
  rerouteAfterUpload() {
    if (this.reroutExists) {
      if (
        this.doneChecking ||
        this.doneloading != Object.keys(this.filterService.FIDBID).length
      ) {
        setTimeout(() => {
          console.log("LOOP 27");
          this.rerouteAfterUpload();
        }, 100);
      } else {
        try {
          this.router.navigate([
            "/" +
              this.redirectDestination
                .split(",")
                .join("/")
                .toLowerCase()
          ]);
        } catch (e) {
          this.router.navigate([""]);
        }
      }
    } else {
      try {
        this.router.navigate(["/base-report"]);
      } catch (e) {
        this.router.navigate([""]);
      }
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

//two filters:
//http://localhost:4200/home/ab717eac-a5dc-3442-44c5-2d1771b46c95/loading/ab717eac-a5dc-3442-44c5-2d1771b46c95/%5b%5b%22-3%22,%223%22,%5b%221001058%22%5d%5d,%5b%22-1%22,%221%22,%5b%221%22%5d%5d%5d/home
