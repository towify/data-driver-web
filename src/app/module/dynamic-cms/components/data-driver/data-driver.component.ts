import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicCmsService } from '../../dynamic-cms.service';
import { Router } from '@angular/router';
import { DynamicCmsMessageService } from '../../service/dynamic-cms-message.service';
import { ImageUrlQuality, cmsMessageName } from '../../common/value';
import { MatMenuTrigger } from '@angular/material/menu';
import { LiveTable, LiveTableComponent, LiveTableService } from 'src/package-index/driver';
import { Language } from '@towify-serverless/scf-api';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebCsvParseService } from '@towify/web-csv-parser';
import { WebUploader } from 'src/package-index/web-uploader';
import { WebCsvParserManager } from '@towify/web-csv-parser/manager/web-csv-parser.manager';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '../../service/toast.service';
import { LiveDataService } from 'src/package-index/data-engine';
import { ResourceEnum } from '@towify-types/resource';
import { PhotoKit, PhotoKitComponent, PhotoKitService } from '@towify/photo-kit';
import { FieldValueEnum } from '@towify-types/live-data';
import { DataDriverDataComponent } from './data-driver-data.component';

@Component({
  selector: 'lib-data-driver',
  templateUrl: './data-driver.component.html',
  styleUrls: ['./data-driver.component.scss']
})
export class DataDriverComponent extends DataDriverDataComponent implements OnInit {
  @Input()
  driverId = '';

  @ViewChild('operateMenuTrigger')
  private operateMenuTrigger?: MatMenuTrigger;

  @ViewChild('dataDriver') dataDriver?: LiveTableComponent;

  @ViewChild('csvInput') csvInput?: ElementRef;

  #loadingRef?: MatDialogRef<any>;
  #photoKitInitialConfig?: PhotoKit.InitialType;

  constructor(
    public readonly service: DynamicCmsService,
    private readonly router: Router,
    private readonly message: DynamicCmsMessageService,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog,
    private readonly dataDriverService: LiveTableService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly toast: ToastService,
    private readonly photoKitService: PhotoKitService
  ) {
    super();
    this.toolbarIcons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
    this.service.headerToolbarActions = this.headerToolbarActions;
  }

  async ngOnInit() {
    const updateConfigHandler = async () => {
      const params = this.service.serviceInitialConfigParams();
      // 该初始化用于拉取 dataDriver model
      await LiveDataService.init({
        serverUrl: params.url,
        token: params.token,
        appKey: '',
        language: params.language,
        environment: <'web' | 'electron'>this.service.client,
        fileDriverId: '',
        dataDriverId: ''
      });
      LiveDataService.getInstance().scf.setExtraHeader(() => ({ client: this.service.client }));
      if (!this.driverId) return;
      const result = await LiveDataService.getInstance().dataDriver?.getById(this.driverId);
      if (result?.message || !result?.driver) {
        return;
      }
      this.driver = result.driver;
      this.dataDriverConfig = {
        apiUrl: this.service.baseUrl,
        token: this.service.token || '',
        driverId: this.driver.id,
        appKey: this.driver.appKey,
        language: this.service.language === 'zh_CN' ? Language.ZH : Language.EN,
        userId: this.service.user?.id ?? '',
        environment: this.service.client,
        fileDriverId: this.driver?.resource?.fileDriver ?? ''
      };
      this.extra = {
        canUsePayment: false,
        isEnterpriseUser: !!this.service.user?.usingAccount,
        tableLimit: -1,
        fieldPerTableLimit: -1,
        rowPerTableLimit: -1
      };
    };

    this.message.getMessage<boolean>(cmsMessageName.loggedIn).subscribe(async _ => {
      await updateConfigHandler();
    });
    this.message
      .getMessage<{ key: string; event: MouseEvent }>(cmsMessageName.toolbarAction)
      .subscribe(async result => {
        if (!result.key) {
          return;
        }
        switch (result.key) {
          case 'SideBar':
            this.dataDriver?.showSideNavigator();
            break;
          case 'GenerateTable':
            this.dataDriver?.showTableGeneratorDialog();
            break;
          case 'Filter':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.dataDriver?.showMenu('Filter', result.event);
            break;
          case 'HideFields':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.dataDriver?.showMenu('HideFields', result.event);
            break;
          case 'RowHeight':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.dataDriver?.showMenu('RowHeight', result.event);
            break;
          case 'importTableByCSV':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            if (this.csvInput) {
              const input = this.csvInput.nativeElement;
              input.value = '';
              input.click();
            }
            break;
          case 'Highlight':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.isHighlight = !this.isHighlight;
            break;
          case 'Primary':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.showPrimaryKey = !this.showPrimaryKey;
            break;
          case 'Refresh':
            this.dataDriver?.refreshCurrentTable();
            break;
          case 'Search':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.dataDriver?.showMenu('Search', result.event);
            break;
          case 'exportTableAsCSV':
            if (this.dataDriver?.isDashboardSelected) {
              return;
            }
            this.dataDriver?.exportToCsv();
            break;
          default:
            break;
        }
      });
    WebCsvParseService.init({
      apiUrl: this.service.baseUrl
    });
    this.observeAlertInfo();
    await updateConfigHandler();
  }

  ngOnDestroy() {
    this.showMenuObserve?.unsubscribe();
    this.showMenuObserve = undefined;
    WebUploader.init({
      apiUrl: this.service.baseUrl,
      token: this.service.token ?? '',
      environment: this.service.client,
      provider: 'file-driver',
      userType: 'user',
      filterDriverId: ''
    });
  }

  openSideNav() {
    this.isOpeningSideNavigator = !this.isOpeningSideNavigator;
    this.dataDriver?.showSideNavigator();
  }

  async chooseFile(fileList: FileList | null) {
    if (!fileList?.length) return;
    const firstFileIndex = 0;
    const file = fileList.item(firstFileIndex);
    if (!file) {
      return;
    }
    this.#showLoading();
    const csvParser = new WebCsvParserManager();
    // 路径应当是绝对路径
    const initErrorMessage = await csvParser.load(file);
    this.#hideLoading();
    if (initErrorMessage) {
      // handle error
      this.toast.showWarningMessage(initErrorMessage);
      return;
    }
    // 获取csv meta data交给前端展示
    this.dataDriver?.showImportTableDialogWithTableInfo(csvParser.getCSVData());
  }

  private observeAlertInfo() {
    const showContentMenu = (
      info: LiveTable.ContentMenuInfoType,
      hold: (key: LiveTable.ContentMenuResultType) => void
    ) => {
      this.menuInfo = { ...info, hold };
      const event = info.event as MouseEvent;
      this.menuPosition = {
        x: event.clientX - event.offsetX,
        y: event.clientY - event.offsetY,
        width: (<HTMLElement>event.target).clientWidth,
        height: (<HTMLElement>event.target).clientHeight
      };
      this.operateMenuTrigger?.openMenu();
    };
    this.dataDriverService.subscribe(async (info: any) => {
      if (info.usePayment) {
        return false;
      }
      if (info.tableLimit) {
        return false;
      }
      return new Promise<boolean>(resolve => {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '300px',
          data: {
            title: info.title,
            message: info.message
          }
        });
        dialogRef.afterClosed().subscribe((result: boolean) => {
          resolve(result);
        });
      });
    });

    this.dataDriverService.observeShowTips().subscribe(async (tipsInfo: any) => {
      this.translate.get([tipsInfo.message]).subscribe(info => {
        this.toast.showWarningMessage(info[tipsInfo.message] ?? tipsInfo.message);
      });
    });

    this.dataDriverService.observeShowContentMenu().subscribe((info: any) => {
      showContentMenu(info, key => {
        this.dataDriverService.closeContentMenu(key);
      });
    });

    this.dataDriverService.observeNativeLoading(result => {
      if (result['showLoading']) {
        this.#showLoading();
      } else {
        this.#hideLoading();
      }
    });

    this.dataDriverService.observeDataUpdated().subscribe(async info => {
      const { type, url } = info;
      if (
        type === LiveTable.EventEnum.CreateNewTableLimited ||
        type === LiveTable.EventEnum.CreateNewFieldLimited ||
        type === LiveTable.EventEnum.CreateNewTableFieldLimited ||
        type === LiveTable.EventEnum.CreateNewReferenceFieldLimited
      ) {
        const translateInfo = await this.service.getTranslateMap(['QT_XCD_INF']);
        this.toast.showWarningMessage(translateInfo['QT_XCD_INF']);
        return;
      }
      if (
        type === LiveTable.EventEnum.SelectLockedTable ||
        type === LiveTable.EventEnum.AddLockedTableDataRow ||
        type === LiveTable.EventEnum.EditLockedFieldName ||
        type === LiveTable.EventEnum.EditLockedFieldCell
      ) {
        await this.toast.showWarningMessage('Can not access or edit locked table resource!');
        return;
      }
      if (type === 'downloadURL') {
        if (window && url) {
          window.open(<string>url);
        }
      }
    });

    this.dataDriverService.chooseResourceSubscribe(async result => {
      return new Promise<string[]>(resolve => {
        const fileType = <FieldValueEnum>result['fileType'];
        if (!this.driver?.resource?.fileDriver) {
          resolve([]);
          return;
        }
        let fileTypes: ResourceEnum[];
        if (fileType === 'file') {
          fileTypes = [ResourceEnum.DMG, ResourceEnum.YML, ResourceEnum.ZIP, ResourceEnum.JSON];
        } else if (fileType === FieldValueEnum.Audio) {
          fileTypes = [ResourceEnum.Audio];
        } else if (fileType === FieldValueEnum.Video) {
          fileTypes = [ResourceEnum.Video];
        } else if (fileType === FieldValueEnum.Pdf) {
          fileTypes = [ResourceEnum.PDF];
        } else {
          fileTypes = [ResourceEnum.Image, ResourceEnum.Icon];
        }
        this.#selectResourceFromPhotoKitByFileType({
          fileDriverId: this.driver.resource.fileDriver,
          instanceId: this.driver.id,
          instanceType: 'dataDriver',
          fileTypes: fileTypes
        }).then(data => {
          if (data?.urls) {
            if (fileType === FieldValueEnum.MultipleImages || fileType === FieldValueEnum.Image) {
              resolve([data.urls.full]);
            } else {
              resolve([data.urls.full]);
            }
          } else {
            resolve([]);
          }
        });
      });
    });

    this.photoKitService.observeMessage().subscribe(result => {
      const { showMessage, message } = result;
      if (showMessage) {
        this.toast.showWarningMessage(<string>message);
        return;
      }
    });
    this.photoKitService.observeDataUpdated().subscribe(async info => {
      const { type } = info;
      if (type === PhotoKit.EventEnum.OpenKitStore) {
        window.open('https://www.towify.com/#/template');
      }
    });
  }

  onMenuActionClicked(actionKey: string | number) {
    this.menuInfo?.hold(actionKey);
    this.operateMenuTrigger?.closeMenu();
    this.menuInfo = undefined;
  }

  #showLoading(): void {
    if (this.#loadingRef) this.#loadingRef.close();
    this.#loadingRef = this.dialog.open(LoadingDialogComponent, {
      width: '300px',
      height: '200px'
    });
  }

  #hideLoading(): void {
    this.#loadingRef?.close();
  }

  async #selectResourceFromPhotoKitByFileType(params: {
    fileDriverId: string;
    instanceId: string;
    instanceType: 'project' | 'dataDriver';
    fileTypes?: ResourceEnum[];
  }): Promise<
    { urlType: 'link' | 'svg'; id: string; urls?: ImageUrlQuality; svgContent?: string } | undefined
  > {
    return new Promise<
      | { urlType: 'link' | 'svg'; id: string; urls?: ImageUrlQuality; svgContent?: string }
      | undefined
    >(resolve => {
      this.#photoKitInitialConfig = {
        apiUrl: this.service.baseUrl,
        token: this.service.token || '',
        userId: this.service.user?.id || '',
        fileDriverId: params.fileDriverId,
        instanceId: params.instanceId,
        instanceType: params.instanceType,
        platformKeys: {
          pexels: '563492ad6f91700001000001825479c737344c4bae47de27d827d493',
          unsplash: 'enbifwZ71DbikK2-Aku_HNRX4O0nNUbUsh5qMx7bo_E'
        },
        language: this.service.language === 'en_US' ? Language.EN : Language.ZH,
        fileTypes: params.fileTypes,
        environment: <any>this.service.client,
        installedKits: [],
        disabledTabs: ['Icon']
      };
      const dialogRef = this.dialog.open(PhotoKitComponent, {
        width: '90vw',
        maxWidth: '960px',
        hasBackdrop: true,
        maxHeight: '85vh',
        minHeight: '85vh',
        height: '85vh',
        data: {
          initialConfig: this.#photoKitInitialConfig
        }
      });
      dialogRef.componentInstance.onSelectedPhoto.subscribe(
        async (data: {
          urls?: ImageUrlQuality;
          id: string;
          content?: string;
          platform: PhotoKit.TabType;
        }) => {
          this.#photoKitInitialConfig = undefined;
          if (data.platform === 'Icon') {
            resolve({ urlType: 'svg', id: data.id, svgContent: data.content });
          } else {
            resolve({ urlType: 'link', id: data.id, urls: data.urls });
          }
        }
      );
      dialogRef.componentInstance.cancelSelect.subscribe(() => {
        this.#photoKitInitialConfig = undefined;
        resolve(undefined);
      });
    });
  }
}
