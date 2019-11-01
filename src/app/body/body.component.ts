import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
import { ReportListService } from "../report-list.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { PullDataService } from "../pull-data.service";
import { KeyValue } from "@angular/common";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { style } from "@angular/animations";
// import { url } from "inspector";

@Component({
  selector: "app-body",
  templateUrl: "./body.component.html",
  styleUrls: ["./body.component.css"]
})
export class BodyComponent implements OnInit {
  constructor(
    public ReportListService: ReportListService,
    public dialog: MatDialog,
    private filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router
  ) {}
  selected: string;

  portalSelected = "";
  location = "XOS Folder";
  reports;
  portals = ["club", "player", "cash"];

  noFolderAlert = false;
  folderSelected = false;

  //ON INIT SET THE SELECTED TAB ON THE LEFT TO GENERAL / CHANGE CSS
  ngOnInit() {
    this.filterService.selected = "0";
    setTimeout(() => {
      if (this.filterService.portalSelected == "") {
        document.getElementById(
          this.filterService.selected + "reportHighlightid"
        ).className = "sidebutton sidebuttonclicked";
      }
    }, 1);
    this.reports = this.ReportListService.reports;
  }

  //THIS UPDATES THE REPORT TYPE TO VIEW FROM CLICK
  changeReportType(newNumb: number) {
    var newRoute =
      this.router.url.split("/base-reports/")[0] + "/report/" + String(newNumb);
    this.router.navigate([newRoute]);
  }

  //CHANGE DISPLAY REPORTS BASED ON CLICKED REPORT
  //ALTER CSS APPROPRIATELY
  toggleContents(name: any) {
    //HAVE ALL TURN OFF
    for (let category in this.filterService.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }

    //Turn off Portals
    if (this.portalSelected != "") {
      document.getElementById(
        this.filterService.portalSelected + "id"
      ).className = "sidebutton";
    }

    for (let port in this.portals) {
      document.getElementById(this.portals[port] + "id").className =
        "sidebutton";
    }

    this.filterService.selected = name;

    //TURN SELECTED ONE ON
    document.getElementById(name + "reportHighlightid").className =
      "sidebutton sidebuttonclicked";
    if (this.filterService.reportTabs[name]["IsList"] == 0) {
      this.router.navigate(["../report/" + String(name)]);
    } else {
      this.router.navigate(["../base-reports/" + String(name)]);
    }
  }

  //THis function re high lights the previously highlighted report tab
  reportsRehighlight() {
    if (
      String(this.filterService.reportTabs[this.filterService.selected]) != "0"
    ) {
      this.filterService.selected = "0";
    }
    document.getElementById(
      this.filterService.selected + "reportHighlightid"
    ).className = "sidebutton sidebuttonclicked";
    for (let port in this.portals) {
      document.getElementById(this.portals[port] + "id").className =
        "sidebutton";
    }
  }

  //Highlight the portals and unhighlight the reports
  portalHighlight(name: any) {
    for (let category in this.filterService.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }
    for (let port in this.portals) {
      document.getElementById(this.portals[port] + "id").className =
        "sidebutton";
    }
    document.getElementById(name + "id").className =
      "sidebutton sidebuttonclicked";
    this.filterService.portalSelected = name;
    if (!this.router.url.includes(name)) {
      this.router.navigate(["../" + name]);
    }
  }

  //OPEN DIALOG FOR SELECTING THE FOLDER TO SAVE AN XOS EDIT
  selectFolderXos() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(60%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "100px" };
    dialogConfig.data = {};
    //OPEN DIALOG FOR SELECTING
    //AFTER CLOSING SET THE FOLDER SELECTED TO DISPLAY
    const dialogRef = this.dialog.open(FolderselectpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        this.location = data.folderID;
        this.folderSelected = true;

        document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }

  //IMPORT A FILTER POP UP MODAL
  selectSavedFilter() {
    //SET THE CONFIGURATION OF THE FILTER OPEN WINDOW

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "calc(80%-150px)";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "150px" };
    dialogConfig.data = {};

    //OPEN WINDOW
    const dialogRef = this.dialog.open(SavedfilterspopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data != undefined) {
        // this.location = data.folderID;
        // this.folderSelected = true;
        // document.getElementById("xosIco").className = "fa fa-close space";
      }
    });
  }

  //SEND THE FOLDER ID TO EXPORT
  //IF NO FOLDER SELECTED SHOW THE ERROR MESSAGE (RELATIVE POSITION)

  XOSExport() {
    if (!this.folderSelected) {
      this.noFolderAlert = true;
      setTimeout(() => {
        this.noFolderAlert = false;
      }, 2000);
    } else {
      this.filterService.XOSExport(this.location);
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
        "linear-gradient(" + repo["colorTop"] + "," + repo["colorBottom"] + ")"
    };
    return styles;
  }

  //RETURN THE ITEMS IN THE REVERSE OF THE ORDER SPECIFIED
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

  //RETURN THE ITEMS IN THE ORDER SPECIFIED

  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["order"] < b.value["order"]
      ? -1
      : b.value["order"] < a.value["order"]
      ? 1
      : 0;
  };
}
