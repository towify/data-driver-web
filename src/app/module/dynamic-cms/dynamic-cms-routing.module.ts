import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DynamicCmsComponent } from './dynamic-cms.component';

const routes: Routes = [
  {
    path: '',
    component: DynamicCmsComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicCmsRoutingModule {}
