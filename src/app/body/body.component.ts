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
import { ChangeDetectorRef } from "@angular/core";

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
    public filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) {}
  selected: string;

  portalSelected = "";
  location = "XOS Folder";
  reports;
  portals = ["club", "player", "cash"]; //, "excel"];

  noFolderAlert = false;
  folderSelected = false;

  //ON INIT SET THE SELECTED TAB ON THE LEFT TO GENERAL / CHANGE CSS
  ngOnInit() {
    // this.filterService.getBulkImport();

    this.filterService.selected = "0";

    this.initCalled();
  }
  ngAfterViewInit() {
    this.cdref.detectChanges();
  }

  initCalled() {
    if (
      document.getElementById(
        this.filterService.selected + "reportHighlightid"
      ) ||
      this.filterService.portalSelected != ""
    ) {
      if (this.filterService.portalSelected == "") {
        try {
          document.getElementById(
            this.filterService.selected + "reportHighlightid"
          ).className = "sidebutton sidebuttonclicked";
        } catch (e) {
          console.log("ERROR", e);
        }
      }
    } else {
      setTimeout(() => {
        console.log("LOOP 5", this.filterService.selected);
        this.initCalled();
      }, 100);
    }
  }

  //THIS UPDATES THE REPORT TYPE TO VIEW FROM CLICK
  changeReportType(newNumb: number) {
    var comp = this.router.url.split("/base-reports/")[0].split("/");
    if (this.portals.indexOf(comp[comp.length - 1]) != -1) {
      this.router.navigate(["report", String(newNumb)], {
        relativeTo: this.route.firstChild.firstChild
      });
    } else {
      this.router.navigate(["./report", +String(newNumb)], {
        relativeTo: this.route
      });
    }
    this.filterService.menuOpen = false;
  }

  //CHANGE DISPLAY REPORTS BASED ON CLICKED REPORT
  //ALTER CSS APPROPRIATELY
  toggleContents(name: any) {
    //HAVE ALL TURN OFF
    if (document.getElementById("exitFiltersPop")) {
      document.getElementById("exitFiltersPop").click();
    }
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
      var reportID = Object.keys(
        this.filterService.reportReportsStructure[name]
      )[0];

      this.router.navigate(["./report", String(reportID)], {
        relativeTo: this.route
      });
    } else {
      this.router.navigate(["./base-reports", String(name)], {
        relativeTo: this.route
      });
    }
    this.filterService.menuOpen = false;
  }

  //THis function re high lights the previously highlighted report tab
  reportsRehighlight() {
    if (document.getElementById("exitFiltersPop")) {
      document.getElementById("exitFiltersPop").click();
    }
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
    this.filterService.menuOpen = false;
  }

  //Highlight the portals and unhighlight the reports
  portalHighlight(name: any) {
    if (document.getElementById("exitFiltersPop")) {
      document.getElementById("exitFiltersPop").click();
    }
    for (let category in this.filterService.getReportHeaders(1)) {
      document.getElementById(
        category.toString() + "reportHighlightid"
      ).className = "sidebutton";
    }
    try {
      for (let port in this.portals) {
        document.getElementById(this.portals[port] + "id").className =
          "sidebutton";
      }
      document.getElementById(name + "id").className =
        "sidebutton sidebuttonclicked";
    } catch (e) {}
    this.filterService.portalSelected = name;
    if (!this.router.url.includes(name)) {
      // this.router.navigate(["../" + name]);
      this.router.navigate(["./" + name], {
        relativeTo: this.route
      });
    }
    this.filterService.menuOpen = false;
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
        console.log("LOOP 4");
        this.noFolderAlert = false;
      }, 2000);
    } else {
      this.filterService.XOSExport(this.location);
    }
  }
  setIconStyle(repo: any) {
    var color = this.getColorErrorHandeling(repo);
    let styles = {
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "cover",
      "background-image":
        "linear-gradient(" +
        this.filterService.shadeColor(color, 75) +
        "," +
        color +
        ")"
    };
    return styles;
  }
  getColorErrorHandeling(obj) {
    var color;
    if (obj["Color"]) {
      color = obj["Color"];
    }
    if (obj["colorBottom"]) {
      color = obj["colorBottom"];
    }
    if (obj["ColorBottom"]) {
      color = obj["ColorBottom"];
    }
    if (obj["colorTop"]) {
      color = obj["colorTop"];
    }
    if (obj["ColorTop"]) {
      color = obj["ColorTop"];
    }
    return color;
  }
  setIconImageStyle(repo: any) {
    var color = this.getColorErrorHandeling(repo);
    var icon;
    if (repo["IconUrl"]) {
      icon = repo["IconUrl"];
    } else {
      icon =
        "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png";
    }
    let styles = {
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "contain",
      "background-image": "url(" + icon + ")",
      width: "100%",
      height: "100%",
      "max-width": "130px",
      "max-height": "130px"
    };
    var c = color.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 65) {
      // pick a different colour
      styles["filter"] = "invert(1)";
    }

    return styles;
  }

  //RETURN THE ITEMS IN THE REVERSE OF THE ORDER SPECIFIED
  reverseKeyOrder = (
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number => {
    return a.value["OrderID"] > b.value["OrderID"]
      ? -1
      : b.value["OrderID"] > a.value["OrderID"]
      ? 1
      : 0;
  };

  //RETURN THE ITEMS IN THE ORDER SPECIFIED

  valueOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value["OrderID"] < b.value["OrderID"]
      ? -1
      : b.value["OrderID"] < a.value["OrderID"]
      ? 1
      : 0;
  };
}
