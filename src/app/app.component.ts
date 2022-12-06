import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicCmsService } from './module/dynamic-cms/dynamic-cms.service';
import { Shared } from 'soid-data';
import { DataDriverStorageService } from './module/dynamic-cms/service/data.driver.storage.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'towify-dynamic-cms';
  constructor(
    private readonly cmsService: DynamicCmsService,
    private readonly translate: TranslateService,
    private readonly dataDriverService: DataDriverStorageService
  ) {
    if (this.cmsService.language === 'en_US') {
      this.translate.setDefaultLang('en_US');
    } else {
      this.translate.setDefaultLang('zh_CN');
    }
  }

  async ngOnInit() {
    this.translate.setDefaultLang(
      this.translate.getBrowserCultureLang() === 'zh-CN' ? 'zh_CN' : 'en_US'
    );
    await this.dataDriverService.init();
  }
}
