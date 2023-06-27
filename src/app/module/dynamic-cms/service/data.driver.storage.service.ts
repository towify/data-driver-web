/**
 * @author Michael
 * @date Jul 31, 2022.
 */

import { Injectable } from '@angular/core';
import { DynamicCmsService } from '../dynamic-cms.service';
import { TDS } from 'towify-data-driver-storage';
import type { DataType, TDSConfigType } from '../common/value';
import { QueryManager } from 'towify-data-driver-storage/manager/query.manager';
import { TranslateService } from '@ngx-translate/core';
import { TDSManager } from 'towify-data-driver-storage/manager/tds.manager';
import { Shared } from 'soid-data';

// export type MultipleLanguageType = { [languageKey in 'en_US' | 'zh_CN']: string };

@Injectable({
  providedIn: 'root'
})
export class DataDriverStorageService {
  public readonly tds!: TDSManager;
  readonly #appKey = '53f1ac48924b16cf6b65d55c548b38bd';
  readonly #localStorageKey = 'translation';
  readonly tableConfig: TDSConfigType = {
    Translation: {
      tableId: '62df6446ade075f4b96f15c1',
      fieldHashName: {
        key: 'MVMETfx7KXlBWXiN',
        enUS: 'SgrwAUeuj3GiJMhy',
        zhCN: 'mDwrv99i7w2iyDeW'
      }
    },
    ErrorList: {
      tableId: '62e8c59985d5fadb0132130d',
      fieldHashName: {
        code: 'r91QWMya1RbFqQpp',
        enUS: 'sZXAztNi04QikEpo',
        zhCN: 'lD9x5Z73j3GFGH6V',
        needToReport: 'irRMrBo8zl84xfsC'
      }
    }
  };

  readonly queryMap!: {
    readonly [key in DataType]: QueryManager;
  };

  constructor(
    private readonly commonService: DynamicCmsService,
    private readonly translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(async () => {
      await this.#loadErrorListTable(<'en_US' | 'zh_CN'>this.translate.currentLang);
    });
    this.tds = new TDSManager({
      appKey: this.#appKey,
      url: this.commonService.productionConfig.api
    });
    this.queryMap = {
      Translation: new TDS.Table(this.tableConfig.Translation.tableId, this.tds).query,
      ErrorList: new TDS.Table(this.tableConfig.ErrorList.tableId, this.tds).query
    };
  }

  async init(): Promise<void> {
    await this.#loadTranslateInfo();
    await this.#loadErrorListTable(this.commonService.language, true);
  }

  async #loadErrorListTable(language: 'en_US' | 'zh_CN', force = false) {
    const errorListKey = 'towify-errors';
    if (!force) {
      if (localStorage.getItem(errorListKey)?.length) return;
    }
    const result = await this.queryMap.ErrorList.find();
    if (!result.data?.list) return;
    const errorListInfo: { [key: number]: { message: string; needToReport: boolean } } = {};
    result.data.list.forEach(item => {
      errorListInfo[<number>item[<string>this.tableConfig.ErrorList.fieldHashName.code!]] = {
        message:
          language === 'en_US'
            ? <string>item[<string>this.tableConfig.ErrorList.fieldHashName.enUS!]
            : <string>item[<string>this.tableConfig.ErrorList.fieldHashName.zhCN!],
        needToReport: <boolean>item[<string>this.tableConfig.ErrorList.fieldHashName.needToReport!]
      };
    });
    localStorage.setItem(errorListKey, JSON.stringify(errorListInfo));
  }

  async #loadTranslateInfo(): Promise<void> {
    const translation = await this.queryMap.Translation.skip(5000).find();
    await Shared.save(this.#localStorageKey, JSON.stringify(translation));
    const enUSMap: { [key: string]: string } = {};
    const zhCNMap: { [key: string]: string } = {};
    const fieldHashNameMap = this.tableConfig.Translation.fieldHashName;
    translation.data?.list.forEach(item => {
      const key: string = `${item[<string>fieldHashNameMap.key]}`;
      enUSMap[key] = <string>item[<string>fieldHashNameMap.enUS];
      zhCNMap[key] = <string>item[<string>fieldHashNameMap.zhCN];
    });
    this.translate.setTranslation('en_US', enUSMap);
    this.translate.setTranslation('zh_CN', zhCNMap);
    if (this.commonService.language === 'en_US') this.translate.setDefaultLang('en_US');
    else this.translate.setDefaultLang('zh_CN');
  }
}
