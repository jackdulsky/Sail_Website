import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

@Pipe({
  name: "orderAttribute"
})

/**
 * Here will take a items that are id's and look up their navigation order to be displayed in
 * Then sort the item, no items are added or deleted
 * Only used in the filterspop component html file.
 *
 */
export class OrderAttributePipe implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[]): any[] {
    items.sort((a: any, b: any) => {
      if (
        this.filt.pullNavigation[a]["OrderID"] <
        this.filt.pullNavigation[b]["OrderID"]
      ) {
        return -1;
      } else if (
        this.filt.pullNavigation[a]["OrderID"] >
        this.filt.pullNavigation[b]["OrderID"]
      ) {
        return 1;
      } else {
        return 0;
      }
    });

    return items;
  }
}
