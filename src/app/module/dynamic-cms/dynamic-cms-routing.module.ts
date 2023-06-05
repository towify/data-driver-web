import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DynamicCmsComponent } from './dynamic-cms.component';
import { ServiceUnavailableComponent } from './components/service-unavailable/service-unavailable.component';

const routes: Routes = [
  {
    path: '',
    component: DynamicCmsComponent
  },
  {
    path: 'service-unavailable',
    component: ServiceUnavailableComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicCmsRoutingModule {}
