import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AssetInput, Asset } from "../../../../mgmt-api-client/model";
import {AssetService} from "../../../../mgmt-api-client";
import {AssetEditorDialog} from "../asset-editor-dialog/asset-editor-dialog.component";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../../confirmation-dialog/confirmation-dialog.component";
import {NotificationService} from "../../../services/notification.service";
import {AssetDetailsDialogComponent} from "../asset-details-dialog/asset-details-dialog.component";
import { NS, CONTEXT_MAP } from '../../namespaces';

@Component({
  selector: 'edc-demo-asset-viewer',
  templateUrl: './asset-viewer.component.html',
  styleUrls: ['./asset-viewer.component.scss']
})
export class AssetViewerComponent implements OnInit {

  filteredAssets$: Observable<Asset[]> = of([]);
  searchText = '';
  isTransferring = false;
  private fetch$ = new BehaviorSubject(null);

  constructor(private assetService: AssetService,
              private notificationService: NotificationService,
              private readonly dialog: MatDialog,) {
}

  private showError(error: string, errorMessage: string) {
    this.notificationService.showError(errorMessage);
    console.error(error);
  }

  ngOnInit(): void {
    this.filteredAssets$ = this.fetch$
      .pipe(
        switchMap(() => {
          const assets$ = this.assetService.requestAssets();
          return !!this.searchText
            ? assets$.pipe(map(assets => assets.filter(asset => asset.properties.optionalValue<string>('edc', 'name')?.includes(this.searchText))))
            : assets$;
        }));
  }

  getShortDescription(asset: Asset): string {
    const desc = asset.properties.optionalValue('dcterms', 'description');
    if (typeof desc === 'string') {
      return desc.length > 50 ? desc.slice(0, 50) + '...' : desc;
    }
    return '';
  }


  isBusy() {
    return this.isTransferring;
  }

  onSearch() {
    this.fetch$.next(null);
  }

  openAssetDialog(asset: Asset) {
    const dialogRef = this.dialog.open(AssetDetailsDialogComponent, {
      data: {asset}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.delete) {
        this.onDelete(asset);
      }
    });
  }

  onDelete(asset: Asset) {
    const dialogData = ConfirmDialogModel.forDelete("asset", `"${asset.id}"`)
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      data: dialogData
    });

    ref.afterClosed().subscribe({
      next: res => {
        if (res) {
          this.assetService.removeAsset(asset.id).subscribe({
            next: () => this.fetch$.next(null),
            error: err => this.showError(err, "This asset cannot be deleted"),
            complete: () => this.notificationService.showInfo("Successfully deleted")
          });
        }
      }
    });
  }

  onCreate() {
    const dialogRef = this.dialog.open(AssetEditorDialog);
    dialogRef.afterClosed().pipe(first()).subscribe((result: { assetInput?: AssetInput }) => {
      const newAsset = result?.assetInput;
      if (newAsset) {
        this.assetService.createAsset(newAsset).subscribe({
          next: ()=> this.fetch$.next(null),
          error: err => this.showError(err, 'Asset creation failed. The input may contain restricted characters, especially in icon-related fields. Please verify and correct the input before retrying.'),
          complete: () => this.notificationService.showInfo("Successfully created"),
        })
      }
  })
}
}
