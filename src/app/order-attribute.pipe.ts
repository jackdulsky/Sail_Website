import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

@Pipe({
  name: "orderAttribute"
})
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
        // this.filt.pullAttribute[a]["OrderID"] >
        // this.filt.pullAttribute[b]["OrderID"]
      ) {
        return 1;
      } else {
        return 0;
      }
    });

    return items;
  }
}
