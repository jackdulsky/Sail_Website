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
  sub: any;
  sub2: any;
  guid: any;
  ngOnInit() {
    // this.filterService.getBulkImport();

    this.sub = this.route.params.subscribe(params => {
      this.guid = String(params["user"]);
      if (localStorage.getItem(this.guid)) {
        this.pullData.GUID = cloneDeep(this.guid);

        this.filterService.pushDBFormat(
          JSON.parse(localStorage.getItem(this.guid))
        );

        this.filterService.saveAndSend();
        localStorage.removeItem(this.guid);
      } else {
        this.injectGUID(this.guid);
      }
    });
  }

  //INSERT GUID FILTERS FROM DATABASE
  //CALL INSERTING JSON AFTER
  injectGUID(guid: string) {
    var insertFilter;
    this.sub2 = this.pullData.loadFilterFromGUID(guid).subscribe(filter => {
      setTimeout(() => {
        console.log("LOOP 25");
        var routeBool = true;
        try {
          insertFilter = JSON.parse(filter[0]["JSON"]);
          if (
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
              this.router.url.split("home/")[1].slice(36)
          ]);
        } else {
          this.pullData.GUID = cloneDeep(this.guid);
        }
      }, 1000);
    });
  }
}
