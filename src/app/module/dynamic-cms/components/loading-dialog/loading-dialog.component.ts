/*
 * @author kaysaith
 * @date 2021/4/03 13:37
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.scss']
})
export class LoadingDialogComponent implements OnInit {
  constructor(public readonly dialogRef: MatDialogRef<LoadingDialogComponent>) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
