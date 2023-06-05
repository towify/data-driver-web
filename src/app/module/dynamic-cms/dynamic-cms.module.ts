import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DynamicCmsComponent } from './dynamic-cms.component';
import { LiveTableModule } from 'src/package-index/driver';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { TowifyLoadingModule } from '@towify/components';
import { HeaderComponent } from './components/header/header.component';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DataDriverComponent } from './components/data-driver/data-driver.component';
import { DynamicCmsRoutingModule } from './dynamic-cms-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicCmsMessageService } from './service/dynamic-cms-message.service';
import { DynamicCmsService } from './dynamic-cms.service';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { IframeUrlDirective } from './common/directive/iframe-url.directive';
import { CmsLoginComponent } from './components/cms-login/cms-login.component';
import { ToastComponent } from './components/toast/toast.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ServiceUnavailableComponent } from './components/service-unavailable/service-unavailable.component';

@NgModule({
  declarations: [
    DynamicCmsComponent,
    HeaderComponent,
    DataDriverComponent,
    ConfirmationDialogComponent,
    LoadingDialogComponent,
    IframeUrlDirective,
    CmsLoginComponent,
    ToastComponent,
    ServiceUnavailableComponent
  ],
  imports: [
    CommonModule,
    LiveTableModule,
    TranslateModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    TowifyLoadingModule,
    NgbModule,
    NgbDropdownModule,
    DynamicCmsRoutingModule,
    TranslateModule
  ],
  exports: [],
  providers: [DynamicCmsMessageService, DynamicCmsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DynamicCmsModule {}
