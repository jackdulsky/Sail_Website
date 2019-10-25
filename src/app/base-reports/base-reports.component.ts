import { Component, OnInit } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { FiltersService } from "../filters.service";
import { ReportListService } from "../report-list.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-base-reports",
  templateUrl: "./base-reports.component.html",
  styleUrls: ["./base-reports.component.css"]
})
export class BaseReportsComponent implements OnInit {
  constructor(
    public body: BodyComponent,
    public ReportListService: ReportListService,
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) {}
  private sub: any;
  reportList = null;

  ngOnInit() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  ngAfterViewInit() {
    this.sub = this.route.params.subscribe(params => {
      this.reportList = String(params["base-reportsid"]); // (+) converts string 'id' to a number
      if (this.filterService.reportsNew) {
        // this.reportList = this.reportList
      } else {
        setTimeout(() => {
          // this.changeReport(this.viewing);
        }, 800);
      }
      this.cdref.detectChanges();
      // In a real app: dispatch action to load the details here.
    });
  }
}
