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
import { dependenciesFromGlobalMetadata } from "@angular/compiler/src/render3/r3_factory";

@Injectable({
  providedIn: "root"
})
export class PullDataService {
  //UTILITY SERVER URL
  serverURL = "http://oaksvr06.raiders.com/";
  GUID;
  constructor(private http: HttpClient) {}
  //RETURN ALL THE INFOR RELATED TO TEAMS FROM THE DATA BASE
  getTeams() {
    return this.http.post(this.serverURL + "db/query", {
      query:
        "select SailTeamID,TeamCode,Conference,Division,ClubCityName, ClubNickName from SaildB.org.TeamSeason where LeagueType = 'NFL' and Season  = '2020'"
    });
  }

  //SEND UP THE XOS INFORMATION
  //NOT FUNCTIONAL
  XOSExport(folder: string, filterID: string, filters: any) {
    //console.log("Sending to folder: ", folder);
    //console.log("Sending filterID ", filterID);
    //console.log("Sending Filters: ", filters);
  }

  //RETURNS THE SAVED FILTERS FROM THE DATA BASE
  //NOT FUNCTIONAL
  getSavedFilters() {
    var query = "Select * from SailDB.filter.Saved Order by DateAdded desc";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //Return the filter DB format from the database from the guid passed in
  //DEFAULT GUID IS WINDOW GUID
  loadFilterFromGUID(guid: string = this.GUID) {
    var query =
      "Select * FROM SaildB.filter.Filter Where FilterGUID = '" + guid + "'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //GET NEXT LEVEL OF SUBFOLDERS FROM DATABASE
  getSubFolders(name: string) {
    return this.http.get(
      "http://oaksvr06.raiders.com/api/xos/subfolders/" + name
    );
  }

  //SAVE THE FILTER SET IN THE DB
  //NOT FUNCTIONAL
  saveFilter(
    name: string,
    filters: any,
    filterID: string,
    description: string
  ) {
    //console.log("Trying to send: ", name, filterID);
    //console.log(JSON.stringify(filters));
    // if (filterID != null) {
    //   return filterID;
    // } else {
    //   return String(Math.floor(Math.random() * 1000));
    // }

    var query =
      "exec SailDB.filter.spSAIL_SaveFilter N'" +
      name +
      "', N'" +
      JSON.stringify(filters) +
      "', N'" +
      description +
      "'";

    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //A SLOW QUERY TO TEST THE PLAY COUNT PART
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

  //PULL THE DATATYPE FROM THE DB
  pullDataType() {
    var query = "Select * from SailDB.stat.DataType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL BIN INFORMATION FROM THE DB ABOUT THE 6 BINS
  pullBin() {
    var query = "Select * from SailDB.filter.Bin";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE NAVIGATION FROM THE DB
  pullNavigation() {
    var query = "Select * from SailDB.filter.Navigation";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE NAVIGATION ELEMENTS FROM THE DB
  //ANYTHING DOING WITH TABS OR PANELS FOR THE STRUCTURE

  pullNavigationElement() {
    var query = "Select * from SailDB.filter.NavigationElement";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL ATTRIBUTE TYPE INFORMATION (0 = tab in panel that opens another panel, 1 = pkid, 2 = attribute)
  pullAttributeType() {
    var query = "Select * from SailDB.filter.AttributeType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL INFORMATION ABOUT THE ATTRIBUTES (ORDER, LABEL, ETC...)
  pullAttribute() {
    var query = "Select * from SailDB.filter.Attribute";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL UI TYPE LABELS
  pullUIType() {
    var query = "Select * from SailDB.filter.UIType";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE VALUES LIST OF ALL POSSIBLE SELECTIONS
  //MAPPING OF ATTRIBUTE ID TO VALUE ID IS UNIQUE BUT VALUES ARE NOT UNIQUE
  pullValue() {
    var query = "Select * from SailDB.filter.Value";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE STRUCTURE OF THE TABS FROM THE DB
  pullStructure(leagueType: string) {
    // console.log("PULL STRUCTURE");
    var query = "exec SailDB.filter.spSAIL_GetFilterStructure " + leagueType;
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //SEND THE DATA BACK UP TO THE DB
  // INSERT THE GUI AND FILTERS SELECTED
  constructAndSendFilters(filter) {
    // console.log("PUSHING", JSON.stringify(filter));

    var query =
      "exec SailDB.filter.spSAIL_StoreUpdateFilter N'" +
      this.GUID +
      "', N'" +
      JSON.stringify(filter) +
      "'";

    return this.http.post(this.serverURL + "db/query", {
      query: query
    });

    //
  }

  //SET THE GUI FOR THE WINDOW
  //THIS IS CALLED FROM THE ONINIT FUNCTION
  setGUID() {
    this.GUID = UUID.UUID();
  }
  //GET GUID FOR URL LINK
  getGUID() {
    return this.GUID;
  }
  //PULL THE REPORT TABS TABLE
  pullReportTabs() {
    var query = "SELECT *  FROM [SaildB].[Reports].[Tabs]";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE LOCATIONS OF THE REPORTS
  pullReportTabLocation() {
    var query = "SELECT *  FROM [SaildB].[Reports].[TabLocation]";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //GET ALL THE PLAYERS FOR THE URL COMPOSITION
  pullPlayers() {
    var query =
      " SELECT r.GSISPlayerID,r.SailID,v.StatValue,GSISID FROM saildb.stat.PlayerStats s LEFT JOIN saildb.org.Player r ON s.SailID = r.SailID LEFT JOIN saildb.stat.PlayerStatType t ON s.PlayerStatID = t.PlayerStatID LEFT JOIN saildb.import.ValueLookup v ON v.ValueID = s.PlayerStatValue WHERE t.PlayerStatType = 'PlayerName'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //Get the report structure
  pullReports() {
    var query = "SELECT *  FROM [SaildB].[Reports].[Reports]";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL THE REPORT URL
  pullReportURL() {
    var query = "SELECT * FROM [SaildB].[Reports].[ReportURL]";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL CLUB DATA
  pullClubData() {
    var query =
      "exec [SaildB].[SAILSite].[spHeaders_Club] N'" + this.GUID + "'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  //PULL PLAYER DATA
  pullPlayerData() {
    var query =
      "exec [SaildB].[SAILSite].[spHeaders_Player] N'" + this.GUID + "'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //PULL PLAYER DATA
  pullPlayersToDisplay(sendString: String) {
    // var query =
    //   "exec [SaildB].[filter].[spGetPlayersList] N'" + this.GUID + "'";
    var query =
      "exec [SaildB].[filter].[spGetPlayersList] N'" + sendString + "'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //INSERT THE REPORT
  pushNewReport(reportJSON: string) {
    var query = "SailDB.Reports.spAddNewReport N'" + reportJSON + "'";
    //console.log("PUSHING NEW REPORT JSON: ", reportJSON);
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //Pull position heirarchy
  pullPositionHierarchy() {
    var query =
      "Select * from SailDB.filter.PositionHierarchy p order by orderID";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }

  //Pull position heirarchy
  pullSearchOptions(input: string) {
    // return this.http.post(
    //   this.serverURL + "execute/file/bodyinput/search_tool",
    //   {
    //     input: String(input),
    //     guid: String(this.GUID)
    //   },
    //   { responseType: "text" }
    // );
    // return this.http.post(
    //   this.serverURL + "execute/file/bodyinput/getSearchResults",
    //   {
    //     text: String(input),
    //     guid: String(this.GUID)
    //   },
    //   { responseType: "text" }
    // );
    try {
      return this.http.post(
        this.serverURL + "search",
        {
          text: String(input),
          guid: String(this.GUID)
        },
        { responseType: "text" }
      );
    } catch (e) {
      return this.http.post(
        this.serverURL + "execute/file/bodyinput/search_tool",
        {
          input: String(input),
          guid: String(this.GUID)
        },
        { responseType: "text" }
      );
    }
  }
  pullPlayerURL() {
    var query =
      "Select p.SailID, PlayerImageUrl from ContractsDB..Player join saildb.org.Player p on player.PlayerId = p.GSISPlayerID where p.CurrentPlayerLevel = 'NFL'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullfahypo() {
    var query =
      "EXEC	[SaildB].[Reports].[spRD_Player_Position_Stats] N'ce9df573-eea4-3ff6-fb8d-6ccabb606ee5'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullUFABoard() {
    var query =
      "EXEC	[SaildB].[Reports].[spRD_Market_FreeAgentBoard] N'972c1675-43af-5ec6-1658-c1260d0976ab'";
    //'" +
    //      this.GUID +
    //    "'";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullHypoPlayers(scenario: number = 0) {
    // console.log("PULLING SCENARIO HYPO ", scenario);
    var query = "FreeAgency.FA20.spScenario_Get " + scenario;

    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullHypoBins() {
    var query = "select * from saildb.Reports.Hypo_Bins";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullHypoMaxScenario() {
    var query =
      "SELECT * MAX([ScenarioID]) FROM [SaildB].[Reports].[Hypo_Scenarios]";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  pullHypoScenario() {
    var query =
      "SELECT * FROM [FreeAgency].[FA20].[Hypo_Scenarios] Order By ScenarioID";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
  // insertHypoScenario(data: any) {
  //   var query =
  //     "INSERT INTO [SaildB].[Reports].[Hypo_Scenarios] (ScenarioID, Label, ScenarioDesc, LastChangeDt, LastChangeUserID)";
  //   query += " Values ";
  //   for (let row in data) {
  //     query +=
  //       "(" +
  //       data[row]["ScenarioID"] +
  //       "," +
  //       data[row]["Label"] +
  //       "," +
  //       data[row]["ScenarioDesc"] +
  //       ", GETDATE(),'TESTUSER1')";
  //     // console.log("DATA", data[row]);
  //   }
  //   console.log("query", query);
  //   return this.http.post(this.serverURL + "db/query", {
  //     query: query
  //   });
  // }

  insertHypoScenarioData(jsonData: String) {
    var query =
      "Exec [FreeAgency].[FA20].[spScenario_Write] '" + jsonData + "'";
    // var query = "select 1";
    return this.http.post(this.serverURL + "db/query", {
      query: query
    });
  }
}
