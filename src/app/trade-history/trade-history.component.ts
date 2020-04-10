import { Component, OnInit } from "@angular/core";
import { TradeToolComponent } from "../trade-tool/trade-tool.component";
import { fadeInItems } from "@angular/material";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-trade-history",
  templateUrl: "./trade-history.component.html",
  styleUrls: ["./trade-history.component.css"],
  providers: [TradeToolComponent]
})
export class TradeHistoryComponent implements OnInit {
  constructor(
    public tradeTool: TradeToolComponent,
    public filterService: FiltersService
  ) {
    this.tradeTool.ngOnInit();
  }
  fake_N = [];
  fake_O = [];
  fake_N_Map = {};
  fake_O_Map = {};
  offers;
  offersMap = {};
  negotiations;
  negotiationsMap = {};

  viewingOffer = "";
  clickedNegotiation = -1;
  highTrade;
  mediumTrade;
  lowTrade;
  pickOrderToPickID;
  firstSelectionMade = false;
  ngOnInit() {
    this.filterService.pullData.pullDraftOffers().subscribe(data => {
      this.offers = data;
      console.log("OFFERS", this.offers);
    });
    this.filterService.pullData.pullDraftNegotiations().subscribe(data => {
      this.negotiations = data;
      console.log("Negotiations", this.negotiations);
    });
    this.init();
  }
  init() {
    if (
      this.tradeTool.uploadingPicks ||
      this.negotiations == null ||
      this.offers == null
    ) {
      setTimeout(() => {
        console.log("LOOP 51");
        this.init();
      }, 100);
    } else {
      console.log("HERE2");
      // for (var i = 0; i < 10; i++) {
      //   this.fake_N.push({
      //     NegotiationID: i,
      //     TradeTeamID: 1014 + i,
      //     Active: i % 2,
      //     OrderID: 10 - i,
      //     Main_Pick_Raiders: this.tradeTool.teamToPickIDs[String(1014 + i)][0],
      //     Main_Pick_Trade: this.tradeTool.teamToPickIDs["1012"][0]
      //   });
      //   for (var j = 0; j < 5; j++) {
      //     this.fake_O.push({
      //       OfferID: i + "_" + j,
      //       OrderID: j,
      //       NegotiationID: i,
      //       RaidersOffered: j % 2,
      //       TradeText: "TRADE OFFER " + String(i) + "_" + String(j),
      //       Active: j == 0 ? 1 : 0
      //     });
      //   }
      // }

      // this.fake_N.forEach(element => {
      //   element["TradeTeamID"] = this.tradeTool.clubIDToSailID[
      //     element["TradeClub"]
      //   ];
      //   this.fake_N_Map[element["NegotiationID"]] = element;
      // });
      console.log("NEGOTIATION", this.negotiations);
      this.negotiations.forEach(element => {
        element["TradeTeamID"] = this.tradeTool.clubIDToSailID[
          element["TradeClub"]
        ];
        element["Main_Pick_Raiders"] = element["LVPick"];
        element["Main_Pick_Trade"] = element["TradeClubPick"];
        element["OrderID"] = element["NegotiationID"];

        this.negotiationsMap[element["NegotiationID"]] = element;
      });

      // this.fake_O.forEach(element => {
      //   this.fake_O_Map[element["OfferID"]] = element;
      // });

      this.offers.forEach(element => {
        element["OfferTeamID"] = this.tradeTool.clubIDToSailID[
          element["OfferClubID"]
        ];
        element["OrderID"] = element["OfferID"];

        this.offersMap[element["OfferID"]] = element;
      });
      console.log("HERE!");
      console.log("Offers", this.offersMap);
      console.log("Negotiations", this.negotiationsMap);
    }
  }

  /**
   * Get the offer ID of the active offer
   * @param negotiation
   */
  getActiveOffer(negotiation: number) {
    if (
      this.tradeTool.uploadingPicks &&
      this.negotiations == null &&
      this.offers == null
    ) {
      setTimeout(() => {
        console.log("LOOP 51");
        this.getActiveOffer(negotiation);
      }, 100);
    } else {
      var offer = { OfferCode: 0 };
      // Object.keys(this.fake_O_Map).forEach(offerID => {
      //   if (
      //     this.fake_O_Map[offerID].NegotiationID == negotiation &&
      //     this.fake_O_Map[offerID].Active
      //   ) {
      //     offer = this.fake_O_Map[offerID];
      //   }
      // });

      // offer = Object.keys(this.offersMap).reduce(function(prev, curr) {
      //   return this.offersMap[curr]["OfferCode"] > 0 &&
      //     this.offersMap[curr]["OfferCode"] == negotiation &&
      //     this.offersMap[curr]["OfferCode"] > this.offersMap[prev]["OfferCode"]
      //     ? this.offersMap[curr]
      //     : this.offersMap[prev];
      // });

      Object.keys(this.offersMap).forEach(offerID => {
        if (
          this.offersMap[offerID].OfferCode > 0 &&
          this.offersMap[offerID].NegotiationID == negotiation &&
          this.offersMap[offerID].OfferCode > offer.OfferCode
        ) {
          offer = this.offersMap[offerID];
        }
      });

      return offer;
    }
  }

  /**
   * set active negotiation
   * set active offer
   * @param negotiation Negotiation ID number
   * @param offerID Offer ID number
   */
  selectNegotiation(negotiation: number, offerID: any) {
    this.clickedNegotiation = negotiation;
    // this.filterService.teamPortalSelected = this.filterService.teamsMap[
    //   this.fake_N_Map[negotiation].TradeTeamID
    // ];
    // this.filterService.teamPortalActiveClubID = this.fake_N_Map[
    //   negotiation
    // ].TradeTeamID;
    this.filterService.teamPortalSelected = this.filterService.teamsMap[
      this.negotiationsMap[negotiation].TradeTeamID
    ];
    this.filterService.teamPortalActiveClubID = this.negotiationsMap[
      negotiation
    ].TradeTeamID;

    this.highTrade = null;
    this.mediumTrade = null;
    this.lowTrade = null;
    this.viewingOffer = String(offerID);

    //calculate the high mid low offers

    //reset picks
    var pickInvolved = {};
    Object.keys(this.tradeTool.pickInvolved).forEach(element => {
      if (this.tradeTool.pickIDToPick[element]["ConditionalPick"] == 1) {
        pickInvolved[element] = "-1";
      } else {
        pickInvolved[element] = "0";
      }
    });

    pickInvolved[this.negotiationsMap[negotiation].Main_Pick_Raiders] = "1";
    pickInvolved[this.negotiationsMap[negotiation].Main_Pick_Trade] = "1";
    var output = this.tradeTool.performTradeGenerations(
      pickInvolved,
      this.tradeTool.minTradeValueDif,
      this.tradeTool.maxTradeValueDif,
      this.tradeTool.maxTradePickDif,
      this.tradeTool.minTradePickDif,
      this.tradeTool.tradePicksQuantity
    );
    var tradeOptions = output["tradeOptions"];
    this.pickOrderToPickID = output["pickOrderToPickID"];
    this.highTrade = tradeOptions[0];
    if (tradeOptions.length > 0) {
      this.mediumTrade = tradeOptions.reduce(function(prev, curr) {
        return Math.abs(prev[0]) < Math.abs(curr[0]) ? prev : curr;
      });
    }
    this.lowTrade = tradeOptions[tradeOptions.length - 1];
    this.firstSelectionMade = true;
  }

  /**
   * Return the offer color for which one is active
   * @param active 1 == on 0 == off
   */
  getActiveBackground(active: boolean) {
    if (active) {
      return { backgroundColor: "#5fb1e3" };
    } else {
      return { backgroundColor: "#e1e1e1" };
    }
  }
  /**
   * Return the offer color for which one is active
   * @param active 1 == on 0 == off
   */
  getNegotiationBackground(negotiation: number) {
    if (negotiation == this.clickedNegotiation) {
      return { backgroundColor: "#71d28d" };
    } else {
      return {};
    }
  }

  /**
   * get offers from clicked negotiation
   */
  getOffers() {
    var offers = {};
    Object.keys(this.offersMap).forEach(key => {
      if (
        this.offersMap[key].NegotiationID == this.clickedNegotiation &&
        this.offersMap[key].OfferCode > 0
      ) {
        offers[key] = this.offersMap[key];
      }
    });
    return offers;
  }

  /**
   * get high medium and low offers
   */
  getCounters() {
    var offers = {};
    Object.keys(this.offersMap).forEach(key => {
      if (
        this.offersMap[key].NegotiationID == this.clickedNegotiation &&
        this.offersMap[key].OfferCode < 0
      ) {
        offers[key] = this.offersMap[key];
      }
    });
    return offers;
  }
}
