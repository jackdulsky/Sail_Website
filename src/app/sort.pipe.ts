import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";
import { filter } from "minimatch";
@Pipe({
  name: "Sort"
})
/**
 * Sort an array of objects by a field property 
 */
export class SortPipe implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
