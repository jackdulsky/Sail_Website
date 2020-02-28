import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FiltersService } from "../filters.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  constructor(
    public filterService: FiltersService,

    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  guid: any;
  /**
   * get the param for the guid from the url
   * If it exists in local storage upload the filter json
   * save and send to associate the new guid with the filters
   */
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.guid = String(params["user"]);
      //if json for the this guid exist in local storage upload it
      if (localStorage.getItem(this.guid)) {
        this.pullData.GUID = cloneDeep(this.guid);

        this.filterService.pushDBFormat(
          JSON.parse(localStorage.getItem(this.guid))
        );

        this.filterService.saveAndSend();
        localStorage.removeItem(this.guid);
      } else {
        //else download save and reroute to new guid
        this.injectGUID(this.guid);
      }
    });
  }

  /**
   * Download GUID FILTERS FROM DATABASE
   * CALL function to save and reroute
   * @param guid GUID
   */
  injectGUID(guid: string) {
    this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      this.injectSubscribeFunction(filter);
    });
  }
  /**
   * take json of filters and save in local storage with the future json
   * rerout after with new guid so on init it will just upload
   * @param filter json of filters
   */
  injectSubscribeFunction(filter: any) {
    if (this.filterService.checkUploadComplete()) {
      var insertFilter;
      var routeBool = true;
      try {
        insertFilter = JSON.parse(filter[0]["JSON"]);
        if (
          //make sure upload guid and current guid are different and that uploading filters is non empty
          JSON.stringify(insertFilter) != JSON.stringify({}) &&
          this.guid != this.pullData.GUID
        ) {
          localStorage.setItem(
            this.pullData.GUID,
            JSON.stringify(insertFilter)
          );
        } else {
          routeBool = false;
        }
      } catch (e) {
        routeBool = false;
      }
      if (routeBool) {
        this.router.navigate([
          this.router.url.split("home/")[0] +
            "home/" +
            this.pullData.GUID +
            this.router.url.split("home/")[1].slice(36) //36 for length of guid b2812d87-e8c1-cde6-a2b3-2b7719347dd7
        ]);
      } else {
        this.pullData.GUID = cloneDeep(this.guid);
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 25");
        this.injectSubscribeFunction(filter);
      }, 350);
    }
  }
}
