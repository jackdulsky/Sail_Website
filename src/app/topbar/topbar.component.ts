import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";

import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { PullDataService } from "../pull-data.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"]
})
export class TopbarComponent implements OnInit {
  timeSent;
  menuOpen = false;
  constructor(
    public filterService: FiltersService,

    private modalService: NgbModal,
    public dialog: MatDialog,
    public route: ActivatedRoute,
    public router: Router,
    public pullData: PullDataService
  ) {}

  ngOnInit() {
    this.filterService.getBulkImport();
  }

  openFolderSelect() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "60%";
    dialogConfig.autoFocus = true;
    // dialogConfig.position ={'top': '0', 'left':'0'};
    const dialogRef = this.dialog.open(FolderselectpopComponent, dialogConfig);
  }
  openReportUpload() {
    this.router.navigate(["../../report-upload"]);
  }
  openSettingsMenu() {
    //console.log("OPENING SETTINGS MENU");
  }

  searching(input: string) {
    if (input.length > 3) {
      this.timeSent = cloneDeep(Date.now());
      var loopStartTime = cloneDeep(this.timeSent);
      setTimeout(() => {
        console.log("LOOP 35");
        if (loopStartTime - this.timeSent == 0) {
          this.pullData.pullSearchOptions(input).subscribe(data => {
            if (loopStartTime - this.timeSent == 0) {
              this.filterService.temp = JSON.parse(
                String(data)
                  .split("'")
                  .join('"')
              )[0];
              this.filterService.globalSearchShowSuggestions = true;
              //code to automatically go to new url
              //comment out to not route
              var urlFirst = this.filterService.temp[
                Object.keys(this.filterService.temp)[0]
              ];
              this.filterService.goToLink(
                "http://oakcmsreports01.raiders.com:88" + urlFirst
              );
            }
          });
        }
      }, 100);
    } else {
      this.filterService.temp = {};
      this.filterService.globalSearchShowSuggestions = false;
    }
  }
}
