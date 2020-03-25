import {
  Injectable,
  ɵclearResolutionOfComponentResourcesQueue
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

import "rxjs/add/operator/map";

import { UUID } from "angular2-uuid";

@Injectable({
  providedIn: "root"
})
/**
 * This service is solely responsible for holding the functions to get specific data sets from the database through the api
 * There are secure and non-secure variables for the url of the api
 * Eventually the secure one will only be used but for now until certificate and network issues are fixed
 * the non-secure will be used primarily and the website must be accessed through the vpn if not in house
 */
export class PullDataService {
  //UTILITY SERVER URL
  serverURLSecure = "https://oaksvr06.raiders.com/";
  serverURLNotSecure = "http://oaksvr06.raiders.com/";

  GUID;
  constructor(private http: HttpClient) {}

  //Try both secure and non-secure api links (eventually this will be depricated or need to be changed)
  postQuery(queryString: string) {
    try {
      return this.http.post(this.serverURLNotSecure + "db/query", {
        query: queryString
      });
    } catch (e) {}
    return this.http.post(this.serverURLSecure + "db/query", {
      query: queryString
    });
  }

  /**
   * RETURN ALL THE INFO RELATED TO TEAMS FROM THE DATA BASE
   */
  getTeams() {
    var query =
      "select SailTeamID,TeamCode,Conference,Division,ClubCityName, ClubNickName from SaildB.org.TeamSeason where LeagueType = 'NFL' and Season  = '2020'";
    return this.postQuery(query);
  }

  //RETURNS THE SAVED FILTERS FROM THE DATA BASE
  getSavedFilters() {
    var query = "Select * from SailDB.filter.Saved Order by DateAdded desc";
    return this.postQuery(query);
  }

  //Return the filter DB format from the database from the guid passed in
  //DEFAULT GUID IS WINDOW GUID
  loadFilterFromGUID(guid: string = this.GUID) {
    var query =
      "Select * FROM SaildB.filter.Filter Where FilterGUID = '" + guid + "'";
    return this.postQuery(query);
  }

  //GET NEXT LEVEL OF SUBFOLDERS FROM DATABASE
  getSubFolders(name: string) {
    try {
      return this.http.get(
        "http://oaksvr06.raiders.com/api/xos/subfolders/" + name
      );
    } catch (e) {
      return this.http.get(
        "https://oaksvr06.raiders.com/api/xos/subfolders/" + name
      );
    }
  }

  //SAVE THE FILTER SET IN THE DB
  saveFilter(
    name: string,
    filters: any,

    description: string
  ) {
    var query =
      "exec SailDB.filter.spSAIL_SaveFilter N'" +
      name +
      "', N'" +
      JSON.stringify(filters) +
      "', N'" +
      description +
      "'";

    return this.postQuery(query);
  }

  //PULL THE DATATYPE FROM THE DB
  pullDataType() {
    var query = "Select * from SailDB.stat.DataType";
    return this.postQuery(query);
  }

  //PULL BIN INFORMATION FROM THE DB ABOUT THE 6 BINS
  pullBin() {
    var query = "Select * from SailDB.filter.Bin";
    return this.postQuery(query);
  }

  //PULL THE NAVIGATION FROM THE DB
  pullNavigation() {
    var query = "Select * from SailDB.filter.Navigation";
    return this.postQuery(query);
  }

  //PULL THE NAVIGATION ELEMENTS FROM THE DB
  //ANYTHING DOING WITH TABS OR PANELS FOR THE STRUCTURE

  pullNavigationElement() {
    var query = "Select * from SailDB.filter.NavigationElement";
    return this.postQuery(query);
  }

  //PULL ATTRIBUTE TYPE INFORMATION (0 = tab in panel that opens another panel, 1 = pkid, 2 = attribute)
  pullAttributeType() {
    var query = "Select * from SailDB.filter.AttributeType";
    return this.postQuery(query);
  }

  //PULL INFORMATION ABOUT THE ATTRIBUTES (ORDER, LABEL, ETC...)
  pullAttribute() {
    var query = "Select * from SailDB.filter.Attribute";
    return this.postQuery(query);
  }

  //PULL UI TYPE LABELS
  pullUIType() {
    var query = "Select * from SailDB.filter.UIType";
    return this.postQuery(query);
  }

  //PULL THE VALUES LIST OF ALL POSSIBLE SELECTIONS
  //MAPPING OF ATTRIBUTE ID TO VALUE ID IS UNIQUE BUT VALUES ARE NOT UNIQUE
  pullValue() {
    var query = "Select * from SailDB.filter.Value";
    return this.postQuery(query);
  }

  //PULL THE STRUCTURE OF THE TABS FROM THE DB
  pullStructure(leagueType: string) {
    // console.log("PULL STRUCTURE");
    var query = "exec SailDB.filter.spSAIL_GetFilterStructure " + leagueType;
    return this.postQuery(query);
  }

  //SEND THE DATA BACK UP TO THE DB
  // INSERT THE GUI AND FILTERS SELECTED
  constructAndSendFilters(filter) {
    var query =
      "exec SailDB.filter.spSAIL_StoreUpdateFilter N'" +
      this.GUID +
      "', N'" +
      JSON.stringify(filter) +
      "'";

    return this.postQuery(query);
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
    return this.postQuery(query);
  }

  //PULL THE LOCATIONS OF THE REPORTS
  pullReportTabLocation() {
    var query = "SELECT *  FROM [SaildB].[Reports].[TabLocation]";
    return this.postQuery(query);
  }

  //GET ALL THE PLAYERS FOR THE URL COMPOSITION
  pullPlayers() {
    var query =
      " SELECT r.GSISPlayerID,r.SailID,v.StatValue,GSISID FROM saildb.stat.PlayerStats s LEFT JOIN saildb.org.Player r ON s.SailID = r.SailID LEFT JOIN saildb.stat.PlayerStatType t ON s.PlayerStatID = t.PlayerStatID LEFT JOIN saildb.import.ValueLookup v ON v.ValueID = s.PlayerStatValue WHERE t.PlayerStatType = 'PlayerName'";
    return this.postQuery(query);
  }

  //Get the report structure
  pullReports() {
    var query = "SELECT *  FROM [SaildB].[Reports].[Reports]";
    return this.postQuery(query);
  }

  //PULL THE REPORT URL
  pullReportURL() {
    var query = "SELECT * FROM [SaildB].[Reports].[ReportURL]";
    return this.postQuery(query);
  }

  //PULL CLUB DATA
  pullClubData() {
    var query =
      "exec [SaildB].[SAILSite].[spHeaders_Club] N'" + this.GUID + "'";
    return this.postQuery(query);
  }
  //PULL PLAYER DATA
  pullPlayerData() {
    var query =
      "exec [SaildB].[SAILSite].[spHeaders_Player] N'" + this.GUID + "'";
    return this.postQuery(query);
  }

  //PULL PLAYER DATA
  pullPlayersToDisplay(sendString: String) {
    var query =
      "exec [SaildB].[filter].[spGetPlayersList] N'" + sendString + "'";
    return this.postQuery(query);
  }

  //INSERT THE REPORT
  pushNewReport(reportJSON: string) {
    var query = "SailDB.Reports.spAddNewReport N'" + reportJSON + "'";
    //console.log("PUSHING NEW REPORT JSON: ", reportJSON);
    return this.postQuery(query);
  }

  //Pull position heirarchy
  pullPositionHierarchy() {
    var query =
      "Select * from SailDB.filter.PositionHierarchy p order by orderID";
    return this.postQuery(query);
  }

  /**
   * Here the api is called to get the search options
   * Output is the list of serach options
   * Currently on one search option is returned form the api function
   * @param input  = text string that is being searched
   *
   * There is a try except shell for the http /https issue and the inside try/except is
   *  if the search api instance is down do the slow method which goes through a file
   */
  pullSearchOptions(input: string) {
    try {
      try {
        return this.http.post(
          this.serverURLSecure + "search",
          {
            text: String(input),
            guid: String(this.GUID)
          },
          { responseType: "text" }
        );
      } catch (e) {
        //api local host instance down

        return this.http.post(
          this.serverURLSecure + "execute/file/bodyinput/search_tool",
          {
            input: String(input),
            guid: String(this.GUID)
          },
          { responseType: "text" }
        );
      }
    } catch (e) {
      //Error with secure api link
      try {
        return this.http.post(
          this.serverURLNotSecure + "search",
          {
            text: String(input),
            guid: String(this.GUID)
          },
          { responseType: "text" }
        );
      } catch (e) {
        //api local host instance down
        return this.http.post(
          this.serverURLNotSecure + "execute/file/bodyinput/search_tool",
          {
            input: String(input),
            guid: String(this.GUID)
          },
          { responseType: "text" }
        );
      }
    }
  }
  /**
   * Pulls the player URL: array of objects that have
   * SailID, and PlayerImageUrl
   */
  pullPlayerURL() {
    var query =
      "Select p.SailID, PlayerImageUrl from ContractsDB..Player join saildb.org.Player p on player.PlayerId = p.GSISPlayerID where p.CurrentPlayerLevel = 'NFL'";
    return this.postQuery(query);
  }

  /**
   * Pull all the players and their locations / information to be displayed on their cards
   *
   * @param scenario The number corresponding to a unique set of player locations
   *
   * default scenario is 0 (base scenario)
   */
  pullHypoPlayers(scenario: number = 0) {
    var query = "Exec FreeAgency.FA20.spScenario_Get " + scenario;
    return this.postQuery(query);
  }

  /**
   * Pull information on the bins for the FA Hypo portal
   */
  pullHypoBins() {
    var query = "select * from [FreeAgency].[FA20].[Hypo_Bins]";
    return this.postQuery(query);
  }

  /**
   * Get a list of scenarios from the DB for the FA Hypo portal
   */
  pullHypoScenario() {
    var query =
      "SELECT * FROM [FreeAgency].[FA20].[Hypo_Scenarios] Order By ScenarioID";

    return this.postQuery(query);
  }

  /**
   * Call stored procedure to execute the inserting of a new scenario
   * @param jsonData the object that includes the name, description, and list of player objects that are to be writen down
   */
  insertHypoScenarioData(jsonData: String) {
    var query =
      "Exec [FreeAgency].[FA20].[spScenario_Write] '" + jsonData + "'";

    return this.postQuery(query);
  }
  /**
   * This will get the draft picks info
   * currently only set to 2019 but this will change
   */
  pullDraftPicksInfo() {
    var query =
      "select * From Draft.Draft20.ClubDraftPick order by 'Season', 'Round', 'Overall'";
    return this.postQuery(query);
  }
}
