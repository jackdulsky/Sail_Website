import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ReportListService {
  currentReportTypeID: number = 0;
  constructor() {}

  //SET RD REPORT NUMBER
  updateReportType(newID: number) {
    this.currentReportTypeID = newID;
  }
  //RETURN THE REPORT ID
  getTypeID() {
    return this.currentReportTypeID;
  }
}
