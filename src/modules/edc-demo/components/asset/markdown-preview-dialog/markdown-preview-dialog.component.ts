import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Dialog component that previews Markdown-formatted text.
 */
@Component({
  selector: 'app-markdown-preview-dialog',
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">{{ 'assetEditor.descriptionPreviewTitle' | translate }}</h2>
    </div>

    <mat-dialog-content>
      <markdown [data]="data.markdownText"></markdown>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button class="create-button" mat-dialog-close>
        {{ 'assetEditor.close' | translate }}
      </button>
    </mat-dialog-actions>
  `
})
export class MarkdownPreviewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { markdownText: string }) {}
}
