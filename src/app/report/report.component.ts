import { Component, OnInit } from "@angular/core";
import { ReportListService } from "../report-list.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.css"]
})
export class ReportComponent implements OnInit {
  typeID: number;
  temp: string;
  sourceURL: string = "https://sail.raiders.com/view/";
  constructor(
    private ReportListServices: ReportListService,
    public sanitizer: DomSanitizer
  ) {}
  displayURL: SafeUrl;

  ngOnInit() {
    this.typeID = this.ReportListServices.getTypeID();
    var ReportTypeID = this.ReportListServices.getTypeID();
    this.createRDURL();
  }
  createRDURL() {
    //this.sourceURL = this.sourceURL.concat(this.typeID.toString());
    var newURL = this.sourceURL + "2634///true/true/true";
    this.displayURL = this.sanitizer.bypassSecurityTrustResourceUrl(newURL);
    return this.sanitizer.bypassSecurityTrustResourceUrl(newURL);
  }
}
