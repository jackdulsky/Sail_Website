import { Component, OnInit } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { FiltersService } from "../filters.service";
import { ReportListService } from "../report-list.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { PullDataService } from "../pull-data.service";

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
    public pullData: PullDataService
  ) {}

  ngOnInit() {}
}
