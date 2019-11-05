import { Component, OnInit } from "@angular/core";
import { ReportListService } from "../report-list.service";
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
  sourceURL: string = "https://sail.raiders.com/view/";
  constructor(
    private ReportListServices: ReportListService,
    public sanitizer: DomSanitizer,
    public filterService: FiltersService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) {}
  displayURL: SafeUrl;
  private sub: any;
  sub2: any;
  viewing;
  test;

  ngOnInit() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  ngAfterViewInit() {
    this.sub = this.route.params.subscribe(params => {
      this.viewing = String(params["reportid"]); // (+) converts string 'id' to a number
      if (this.filterService.lor) {
        this.changeReport(this.viewing);
      } else {
        setTimeout(() => {
          this.changeReport(this.viewing);
        }, 800);
      }
      this.cdref.detectChanges();
      // In a real app: dispatch action to load the details here.
    });
  }

  createRDURL() {
    this.filterService.createRDURL(this.viewing);
  }

  //Changes the report based on report ID
  changeReport(input: any) {
    this.createRDURL();
  }
}
