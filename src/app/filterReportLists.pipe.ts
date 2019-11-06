import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

//THSI FILTER PIPE IS USED FOR THE TYPE0 ENTRY FORMS
@Pipe({ name: "filterReportLists" })
export class FilterReportListsPipe implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], searchText: any): any[] {
    //BASE CASES
    if (!items) return [];
    if (!searchText) return items;

    //REGULAR CASE RETURN FOR IF THE TAB IS IN THE SELECTED LOCATION AND IS A REPORT
    var returnList = items.filter(it => {
      try {
        return (
          String(it.value.LocationID) == String(searchText) &&
          String(it.value.IsList)
        );
      } catch {
        return false;
      }
    });
    return returnList;
  }
}
