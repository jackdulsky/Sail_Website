import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";
import * as cloneDeep from "lodash/cloneDeep";

//THSI FILTER PIPE IS USED FOR THE TYPE0 ENTRY FORMS
@Pipe({ name: "filter2" })
export class FilterPipe2 implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], searchText: string, id: string): any[] {
    //SPECIAL CASES
    //FOR LENGTHY OPTION RESTRICT MINIMUM SEARCH TEXT (OR SHOW SELECTED)
    //does not show selected in top bar
    if (id == "8" && (searchText == null || searchText.length <= 1)) {
      if (this.filt.form.value[id] == null) {
        return [];
      } else {
        return items.filter(it => {
          this.filt.form.value[id].indexOf(it.key) != -1;
        });
      }
    }

    //BASE CASES
    if (!items) return [];
    if (!searchText)
      return items.filter(it => {
        //for the position structure
        if (["0", "101", "102", "103"].indexOf(String(it.key)) != -1) {
          return false;
        } else {
          return true;
        }
      });

    //REGULAR CASE RETURN IF THE STRING SEARCHED FOR IS IN THE LABEL
    //NOT CASE SENSITIVE
    searchText = searchText.toLowerCase();
    var otherNameForm = this.filt.transformName(searchText);
    var returnedItems = 0;
    var returnList = items.filter(it => {
      if (["0", "101", "102", "103"].indexOf(String(it.key)) != -1) {
        return false;
      }
      try {
        if (
          returnedItems < 100 &&
          (it.value["Label"].toLowerCase().includes(searchText) ||
            it.value["Label"].toLowerCase().includes(otherNameForm) ||
            this.filt.form.value[id].indexOf(it.key) != -1)
        ) {
          returnedItems += 1;
          return true;
        } else {
          return false;
        }
      } catch {
        try {
          if (
            returnedItems < 100 &&
            (it.value["PosAbbr"].toLowerCase().includes(searchText) ||
              it.value["PosName"].toLowerCase().includes(searchText) ||
              this.filt.form.value[id].indexOf(it.key) != -1)
          ) {
            returnedItems += 1;
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
    });
    return returnList;
  }
}
