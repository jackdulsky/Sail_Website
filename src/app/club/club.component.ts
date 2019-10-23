import { Component, OnInit } from "@angular/core";
import { FiltersService } from "../filters.service";
@Component({
  selector: "app-club",
  templateUrl: "./club.component.html",
  styleUrls: ["./club.component.css"]
})
export class ClubComponent implements OnInit {
  constructor(private filterService: FiltersService) {}
  teamSelected;
  ClubCityName = "ClubCityName";
  ClubNickName = "ClubNickName";
  showList = false;
  ngOnInit() {
    this.teamSelected = {
      SailTeamID: 1012,
      TeamCode: "OAK",
      Conference: "AFC",
      Division: "West",
      ClubCityName: "Oakland",
      ClubNickName: "Raiders"
    };
    this.changeTeam(this.teamSelected);
    console.log(this.teamSelected);
  }

  //Returns the logo src url to the club selection display
  getActiveLogo(team: any) {
    var citySplit = team["ClubCityName"].split(" ");
    var city;
    if (citySplit.length > 1) {
      city = citySplit[0] + citySplit[1];
    } else {
      city = citySplit[0];
    }
    var nick = team["ClubNickName"];
    return (
      "https://sail-bucket.s3-us-west-2.amazonaws.com/NFL_Logos/" +
      city +
      "_" +
      nick +
      ".png"
    );
  }

  //Retuns proper city name
  getCityName(team: any) {
    var citySplit = team["ClubCityName"].split(" ");
    if (citySplit.length > 1) {
      return citySplit[0] + " " + citySplit[1];
    } else {
      return citySplit[0];
    }
  }

  //This function changes the team selected
  changeTeam(team: any) {
    this.showList = false;
    this.teamSelected = team;
    //FID is -1
    //BIN is -2
    //ATT is 2

    //remove other team filters that are applied
    for (let query in this.filterService.newFIDBID) {
      console.log(
        "CHECKING",
        query,
        this.filterService.newFIDBID[query],
        Number(this.filterService.newFIDBID[query]) == -2
      );
      if (Number(this.filterService.newFIDBID[query]) == -2) {
        this.filterService.removeQuery(query);
      }
    }
    this.filterService.newFIDBID["-2"] = "-2";
    this.filterService.newFIDs["-2"] = { "2": [String(team["SailTeamID"])] };
    this.filterService.newDBFormat["-2"] = [
      [String(team["SailTeamID"])],
      {},
      []
    ];
  }
}
