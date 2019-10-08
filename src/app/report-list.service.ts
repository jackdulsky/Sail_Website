import { Injectable } from "@angular/core";
import { reports } from "./allReports";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ReportListService {
  currentReportTypeID: number = 0;
  reports = reports;
  constructor() {}
  updateReportType(newID: number) {
    this.currentReportTypeID = newID;
  }
  getTypeID() {
    return this.currentReportTypeID;
  }
}
