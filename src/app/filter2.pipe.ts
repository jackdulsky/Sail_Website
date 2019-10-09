import { Pipe, PipeTransform } from "@angular/core";
import { FiltersService } from "./filters.service";

//THSI FILTER PIPE IS USED FOR THE TYPE0 ENTRY FORMS
@Pipe({ name: "filter2" })
export class FilterPipe2 implements PipeTransform {
  constructor(public filt: FiltersService) {}

  transform(items: any[], searchText: string, id: string): any[] {
    //SPECIAL CASES
    //FOR LENGTHY OPTION RESTRICT MINIMUM SEARCH TEXT (OR SHOW SELECTED)
    if (
      (id == "3" && (searchText == null || searchText.length <= 2)) ||
      (id == "8" && (searchText == null || searchText.length <= 1))
    ) {
      //IF IT IS A SPECIAL CASE BUT NONE ARE SELECTED RETURN EMPTY ARRAY
      if (this.filt.form.value[id] == null) {
        return [];
      }
      //ELSE RETURN THE ITEMS SELECTED EVEN IF MINIMUM SEARCH THRESHOLD IS NOT SET
      return items.filter(it => {
        try {
          return this.filt.form.value[id].indexOf(it.key) != -1;
        } catch {
          return false;
        }
      });
    }
    //BASE CASES
    if (!items) return [];
    if (!searchText) return items;

    //REGULAR CASE RETURN IF THE STRING SEARCHED FOR IS IN THE LABEL
    //NOT CASE SENSITIVE
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
