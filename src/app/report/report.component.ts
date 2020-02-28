import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"]
})
export class ReportComponent implements OnInit {
  typeID: number;
  temp: string;
  sourceURL: string = "http://oakcmsreports01.raiders.com/view/";
  constructor(
    public sanitizer: DomSanitizer,
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}
  /**
   * Get the report to show
   * update the variables for creating the report url
   * show the url
   */
  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      this.filterService.createRDURL(String(params["reportid"]));
      this.cdref.detectChanges();
      this.filterService.updateRDURL();
    });
  }

  //SETTING CSS OF THE iframe
  /**
   * depending on the portal this is in or not in (i.e. general or offense)
   * set the height appropriately
   */
  setIFrameStyle() {
    var h;
    if (
      this.router.url.includes("club") ||
      this.router.url.includes("player")
    ) {
      h = 250;
    } else {
      if (this.router.url.includes("cash")) {
        h = 179;
      } else {
        h = 104;
      }
    }

    let styles = {
      width: "calc(100vw - 209px)",
      height: "calc(100vh - " + String(h) + "px)"
    };

    return styles;
  }
}
