import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FolderselectpopComponent } from "../folderselectpop/folderselectpop.component";
import { UserService } from "../user.service";
import { User } from "../user";
import { USERS } from "../mock-users";
import { FiltersService } from "../filters.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"]
})
export class TopbarComponent implements OnInit {
  allUsers: User[];

  constructor(
    public filterService: FiltersService,
    private userService: UserService,
    private modalService: NgbModal,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getAllUsers();
    this.filterService.getBulkImport();
  }
  getAllUsers(): void {
    this.userService.getUsers().subscribe(USERS => (this.allUsers = USERS));
  }
  onCreate() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "60%";
    dialogConfig.autoFocus = true;
    // dialogConfig.position ={'top': '0', 'left':'0'};
    const dialogRef = this.dialog.open(FolderselectpopComponent, dialogConfig);
  }
}
