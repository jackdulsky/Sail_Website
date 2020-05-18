import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import { DomSanitizer } from "@angular/platform-browser";
import { icons } from "../constants";
@Component({
  selector: "app-report-upload",
  templateUrl: "./report-upload.component.html",
  styleUrls: ["./report-upload.component.css"]
})
export class ReportUploadComponent implements OnInit {
  //This is the template of data to send up for a new report
  template = {
    Label: "",
    IsTab: 0,
    IsList: 0,
    LocationID: 1,

    ParentTabID: -1,
    ViewID: "",
    IconUrl:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",
    Color: "#FFFFFF"
  };

  //options for users to choose (in this form because it presents nicer to choose yes rather than 1 in a drop down select)
  yesnoTab = { 0: "No", 1: "Yes" };
  yesnoList = { 0: "No", 1: "Yes" };

  profileForm = new FormGroup({
    firstName: new FormControl(""),

    lastName: new FormControl("")
  });
  color = "Primary";
  checked = false;

  //icon sets for letting the user choose
  icons = icons;

  //the item eventually being sent to the DB
  report;
  constructor(
    public filterService: FiltersService,
    public sanitizer: DomSanitizer,
    public pullData: PullDataService
  ) {}

  /**
   * init report with template answers
   */
  ngOnInit() {
    this.report = cloneDeep(this.template);
  }
  /**
   * Push the upload to the database and on refresh will show up in the correct place
   */
  onSubmit() {
    this.pullData.pushNewReport(JSON.stringify(this.report)).subscribe(data => {
      console.log("UPLOADED REPORT");
      console.log(JSON.stringify(this.report));
      console.log("DB RESPONSE: ", data);
    });
  }
  /**
   * clear any input from the template
   */
  resetForm() {
    this.report = cloneDeep(this.template);
  }

  /**
   * Setting the background color for the outer div (no image for background)
   */
  setSampleBackgroundStyle() {
    let styles = {
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "cover",
      "background-image":
        "linear-gradient(" +
        this.filterService.shadeColor(this.report.Color, 75) +
        "," +
        this.report.Color +
        ")"
    };

    return styles;
  }

  /**
   * Set stytling for the icon based on the background color chosen by the color select
   * The styling in base reports is the same
   */
  setSampleImageStyle() {
    let styles = {
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "contain",
      "background-image": "url(" + this.report.IconUrl + ")",
      width: "100%",
      height: "100%",
      "max-width": "140px",
      "max-height": "140px",
      margin: "10px auto auto"
    };
    var c = this.report.Color.substring(1); // strip #
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
}
