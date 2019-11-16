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
    public filterService: FiltersService,
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
        try {
          document.getElementById(
            this.filterService.selected + "reportHighlightid"
          ).className = "sidebutton sidebuttonclicked";
        } catch (e) {}
      }
    }, 1);
  }

  //THIS UPDATES THE REPORT TYPE TO VIEW FROM CLICK
  changeReportType(newNumb: number) {
    var comp = this.router.url.split("/base-reports/")[0].split("/");
    if (this.portals.indexOf(comp[comp.length - 1]) != -1) {
      console.log("ROUTE CHILDREN", this.route.firstChild.firstChild);
      // this.router.navigate(
      //   ["./" + comp[comp.length - 1], "report", +String(newNumb)],
      //   {
      //     relativeTo: this.route
      //   }
      // );
      this.router.navigate(["report", String(newNumb)], {
        relativeTo: this.route.firstChild.firstChild
      });
    } else {
      this.router.navigate(["./report", +String(newNumb)], {
        relativeTo: this.route
      });
    }
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
      // this.router.navigate(["../" + name]);
      this.router.navigate(["./" + name], {
        relativeTo: this.route
      });
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
    // let styles = {
    //   "background-repeat": "no-repeat,no-repeat",
    //   "background-position": "center",
    //   "background-size": "145px,cover",
    //   "background-image":
    //     "url(" +
    //     this.report.IconUrl +
    //     "), linear-gradient(" +
    //     this.report.Color +
    //     "," +
    //     this.filterService.shadeColor(this.report.Color, 75) +
    //     ")"
    // };

    var color;
    var icon;
    if (repo["Color"]) {
      color = repo["Color"];
    }
    if (repo["colorBottom"]) {
      color = repo["colorBottom"];
    }
    if (repo["ColorBottom"]) {
      color = repo["ColorBottom"];
    }
    if (repo["colorTop"]) {
      color = repo["colorTop"];
    }
    if (repo["ColorTop"]) {
      color = repo["ColorTop"];
    }
    if (repo["IconUrl"]) {
      icon = repo["IconUrl"];
    } else {
      icon =
        "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png";
    }
    let styles = {
      "background-repeat": "no-repeat,no-repeat",
      "background-position": "center",
      "background-size": "130px,cover",
      "background-image":
        "url(" +
        icon +
        "), linear-gradient(" +
        this.filterService.shadeColor(color, 75) +
        "," +
        color +
        ")"

      // "background-color": repo.value % 2 == 0 ? "skyblue" : "gray",
      // "background-image":
      //   repo.value["id"] % 2 == 0
      //     ? "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/OAK_logo.png')"
      //     : "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/NYG_logo.png')",
      // "background-image":
      //   "linear-gradient(" +
      //   color +
      //   "," +
      //   this.filterService.shadeColor(color, 75) +
      //   ")"
    };
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
