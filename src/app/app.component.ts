import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicCmsService } from './module/dynamic-cms/dynamic-cms.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'towify-dynamic-cms';
  constructor(
    private readonly cmsService: DynamicCmsService,
    private readonly translate: TranslateService
  ) {
    if (this.cmsService.language === 'en_US') {
      this.translate.setDefaultLang('en_US');
    } else {
      this.translate.setDefaultLang('zh_CN');
    }
  }
}
