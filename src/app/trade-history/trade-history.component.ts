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
  viewingOffer = "";
  clickedNegotiation = -1;
  highTrade;
  mediumTrade;
  lowTrade;
  ngOnInit() {
    this.init();
  }
  init() {
    if (this.tradeTool.uploadingPicks) {
      setTimeout(() => {
        console.log("LOOP 51");
        this.init();
      }, 100);
    } else {
      for (var i = 0; i < 10; i++) {
        this.fake_N.push({
          NegotiationID: i,
          TradeTeamID: 1014 + i,
          Active: i % 2,
          OrderID: 10 - i
        });
        for (var j = 0; j < 5; j++) {
          this.fake_O.push({
            OfferID: i + "_" + j,
            OrderID: j,
            NegotiationID: i,
            RaidersOffered: j % 2,
            TradeText: "TRADE OFFER " + String(i) + "_" + String(j),
            Active: j == 4 ? 1 : 0,
            Main_Pick_Raiders: this.tradeTool.teamToPickIDs[String(1014 + i)][
              j % this.tradeTool.teamToPickIDs[String(1014 + i)].length
            ],
            Main_Pick_Trade: this.tradeTool.teamToPickIDs["1012"][
              j % this.tradeTool.teamToPickIDs["1012"].length
            ]
          });
        }
      }
      this.fake_N.forEach(element => {
        this.fake_N_Map[element["NegotiationID"]] = element;
      });
      this.fake_O.forEach(element => {
        this.fake_O_Map[element["OfferID"]] = element;
      });

      console.log(this.fake_N_Map);
      console.log(this.fake_O_Map);
    }
  }

  /**
   * clicking an offer and initializing it
   * @param offer offerObject
   */
  selectOffer(offerID: any) {
    this.viewingOffer = String(offerID);
    console.log(offerID);
    this.tradeTool.tradeTeam = this.filterService.teamsMap[
      this.fake_N_Map[this.fake_O_Map[offerID].NegotiationID].TradeTeamID
    ];
    //calculate the high mid low offers

    //reset picks
    Object.keys(this.tradeTool.pickInvolved).forEach(element => {
      this.tradeTool.pickInvolved[element] = 0;
      if (this.tradeTool.pickIDToPick[element]["ConditionalPick"] == 1) {
        this.tradeTool.pickInvolved[element] = "-1";
      } else {
        this.tradeTool.pickInvolved[element] = "0";
      }
    });
    this.tradeTool.pickInvolved[this.fake_O_Map[offerID].Main_Pick_Raiders] = 1;
    this.tradeTool.pickInvolved[this.fake_O_Map[offerID].Main_Pick_Trade] = 1;
    this.tradeTool.performTradeGenerations();
    this.highTrade = this.tradeTool.tradeOptions[0];
    this.mediumTrade = this.tradeTool.tradeOptions[
      Math.round(this.tradeTool.tradeOptions.length / 2)
    ];
    this.lowTrade = this.tradeTool.tradeOptions[
      this.tradeTool.tradeOptions.length - 1
    ];
  }

  /**
   * Get the offer ID of the active offer
   * @param negotiation
   */
  getActiveOffer(negotiation: number) {
    var offer;
    Object.keys(this.fake_O_Map).forEach(offerID => {
      if (
        this.fake_O_Map[offerID].NegotiationID == negotiation &&
        this.fake_O_Map[offerID].Active
      ) {
        offer = this.fake_O_Map[offerID];
      }
    });
    return offer;
  }

  /**
   * set active negotiation
   * set active offer
   * @param negotiation Negotiation ID number
   * @param offerID Offer ID number
   */
  selectNegotiation(negotiation: number, offerID: any) {
    this.clickedNegotiation = negotiation;
    this.selectOffer(offerID);
  }
}
