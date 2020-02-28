import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";
import { filter } from "minimatch";
import { TypeScriptEmitter } from "@angular/compiler";
import { catchError } from "rxjs/operators";

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

  loadGUID; //loading guid to import filters from
  guidExists = true;

  //booleans for tracking timing of operations
  doneloading: boolean;
  donePushing: boolean;
  doneChecking = true;

  //filters to load
  loadJSON;
  jsonExists = true;

  //redirection
  redirectDestination;
  reroutExists = true;

  /**
   * Get all the parameters and then start downloading and injecting
   */
  ngOnInit() {
    this.route.params.subscribe(params => {
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

      this.injectGUID(this.loadGUID);
    });
  }

  /**
   * Download the GUID filters and call insert function
   * @param guid GUID TO EXTRACT THE FILTERS FROM IN THE DB
   */
  injectGUID(guid: string) {
    this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      this.injectGUIDSubscribe(filter);
    });
  }

  /**
   * Function for looping until all information is uploaded
   * @param filter Object [{JSON:string}]
   */
  injectGUIDSubscribe(filter: any) {
    if (this.filterService.checkUploadComplete()) {
      var insertFilter;

      try {
        insertFilter = JSON.parse(filter[0]["JSON"]);

        this.donePushing = this.filterService.pushDBFormat(insertFilter);
      } catch (e) {
        console.log("INVALID GUID");
        this.donePushing = false;
      }
      this.injectFilters();
    } else {
      setTimeout(() => {
        console.log("LOOP 26");

        this.injectGUIDSubscribe(filter);
      }, 500);
    }
  }

  /**
   * UPLOAD FILTERS THROUGH THE LOADING URL VARIABLE
   * CALL REROUTE AFTER
   */
  injectFilters() {
    //check if its done uploading
    if (this.donePushing == true) {
      if (this.jsonExists) {
        var filters = this.loadJSON;
        try {
          this.doneloading = this.filterService.loadJSON(
            JSON.parse(decodeURIComponent(filters))
          );
        } catch (e) {
          console.log("COULD NOT ADD FILTERS");
          this.doneloading = false;
        }
      }
      this.filterService.setActiveClub();
      this.filterService.setActivePlayer();
      this.rerouteAfterUpload();
    } else {
      if (this.donePushing == false) {
        this.rerouteAfterUpload();
      } else {
        setTimeout(() => {
          console.log("LOOP 37");
          this.injectFilters();
        }, 200);
      }
    }
  }

  /**
   * ROUTE TO APPROPRIATE PLACE
   * Update the RD URL after 1.5 seconds
   * If there is an error then go to the default base reports route
   */
  rerouteAfterUpload() {
    if (this.doneloading == true) {
      try {
        this.router.navigate([
          "/" +
            this.redirectDestination
              .split(",")
              .join("/")
              .toLowerCase()
        ]);
        setTimeout(() => {
          this.filterService.updateRDURL();
        }, 1500);
      } catch (e) {
        this.router.navigate([""]);
      }
    } else {
      if (this.doneloading == false) {
        try {
          this.router.navigate(["/base-report"]);
        } catch (e) {
          this.router.navigate([""]);
        }
      } else {
        setTimeout(() => {
          console.log("LOOP 36");
          this.rerouteAfterUpload();
        }, 200);
      }
    }
  }
}

//SOME GUIDS FOR TESTING
//http://localhost:4200/loading/GUID/%5B%5B%22-2%22,%222%22,%5B%221012%22,%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
//http://localhost:4200/loading/GUID/%5B%5B%22-2%22,%222%22,%5B%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/club,report,46

//http://localhost:4200/loading/GUID/%5B%5B%22-2%22,%222%22,%5B%221024%22,%221026%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5D%5D/1
//http://localhost:4200/loading/GUID/%5B%5B%22-2%22,%222%22,%5B%221013%22%5D%5D,%5B%22-11%22,%2210092%22,%5B%2210000001%22%5D%5B%22-4%22,%224%22,%5B%222014%22%5D%5D%5D%5D/club,report,46
//http://localhost:4200/loading/GUID/[["-2","2",["1024","1026"]],["-11","10092",["10000001"]],["-4","4",["2014"]]]/club,report,46

//two filters:
//http://localhost:4200/home/GUID/loading/GUID/%5b%5b%22-3%22,%223%22,%5b%221001058%22%5d%5d,%5b%22-1%22,%221%22,%5b%221%22%5d%5d%5d/home
//http://localhost:4200/loading/GUID/%5b%5b%22-3%22,%223%22,%5b%221001058%22%5d%5d,%5b%22-1%22,%221%22,%5b%221%22%5d%5d%5d/home
//http://localhost:4200/loading/GUID/%5b%5b%22-3%22,%22100055%22,%5b%5d%5d%5d/home
