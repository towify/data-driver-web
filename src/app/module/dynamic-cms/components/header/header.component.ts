import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { DynamicCmsService } from '../../dynamic-cms.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { Shared } from 'soid-data';
import { localStorageKey } from '../../common/value';
import { cmsMessageName } from '../../common/value';
import { DynamicCmsMessageService } from '../../service/dynamic-cms-message.service';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input()
  isFixed = false;

  @Input()
  appInfo: { applicationLogo: string; applicationTitle: string } = {
    applicationLogo: 'assets/icon/towify-logo.svg',
    applicationTitle: 'Project Name'
  };

  @Input()
  showMenu = false;

  @Output()
  clickMenu = new EventEmitter();

  @Output()
  showLoginOverlay = new EventEmitter();

  language: 'English' | '中文' = 'English';

  loginUserInfo?: { name: string; avatar: string };

  constructor(
    public readonly service: DynamicCmsService,
    public readonly message: DynamicCmsMessageService,
    public readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    const loginUserInfoString = Shared.get(localStorageKey.loginUserInfo);
    this.loginUserInfo = loginUserInfoString ? JSON.parse(loginUserInfoString) : undefined;
    this.language = this.service.language === 'en_US' ? 'English' : '中文';
  }

  ngOnInit(): void {}

  async onLogoutClicked(): Promise<void> {
    await this.service.logOut();
  }

  public onToolbarActionClicked(key: string, event: MouseEvent): void {
    this.message.notify(cmsMessageName.toolbarAction, { event, key });
  }

  setLanguage(languageType: 'English' | '中文') {
    this.language = languageType;
    if (languageType === '中文') {
      this.translateService.use('zh_CN');
      this.service.language = 'zh_CN';
    } else {
      this.translateService.use('en_US');
      this.service.language = 'en_US';
    }
  }
}
