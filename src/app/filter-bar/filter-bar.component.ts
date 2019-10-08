import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FilterspopComponent } from "../filterspop/filterspop.component";
import { FiltersService } from "../filters.service";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { SavedfilterspopComponent } from "../savedfilterspop/savedfilterspop.component";
import { NameenterpopComponent } from "../nameenterpop/nameenterpop.component";
import { PullDataTestService } from "../pull-data-test.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-filter-bar",
  templateUrl: "./filter-bar.component.html",
  styleUrls: ["./filter-bar.component.css"]
})
export class FilterBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataTestService
  ) {}
  location = "Folder";
  playCount = "0";
  noFolderAlert = false;
  folderSelected = false;
  filterOpen = false;

  netIDToString: any;
  ngOnInit() {}
  openFilterPage(selected: string) {
    if (!this.filterOpen) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "98vw";
      dialogConfig.maxWidth = "98vw";
      dialogConfig.autoFocus = true;
      dialogConfig.position = { top: "87px" };
      dialogConfig.id = "FilterPopUp";
      dialogConfig.data = {
        title: "Filters:",
        category: "",
        filterItem: "",
        selected: selected
      };
      this.filterOpen = true;
      const dialogRef = this.dialog.open(FilterspopComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        // data=> console.log("Dialog output:", data)
        // data=> this.filterService.add(data.category,data.filterItem),
        result => {
          this.filterOpen = false;
        }
      );
    }
  }
  singleOpen(fid: string, query: any) {
    this.filterService.workingQuery = cloneDeep(query);
    var bin = cloneDeep(this.filterService.newFIDBID[fid]);
    this.filterService.workingBin = cloneDeep(bin);
    this.filterService.workingFID = cloneDeep(fid);
    for (let id in this.filterService.workingQuery) {
      this.filterService.form.controls[id].setValue(
        this.filterService.workingQuery[id]
      );
    }
    if (this.filterOpen) {
      var old = document.getElementById(
        "tier1Tab" + this.filterService.level1Selected
      );
      old.style.backgroundColor = "white";
      old.style.borderBottom = "4px solid white";
      this.filterService.level1Selected = bin;
      var newTab = document.getElementById("tier1Tab" + bin);
      newTab.style.backgroundColor = "#f2f2f2";
      newTab.style.borderBottom = "4px solid var(--lighter-blue)";
    }

    this.openFilterPage(bin);
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

  clearAll() {
    this.filterService.clearAll();
  }
  saveFilter() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.height = "auto";
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: "175px" };
    dialogConfig.data = { previousName: this.filterService.getName() };

    const dialogRef = this.dialog.open(NameenterpopComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      // if (data != undefined) {
      //   this.filterService.saveFilter(data.name);
      //   this.filterService.setName(data.name);
      // }
    });
  }
  createFilterDisplayString(fid: string, value: any) {
    console.log("CREATING DISPLAY", fid, value);
    var BID = this.filterService.newFIDBID[fid];
    var dispName = "";
    var tempFilter = { ...value };
    if (value[String(Number(BID) * -1)]) {
      for (let val in value[String(Number(BID) * -1)]) {
        dispName +=
          "," +
          this.returnlabel(
            this.filterService.pullValueMap[String(Number(BID) * -1)][
              value[String(Number(BID) * -1)][val]
            ]
          );
        if (dispName.length > 100) {
          break;
        }
      }
    }
    if (dispName.charAt(0) == ",") {
      dispName = dispName.substr(1);
    }
    delete tempFilter[String(Number(BID) * -1)];

    for (let att in tempFilter) {
      dispName += "," + this.returnlabel(this.filterService.pullAttribute[att]);
      if (dispName.length > 100) {
        break;
      }
    }
    if (dispName.charAt(0) == ",") {
      dispName = dispName.substr(1);
    }
    return dispName;
  }

  // if (value[0].length > 0) {
  //   dispName = this.returnlabel(
  //     this.filterService.newValuesOnly[value[0][0]]
  //   );
  //   for (let t4 of value[0].slice(1)) {
  //     dispName +=
  //       ", " + this.returnlabel(this.filterService.newValuesOnly[t4]);
  //   }
  // }
  // return dispName;
  //}
  createFilterDisplayString2() {
    console.log("THIS2");
    return "FILTER";
  }
  returnlabel(obj: any) {
    return obj["Label"];
  }
  removeQuery(fid: string) {
    this.filterService.removeQuery(fid);
  }
}
