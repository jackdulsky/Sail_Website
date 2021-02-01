import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { FiltersService } from "../filters.service";
import { Router, ActivatedRoute } from "@angular/router";
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

    public dialog: MatDialog,
    public route: ActivatedRoute,
    public router: Router,
    public pullData: PullDataService
  ) { }
  /**
   * Init component, call function in filter Service to get all the data from the DB
   */
  ngOnInit() {
    this.filterService.getBulkImport();
  }

  /**
   * Take in the string of text typed into top search bar
   * send it to pulldata to then the API and take the response and automatically open up new tab with fist
   * and only response from the search tool Taimoor wrote.
   * @param input string text to search
   */
  searching(input: string) {
    if (input.length > 3) {
      this.timeSent = cloneDeep(Date.now());
      var loopStartTime = cloneDeep(this.timeSent);
      setTimeout(() => {
        console.log("LOOP 35");
        if (loopStartTime - this.timeSent == 0) {
          this.pullData.pullSearchOptions(input).subscribe(data => {
            if (loopStartTime - this.timeSent == 0) {
              this.filterService.globalSearchResults = JSON.parse(
                String(data)
                  .split("'")
                  .join('"')
              )[0];
              this.filterService.globalSearchShowSuggestions = true;
              //code to automatically go to new url

              var urlFirst = this.filterService.globalSearchResults[
                Object.keys(this.filterService.globalSearchResults)[0]
              ];
              this.filterService.goToLink(
                this.filterService.onSiteAccessURL + urlFirst
              );
            }
          });
        }
      }, 100);
    } else {
      //set variables to empty and dont show
      this.filterService.globalSearchResults = {};
      this.filterService.globalSearchShowSuggestions = false;
    }
  }
}
