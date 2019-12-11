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
// import { PlayerComponent } from "../player/player.component";

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
    public cdref: ChangeDetectorRef // public player: PlayerComponent
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
      if (this.filterService.reportReportsStructure) {
      } else {
        setTimeout(() => {}, 800);
      }
      //this.cdref.detectChanges();
      // In a real app: dispatch action to load the details here.
    });
  }

  changeReportType(num: any) {
    try {
      document.getElementById("fullScreenButton").className = "fullScreen";
    } catch (e) {}

    this.filterService.clickedReport = true;
    this.body.changeReportType(num);
  }
}
