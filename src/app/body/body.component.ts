import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { ReportListService } from "../report-list.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { PullDataTestService } from "../pull-data-test.service";
import { KeyValue } from "@angular/common";

import { style } from "@angular/animations";
// import { url } from "inspector";

@Component({
  selector: "app-body",
  templateUrl: "./body8.component.html",
  styleUrls: ["./body8.component.css"]
})
export class BodyComponent implements OnInit {
  constructor(
    public ReportListService: ReportListService,
    public dialog: MatDialog,
    private filterService: FiltersService,
    public pullData: PullDataTestService
  ) {}
  selected: string;
  location = "XOS Folder";
  reports;
  noFolderAlert = false;
  folderSelected = false;

  ngOnInit() {
    this.selected = "General";
    setTimeout(() => {
      document.getElementById(this.selected + "id").className =
        "sidebutton sidebuttonclicked";
      document.getElementById(this.selected + "idicon").className =
        "fa fa-circle ico";
    }, 1);
    this.reports = this.ReportListService.reports;
  }

  changeReportType(newNumb: number) {
    this.ReportListService.updateReportType(newNumb);
  }

  toggleContents(name: any) {
    for (let category in this.ReportListService.reports) {
      document.getElementById(category.toString() + "id").className =
        "sidebutton";
      document.getElementById(category.toString() + "idicon").className =
        "fa fa-circle-thin ico";

      // document.getElementById(element.toString()).style.display = "none";
    }
    this.selected = name;
    document.getElementById(name + "id").className =
      "sidebutton sidebuttonclicked";
    document.getElementById(name + "idicon").className = "fa fa-circle ico";
  }
  selectFolderXos() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(60%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "100px" };
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(FolderselectpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        this.location = data.folderID;
        this.folderSelected = true;

        document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }
  selectSavedFilter() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(80%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "150px" };
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(SavedfilterspopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        // this.location = data.folderID;
        // this.folderSelected = true;
        // document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }
  XOSExport() {
    if (!this.folderSelected) {
      this.noFolderAlert = true;
      setTimeout(() => {
        this.noFolderAlert = false;
      }, 2000);
    } else {
      // this.filterService.XOSExport(this.location);
    }
  }
  setIconStyle(repo: any) {
    let styles = {
      // "background-color": repo.value % 2 == 0 ? "skyblue" : "grey",
      // "background-image":
      //   repo.value["id"] % 2 == 0
      //     ? "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/OAK_logo.png')"
      //     : "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/NYG_logo.png')",
      "background-image":
        "linear-gradient(" +
        repo.value["colorTop"] +
        "," +
        repo.value["colorBottom"] +
        ")"
    };
    return styles;
  }

  reverseKeyOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return a.value["order"] > b.value["order"]
      ? -1
      : b.value["order"] > a.value["order"]
      ? 1
      : 0;
  };
  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["order"] < b.value["order"]
      ? -1
      : b.value["order"] < a.value["order"]
      ? 1
      : 0;
  };
}
