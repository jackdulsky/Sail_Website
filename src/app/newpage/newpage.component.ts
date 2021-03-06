import { Component, OnInit } from "@angular/core";
import { PullDataService } from "../pull-data.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-newpage",
  templateUrl: "./newpage.component.html",
  styleUrls: ["./newpage.component.css"]
})
export class NewpageComponent implements OnInit {
  constructor(
    public pullData: PullDataService,
    public route: ActivatedRoute,
    public router: Router
  ) {}

  /**
   * Reroute to home
   */
  ngOnInit() {
    var guid = this.pullData.GUID;
    this.router.navigate(["/home/" + String(guid) + this.router.url]);
  }
}
