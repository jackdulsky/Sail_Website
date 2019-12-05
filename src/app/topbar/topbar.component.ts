import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { UserService } from "../user.service";
import { User } from "../user";
import { USERS } from "../mock-users";
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
  allUsers: User[];
  timeSent;
  constructor(
    public filterService: FiltersService,
    private userService: UserService,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public route: ActivatedRoute,
    public router: Router,
    public pullData: PullDataService
  ) {}

  ngOnInit() {
    this.getAllUsers();
    this.filterService.getBulkImport();
  }
  getAllUsers(): void {
    this.userService.getUsers().subscribe(USERS => (this.allUsers = USERS));
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
    console.log("OPENING SETTINGS MENU");
  }

  searching(input: string) {
    if (input.length > 3) {
      this.timeSent = cloneDeep(Date.now());
      var loopStartTime = cloneDeep(this.timeSent);
      setTimeout(() => {
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
              var urlFirst = this.filterService.temp[
                Object.keys(this.filterService.temp)[0]
              ];
              this.filterService.goToLink(
                "http://oakcmsreports01.raiders.com:88" + urlFirst
              );
              // this.filterService.goToLink("localhost:4200" + urlFirst);
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
