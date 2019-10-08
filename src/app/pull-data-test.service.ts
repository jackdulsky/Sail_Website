import {
  Injectable,
  ɵclearResolutionOfComponentResourcesQueue
} from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, map, tap } from "rxjs/operators";
import { Observable, of, Subscribable } from "rxjs";
import "rxjs/add/operator/map";
import { identifierModuleUrl } from "@angular/compiler";
import { RequestOptions } from "@angular/http";
import { UUID } from "angular2-uuid";

@Injectable({
  providedIn: "root"
})
export class PullDataTestService {
  //name of server
  serverURL = "http://oaksvr06.raiders.com/";
  url = "http://localhost:8080/api/7";
  GUID;
  constructor(private http: HttpClient) {}

  getTeams() {
    return this.http.post(this.serverURL + "db/query", {
      query:
        "select SailTeamID,TeamCode,Conference,Division,ClubCityName, ClubNickName from SaildB.org.TeamSeason where LeagueType = 'NFL' and Season  = '2019'"
    });
  }
  sendFilters(filters: any) {
    console.log("Trying to send: ", filters);
    console.log(JSON.stringify(filters));
    let body = JSON.stringify({ foo: "bar", text: "123" });
    const headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    let header = new HttpHeaders({
      "content-type": "json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true"
    });

    this.http
      .get(
        this.serverURL +
          "execute/file/norm/python_template?raiders=win&vegas=football",
        {
          responseType: "text"
        }
      )

      .subscribe(data => {
        console.log(data, typeof data);
      });
    return String(Math.floor(Math.random() * 1000));
  }
  XOSExport(folder: string, filterID: string, filters: any) {
    console.log("Sending to folder: ", folder);
    console.log("Sending filterID ", filterID);
    console.log("Sending Filters: ", filters);
  }
  getSavedFilters() {
    console.log("returning filters");
    //EVENTUALLY PASS IN USER
    return {
      "20200": { name: "a", filters: { "10904": ["68245"] } },
      "01050": {
        name: "b",
        filters: { "10904": ["68245"], "94600": ["89188", "84936"] }
      }
    };
  }

  //update to get strings of next level path

  getSubFolders(name: string) {
    return this.http.get(
      "http://oaksvr06.raiders.com/api/xos/subfolders/" + name
    );
  }

  //save filter also renames
  saveFilter(name: string, filters: any, filterID: string) {
    console.log("Trying to send: ", name, filterID);
    console.log(JSON.stringify(filters));
    if (filterID != null) {
      return filterID;
    } else {
      return String(Math.floor(Math.random() * 1000));
    }
  }

  testSlowQuery(game: number) {
    // var query =
    //   "SELECT * FROM (SELECT g.GSISGamekey, y.GSISPlayID, r.GSISPlayerID, p.SideOfBall, p.SpecialTeamsUnit, s.PlayStatType, s.PlayStatValue FROM saildb.stat.PlayerPlay p LEFT JOIN saildb.stat.Game g ON p.SailGameKey = g.SailGameKey LEFT JOIN saildb.stat.Play y ON p.SailPlayID = y.SailPlayID LEFT JOIN saildb.org.Player r ON p.SailID = r.SailID LEFT JOIN saildb.stat.PlayerPlayStats s ON s.PFFPlayID = y.PFFPlayID AND s.GSISPlayerID = r.GSISPlayerID WHERE s.PlayStatType IN ('pff_POSITION','pff_ROLE')) AS p PIVOT (MAX(PlayStatValue) FOR PlayStatType IN ([pff_ROLE],[pff_POSITION])) AS p Where GSISGamekey =" +
    //   String(game);
    var query =
      "SELECT * FROM (SELECT g.GSISGamekey, y.GSISPlayID, r.GSISPlayerID, p.SideOfBall, p.SpecialTeamsUnit FROM saildb.stat.PlayerPlay p LEFT JOIN saildb.stat.Game g ON p.SailGameKey = g.SailGameKey LEFT JOIN saildb.stat.Play y ON p.SailPlayID = y.SailPlayID LEFT JOIN saildb.org.Player r ON p.SailID = r.SailID) AS p Where GSISGamekey =" +
      String(game);
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullDataType() {
    var query = "Select * from SailDB.stat.DataType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullBin() {
    var query = "Select * from SailDB.filter.Bin";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullNavigation() {
    var query = "Select * from SailDB.filter.Navigation";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullNavigationElement() {
    var query = "Select * from SailDB.filter.NavigationElement";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullAttributeType() {
    var query = "Select * from SailDB.filter.AttributeType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullAttribute() {
    var query = "Select * from SailDB.filter.Attribute";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullUIType() {
    var query = "Select * from SailDB.filter.UIType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullValue() {
    var query = "Select * from SailDB.filter.Value";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newPullStructure(leagueType: string) {
    var query = "exec SailDB.filter.spSAIL_GetFilterStructure " + leagueType;
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  newConstructAndSendFilters(filter) {
    //pass down guid
    console.log("CURRENT GUID", this.GUID);
    //construct filters
    console.log(JSON.stringify(filter));
    //send query

    var query =
      "exec SailDB.filter.spSAIL_StoreUpdateFilter N'" +
      this.GUID +
      "', N'" +
      JSON.stringify(filter) +
      "'";
    // console.log(query);

    // this.http
    //   .post(this.serverURL + "db/query", {
    //     query: query
    //   })
    //   .subscribe(data => {
    //     console.log(data);
    //   });

    //
  }

  setGUID() {
    this.GUID = UUID.UUID();
  }
}
