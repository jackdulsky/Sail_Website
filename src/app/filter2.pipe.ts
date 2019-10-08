import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

@Pipe({ name: "filter2" })
export class FilterPipe2 implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], searchText: string, id: string): any[] {
    console.log(id, searchText, items);
    if (
      (id == "3" && (searchText == null || searchText.length <= 2)) ||
      (id == "8" && (searchText == null || searchText.length <= 1))
    ) {
      if (this.filt.form.value[id] == null) {
        return [];
      }
      return items.filter(it => {
        try {
          return this.filt.form.value[id].indexOf(it.key) != -1;
        } catch {
          return false;
        }
      });
    }
    // if (id == "8" && (searchText == null || searchText.length <= 1)) {
    //   if (this.filt.form.value[id] == null){
    //     return []
    //   }
    //   return items.filter(it => {
    //     try {
    //       return this.filt.form.value[id].indexOf(it.key) != -1;
    //     } catch {
    //       return false;
    //     }
    //   });
    // }
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(it => {
      try {
        return (
          it.value["Label"].toLowerCase().includes(searchText) ||
          this.filt.form.value[id].indexOf(it.key) != -1
        );
      } catch {
        return false;
      }
    });
  }
}
