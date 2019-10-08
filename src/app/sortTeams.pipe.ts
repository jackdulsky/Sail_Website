import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

@Pipe({ name: "sortTeams" })
export class sortTeamsPipe implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    // console.log(searchText);
    searchText = searchText.toLowerCase();
    // console.log("Search: ", searchText);

    return items.filter(it => {
      // console.log("CHECK TYPE");
      // console.log(it, typeof it);
      if (typeof it === "string" || it instanceof String) {
        return this.filt.testIdToString[Number(it)]
          .toLowerCase()
          .includes(searchText);
      } else {
        if (it.key) {
          return this.filt.testIdToString[it.key]
            .toLowerCase()
            .includes(searchText);
        }
      }
    });
  }
}
