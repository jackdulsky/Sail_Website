import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";
import { FiltersService } from "../filters.service";
import { PullDataService } from "../pull-data.service";

@Component({
  selector: "app-report-upload",
  templateUrl: "./report-upload.component.html",
  styleUrls: ["./report-upload.component.css"]
})
export class ReportUploadComponent implements OnInit {
  template = {
    label: "",
    isTab: "No",
    isList: "No",
    location: 1,

    parentListID: 0,
    css: {},
    url: "",
    iconURL:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart1.png",
    color: "#FFFFFF"
  };
  yesno = ["Yes", "No"];

  profileForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl("")
  });
  color = "Primary";
  checked = false;

  icons = {
    Cash1:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Cash1.png",

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

    Chart3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart3.png",

    Chart4:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart4.png",

    Chart5:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Chart5.png",

    Clock2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock1.png",

    Clock3:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Clock2.png",

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

    Line2:
      "https://sail-bucket.s3-us-west-2.amazonaws.com/SAIL_Icons/Line2.png",

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

    public pullData: PullDataService
  ) {}
  report;
  ngOnInit() {
    this.report = cloneDeep(this.template);
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.report);
  }
  resetForm() {
    this.report = cloneDeep(this.template);
  }

  setSampleStyle() {
    let styles = {
      "background-color": String(this.report.color),
      "background-image": "url(" + this.report.iconURL + ")",
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "contain"
      // "background-size": "160px 160px"
      //   repo.value["id"] % 2 == 0
      //     ? "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/OAK_logo.png')"
      //     : "url('https://sail-bucket.s3-us-west-2.amazonaws.com/Button_Team_Logos/NYG_logo.png')",
      // "background-image":
      // "linear-gradient(" + repo["colorTop"] + "," + repo["colorBottom"] + ")"
    };
    return styles;
  }
}
