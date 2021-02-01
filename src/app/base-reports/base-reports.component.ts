import { Component, OnInit } from "@angular/core";
import { BodyComponent } from "../body/body.component";
import { FiltersService } from "../filters.service";


import { MatDialog } from "@angular/material";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-base-reports",
  templateUrl: "./base-reports.component.html",
  styleUrls: ["./base-reports.component.css"]
})
export class BaseReportsComponent implements OnInit {
  constructor(
    public body: BodyComponent,
    public dialog: MatDialog,
    public filterService: FiltersService,
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router,
    public cdref: ChangeDetectorRef
  ) { }

  //number of report list viewing
  reportList = null;

  /**
   * Init function that will set the selected report list based on the parameter
   */
  ngOnInit() {
    if (this.router.url.includes("/base-reports/")) {
      var param = this.router.url.split("/base-reports/")[1];
      this.filterService.selected = param;
      this.reportList = param;

    }
  }

  /**
   * Change the router outlet internal to this browser instance to view the report clicked on
   * @param num number of report clicked on
   *            
   */
  changeReportType(num: any) {
    try {
      document.getElementById("fullScreenButton").className = "fullScreen";
    } catch (e) { }

    this.body.changeReportType(num);
  }

  /**
   * Handel if a new tab should be opened on ctrl click with the report
   * Or if the website should reroute
   * @param e click event
   * @param name number of the report to show
   */
  reportClicked(e: any, name: any) {
    if (e.ctrlKey) {
      var url = this.router.url.split("/");
      var number = name;
      var base = "report";
      this.filterService.goToLink(
        this.filterService.onSiteAccessURL +
        "/" +
        url[1] +
        "/" +
        url[2] +
        "/" +
        url[3] +
        "/" +
        base +
        "/" +
        number
      );
    } else {
      this.changeReportType(name);
    }
  }

  /**
   * This is for variability in the keys passed from the data base since they are sometimes not case sensitive in the DB
   * From a give object, extract the color given it may be 
   * under the key of 'Color','color','ColorTop','colorTop','ColorBottom','colorBottom'
   * @param obj Object with color attributes
   */
  getColorErrorHandeling(obj) {
    var color;
    if (obj["Color"]) {
      color = obj["Color"];
    }
    if (obj["color"]) {
      color = obj["color"];
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
  /**
   * This is to generate the styling of the icon based on the parameters passed in
   * @param repo Report Object
   */
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
  /**
   * Generate the backgorund image based on information passed down
   * @param repo report object
   */
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

    //This inverts the color depending on the illumination of the color of the background
    var c = color.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 65) {//Threshold of 65 was chosen, you cn see how otehr cutoffs work by playing around on the report uploader where its the same threshold
      // pick a different colour
      styles["filter"] = "invert(1)";
    }

    return styles;
  }
}
