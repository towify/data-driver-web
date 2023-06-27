import { Injectable } from '@angular/core';
import { UserService } from '@towify/user-engine';
import { Shared } from 'soid-data';
import { AppConfig, localStorageKey } from './common/value';
import { TranslateService } from '@ngx-translate/core';
import { WebUploader } from 'src/package-index/web-uploader';
import { ErrorEnum, Language } from '@towify/scf-engine';
import { errors } from '@towify/scf-engine/type/common.value';
import { DynamicCmsMessageService } from './service/dynamic-cms-message.service';
import { cmsMessageName } from './common/value';
import packageJson from '../../../../package.json';
import urlConfig from '../../../towify.config.json';

@Injectable({
  providedIn: 'root'
})
export class DynamicCmsService {
  public userService: UserService;
  public isLoggedIn = false;
  public isLoadingLocalUser = false;
  isLoginLoading = false;
  #currentLanguage?: 'en_US' | 'zh_CN';
  #client: 'web' | 'electron' | 'projectCms' = 'projectCms';
  headerToolbarActions: {
    icon: string;
    key: string;
    isSelected: boolean;
    tooltip: string;
    isSpace: boolean;
  }[] = [
    {
      icon: '',
      key: '',
      isSelected: false,
      tooltip: '',
      isSpace: true
    }
  ];

  public readonly config!: AppConfig;

  get isProduction() {
    return packageJson.environment === 'main';
  }

  get baseUrl() {
    return this.config.api;
  }

  get developmentConfig() {
    return <AppConfig>(packageJson.platform === 'cos' ? urlConfig.test : urlConfig['aws-test']);
  }

  get productionConfig() {
    return <AppConfig>(
      (packageJson.platform === 'cos' ? urlConfig.product : urlConfig['aws-product'])
    );
  }

  get user() {
    return this.userService?.current;
  }

  get token() {
    if (!this.isLoggedIn) {
      return undefined;
    }
    return this.user ? this.userService?.token : undefined;
  }

  get client() {
    return this.#client;
  }

  get language(): 'en_US' | 'zh_CN' {
    if (!this.#currentLanguage) {
      let language = Shared.get(localStorageKey.language);
      if (!language || (language !== 'en_US' && language !== 'zh_CN')) {
        language = this.translateService.getBrowserLang() === 'en' ? 'en_US' : 'zh_CN';
        Shared.save(localStorageKey.language, language).then();
      }
      this.#currentLanguage = <'en_US' | 'zh_CN'>language;
    }
    return this.#currentLanguage!;
  }

  set language(lan) {
    this.#currentLanguage = lan;
    Shared.save(localStorageKey.language, lan).then();
    this.configServices().then(() => {
      this.message.notify<'en_US' | 'zh_CN'>(cmsMessageName.switchLanguage, this.#currentLanguage);
    });
  }

  constructor(
    private readonly message: DynamicCmsMessageService,
    private readonly translateService: TranslateService,
    private readonly translate: TranslateService
  ) {
    this.config = this.isProduction ? this.productionConfig : this.developmentConfig;
    this.userService = UserService.init({
      url: this.baseUrl,
      language: this.language === 'en_US' ? Language.EN : Language.ZH,
      environment: this.#client
    });
    if (this.userService.token) {
      this.isLoggedIn = true;
    }
    this.loadLoginInfo().then();
  }

  public async forceReloadUserInfo(): Promise<void> {
    if (!this.isLoggedIn || !this.userService) return;
    await this.userService.getUserInfo();
  }

  private async loadLoginInfo() {
    if (!this.userService) {
      return;
    }
    this.isLoadingLocalUser = true;
    if (this.user) {
      this.isLoggedIn = true;
      const result = await this.userService.getUserInfo();
      const loginCheckResult = await this.loginStatusCheckByRequestResult(result);
      if (!loginCheckResult) {
        await this.logOut();
        this.message.notify(cmsMessageName.logout);
        this.isLoadingLocalUser = false;
        return;
      }
      Shared.save(
        localStorageKey.loginUserInfo,
        JSON.stringify({ name: this.user.username, avatar: this.user.avatar })
      ).then();
      await this.configServices();
      this.isLoadingLocalUser = false;
      this.message.notify(cmsMessageName.loggedIn, true);
    } else {
      await this.logOut();
      this.isLoadingLocalUser = false;
      this.message.notify(cmsMessageName.logout);
    }
  }

  public async logOut() {
    this.isLoggedIn = false;
    localStorage.clear();
    await UserService.instance.logOut();
    this.userService = UserService.init({
      url: this.baseUrl,
      language: this.language === 'en_US' ? Language.EN : Language.ZH,
      environment: this.#client
    });
    await this.configServices();
  }

  public async updateLoginInfo(): Promise<void> {
    this.isLoginLoading = false;
    this.isLoggedIn = true;
    await this.configServices();
    this.message.notify(cmsMessageName.loggedIn, true);
  }

  private async configServices(): Promise<void> {
    WebUploader.init({
      apiUrl: this.baseUrl,
      token: this.token ?? '',
      provider: 'file-driver',
      userType: 'user',
      filterDriverId: '',
      environment: this.#client
    });
  }

  public serviceInitialConfigParams(): {
    url: string;
    token: string;
    userId: string;
    language: Language;
    environment?: 'web' | 'electron' | 'projectCms';
  } {
    const language: Language = this.language === 'en_US' ? Language.EN : Language.ZH;
    return {
      url: this.baseUrl,
      token: this.token || '',
      userId: this.user?.id || '',
      language: language,
      environment: this.#client
    };
  }

  /** 校验请求数据，如果出现错误消息 是认证失败， 或者解密 key 异常则退出登录 **/
  public async loginStatusCheckByRequestResult(result?: { message?: string }): Promise<boolean> {
    if (
      result?.message ===
        this.userService.scf.errorManager.getMessage({
          code: 10002
        }) ||
      result?.message === errors.invalidCrypto
    ) {
      await this.logOut();
      return false;
    }
    return true;
  }

  public getRequestErrorMessageByCode(code: number = -1): string {
    return this.userService.scf.errorManager.getMessage({
      code: <ErrorEnum>code
    });
  }

  async getTranslateMap(keys: string[]): Promise<{ [key: string]: string }> {
    return new Promise<{ [key: string]: string }>(resolve => {
      const keyMap: { [key: string]: string } = {};
      const allKeys = [...keys, 'CNFRM', 'CNCL', 'GT_T'];
      this.translate.get(allKeys).subscribe(info => {
        allKeys.forEach(key => {
          keyMap[key] = info[key] ?? key;
        });
        resolve(keyMap);
      });
    });
  }
}
