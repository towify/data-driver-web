/**
 * @author kaysaith
 * @date 2021/12/20
 */

export const cmsMessageName = {
  toolbarAction: 'toolbarAction',
  hideDefaultHeader: 'hideDefaultHeader',
  hideDefaultFooter: 'hideDefaultFooter',
  loggedIn: 'loggedIn',
  logout: 'logout',
  switchLanguage: 'switchLanguage'
};

export const localStorageKey = {
  dailyInvitationCode: 'DailyInvitationCodeKey',
  currentProjectId: 'currentProjectId',
  language: 'language',
  loginUserInfo: 'loginUserInfo',
  currentProjectJsonString: 'currentProjectJsonString'
};

export type DataType = 'Translation' | 'ErrorList';

export type TDSConfigType = {
  Translation: {
    tableId: string;
    fieldHashName: {
      key: string;
      enUS: string;
      zhCN: string;
    };
  };
  ErrorList: {
    tableId: string;
    fieldHashName: {
      code: string;
      enUS: string;
      zhCN: string;
      needToReport: string;
    };
  };
};

export type ImageUrlQuality = {
  full: string;
  raw: string;
  regular: string;
  small: string;
  thumb: string;
};


export type AppConfig = {
  api: string;
  appKey: string;
  tds: TDSConfigType;
};
