import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

/**
 * Confirmation dialog component for reusable user confirmations.
 *
 * Presents a title, message, and confirm/cancel actions.
 * The caller receives `true` on confirm and `false` on cancel.
 */
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}

/**
 * Model class to hold configuration for the ConfirmationDialogComponent.
 * Includes customizable texts and button colors.
 */
export class ConfirmDialogModel {
  private _confirmText: string = "OK";
  private _cancelText: string = "Cancel";
  private _cancelColor: "accent" | "warn" | "primary" | "" = "";
  private _confirmColor: "accent" | "warn" | "primary" | "" = "";

  constructor(public title: string, public message: string) {
  }

  get cancelColor(): "accent" | "warn" | "primary" | "" {
    return this._cancelColor;
  }

  set cancelColor(value: "accent" | "warn" | "primary" | "") {
    this._cancelColor = value;
  }

  get confirmColor(): "accent" | "warn" | "primary" | "" {
    return this._confirmColor;
  }

  set confirmColor(value: "accent" | "warn" | "primary" | "") {
    this._confirmColor = value;
  }

  get cancelText(): string {
    return this._cancelText;
  }

  set cancelText(value: string) {
    this._cancelText = value;
  }

  get confirmText(): string {
    return this._confirmText;
  }

  set confirmText(value: string) {
    this._confirmText = value;
  }

  /**
   * Factory method to create a preconfigured delete confirmation dialog.
   * @param type The type of entity being deleted (e.g., 'asset')
   * @param identifier The identifier/name of the entity
   */
  public static forDelete(type: string, identifier: string): ConfirmDialogModel {
    const dialogData = new ConfirmDialogModel("Deletion confirmation", `Please confirm you want to delete ${type} ${identifier}. This action cannot be undone.`)
    dialogData.confirmColor = "warn";
    dialogData.confirmText = "Delete";
    dialogData.cancelText = "Cancel";
    return dialogData;
  }
}
