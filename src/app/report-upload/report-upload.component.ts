import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as cloneDeep from "lodash/cloneDeep";

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
    location: "",
    order: 1, //0 is first, 1 is end
    parentReport: 0,
    css: {},
    url: ""
  };
  yesno = ["Yes", "No"];
  profileForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl("")
  });
  color = "Primary";
  checked = false;
  constructor() {}
  report;
  ngOnInit() {
    this.report = cloneDeep(this.template);
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
}
