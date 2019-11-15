import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";
import {
  DomSanitizer,
  SafeUrl,
  ɵELEMENT_PROBE_PROVIDERS__POST_R3__
} from "@angular/platform-browser";
@Component({
  selector: "app-report-upload",
  templateUrl: "./report-upload.component.html",
  styleUrls: ["./report-upload.component.css"]
})
export class ReportUploadComponent implements OnInit {
  template = {
    Label: "",
    IsTab: 0,
    IsList: 0,
    LocationID: 1,

    ParentTabID: 0,
    ViewID: "",
    IconUrl:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",
    Color: "#FFFFFF"
  };
  yesnoTab = { 0: "No", 1: "Yes" };
  yesnoList = { 0: "No", 1: "Yes" };

  profileForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl("")
  });
  color = "Primary";
  checked = false;

  icons = {
    Cash2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash2.png",

    Cash3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash3.png",

    Cash4:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash4.png",

    Chart1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",

    Chart2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart2.png",

    Chart5:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart5.png",

    Clock2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock2.png",

    Clock3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock3.png",

    Database1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Database1.png",

    Database2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Database2.png",

    Excel1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Excel1.jpg",

    Excel2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Excel2.png",

    Line1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Line1.png",

    PDF1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF1.png",

    PDF2: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF2.ico",

    PDF3: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/PDF3.png",

    Pie1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Pie1.png",

    Pie2: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Pie2.png",

    Report1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Report1.png",

    Report2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Report2.png",

    Table1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table1.png",

    Table2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table2.png",

    Table3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table3.png",

    Table4:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Table4.png",

    Time1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Time1.png",

    XOS1: "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/XOS1.png"
  };

  constructor(
    public filterService: FiltersService,
    public sanitizer: DomSanitizer,
    public pullData: PullDataService
  ) {}
  report;
  ngOnInit() {
    this.report = cloneDeep(this.template);
  }
  onSubmit() {
    console.log(JSON.stringify(this.report));
    this.pullData.pushNewReport(JSON.stringify(this.report)).subscribe(data => {
      console.log("RETURN PUSH", data);
    });
  }
  resetForm() {
    this.report = cloneDeep(this.template);
  }

  //Set the view sample icon images and background color
  setSampleStyle() {
    let styles = {
      "background-repeat": "no-repeat,no-repeat",
      "background-position": "center",
      "background-size": "145px,cover",
      "background-image":
        "url(" +
        this.report.IconUrl +
        "), linear-gradient(" +
        this.filterService.shadeColor(this.report.Color, 75) +
        "," +
        this.report.Color +
        ")"
    };
    return styles;
  }
}
