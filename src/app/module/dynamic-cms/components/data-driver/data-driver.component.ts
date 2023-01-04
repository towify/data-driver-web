import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicCmsService } from '../../dynamic-cms.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicCmsMessageService } from '../../service/dynamic-cms-message.service';
import { ImageUrlQuality, cmsMessageName } from '../../common/value';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  ContentMenuInfoType,
  ContentMenuResultType,
  DataDriverEventEnum,
  LiveTableComponent,
  LiveTableService
} from '@towify/data-driver';
import { Language } from '@towify-serverless/scf-api';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebCsvParseService } from '@towify/web-csv-parser';
import { WebUploader } from '@towify/web-uploader';
import { WebCsvParserManager } from '@towify/web-csv-parser/manager/web-csv-parser.manager';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ToastService } from '../../service/toast.service';
import { LiveDataService } from '@towify/data-engine';
import { ResourceEnum } from '@towify-types/resource';
import { PhotoKitComponent } from '@towify/photo-kit';
import { FieldValueEnum } from '@towify-types/live-data';

@Component({
  selector: 'lib-data-driver',
  templateUrl: './data-driver.component.html',
  styleUrls: ['./data-driver.component.scss']
})
export class DataDriverComponent implements OnInit {
  @Input()
  driverId = '';

  @ViewChild('operateMenuTrigger')
  private operateMenuTrigger?: MatMenuTrigger;

  @ViewChild('dataDriver') dataDriver?: LiveTableComponent;

  @ViewChild('csvInput') csvInput?: ElementRef;

  isShowUpgradePlan = true;
  isHighlight = false;
  showPrimaryKey = false;
  isOpeningSideNavigator = false;
  dataDriverConfig?: {
    apiUrl: string;
    token: string;
    driverId: string;
    appKey: string;
    userId: string;
    language: Language;
    fileDriverId: string;
    fileDriverPermissions?: ('view' | 'create' | 'update' | 'delete' | string)[];
    sharedProjectId?: string;
    sharedOwnerPermissions?: ('view' | 'create' | 'update' | 'delete' | string)[];
    environment?: 'web' | 'electron' | 'projectCms';
  };

  extra: {
    canUsePayment: boolean;
    isEnterpriseUser: boolean;
    tableLimit: number;
    fieldPerTableLimit: number;
    rowPerTableLimit: number;
  } = {
    canUsePayment: false,
    isEnterpriseUser: false,
    tableLimit: -1,
    fieldPerTableLimit: -1,
    rowPerTableLimit: -1
  };

  toolbarIcons: { name: string; path: string }[] = [
    {
      name: 'toolbar_side_bar',
      path: 'assets/live-table.icons/side_bar_icon.svg'
    },
    {
      name: 'toolbar_table',
      path: 'assets/live-table.icons/toolbar_table_icon.svg'
    },
    {
      name: 'toolbar_filter',
      path: 'assets/live-table.icons/towify-live-table-add-filter.svg'
    },
    {
      name: 'toolbar_sort',
      path: 'assets/live-table.icons/towify-live-table-sort.svg'
    },
    {
      name: 'toolbar_row_height',
      path: 'assets/live-table.icons/towify-live-table-row-height.svg'
    },
    {
      name: 'toolbar_csv',
      path: 'assets/live-table.icons/toolbar_csv_icon.svg'
    },
    {
      name: 'toolbar_export_csv',
      path: 'assets/live-table.icons/towify-live-table-download.svg'
    },
    {
      name: 'toolbar_highlight',
      path: 'assets/live-table.icons/toolbar-highlight-icon.svg'
    },
    {
      name: 'toolbar_show_primary',
      path: 'assets/live-table.icons/toolbar-show-primary-icon.svg'
    },
    {
      name: 'toolbar_data_driver_refresh',
      path: 'assets/live-table.icons/towify-live-table-refresh.svg'
    },
    {
      name: 'toolbar_data_driver_search',
      path: 'assets/live-table.icons/towify-live-table-search.svg'
    }
  ];

  headerToolbarActions: {
    icon: string;
    key: string;
    isSelected: boolean;
    tooltip: string;
    isSpace: boolean;
  }[] = [
    {
      icon: 'toolbar_side_bar',
      key: 'SideBar',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_table',
      key: 'GenerateTable',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_filter',
      key: 'Filter',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_sort',
      key: 'HideFields',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_row_height',
      key: 'RowHeight',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_csv',
      key: 'importTableByCSV',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_export_csv',
      key: 'exportTableAsCSV',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: '',
      key: '',
      isSelected: false,
      tooltip: '',
      isSpace: true
    },
    {
      icon: 'toolbar_highlight',
      key: 'Highlight',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_show_primary',
      key: 'Primary',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_data_driver_refresh',
      key: 'Refresh',
      isSelected: false,
      tooltip: '',
      isSpace: false
    },
    {
      icon: 'toolbar_data_driver_search',
      key: 'Search',
      isSelected: false,
      tooltip: '',
      isSpace: false
    }
  ];

  #loadingRef?: MatDialogRef<any>;
  menuInfo?: ContentMenuInfoType & { hold: (key: ContentMenuResultType) => void };
  menuPosition: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 1,
    height: 1
  };

  showMenuObserve?: Subscription;
  driver?: {
    appKey: string;
    id: string;
    resource: {
      [module in 'fileDriver']: string;
    };
  };

  constructor(
    public readonly service: DynamicCmsService,
    private readonly router: Router,
    public readonly active: ActivatedRoute,
    private readonly message: DynamicCmsMessageService,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog,
    private readonly dataDriverService: LiveTableService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly toast: ToastService
  ) {
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
            this.dataDriver?.showMenu('Filter', result.event);
            break;
          case 'HideFields':
            this.dataDriver?.showMenu('HideFields', result.event);
            break;
          case 'RowHeight':
            this.dataDriver?.showMenu('RowHeight', result.event);
            break;
          case 'importTableByCSV':
            if (this.csvInput) {
              const input = this.csvInput.nativeElement;
              input.value = '';
              input.click();
            }
            break;
          case 'Highlight':
            this.isHighlight = !this.isHighlight;
            break;
          case 'Primary':
            this.showPrimaryKey = !this.showPrimaryKey;
            break;
          case 'Refresh':
            this.dataDriver?.refreshCurrentTable();
            break;
          case 'Search':
            this.dataDriver?.showMenu('Search', result.event);
            break;
          case 'toolbar_export_csv':
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
      info: ContentMenuInfoType,
      hold: (key: ContentMenuResultType) => void
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
        type === DataDriverEventEnum.CreateNewTableLimited ||
        type === DataDriverEventEnum.CreateNewFieldLimited ||
        type === DataDriverEventEnum.CreateNewTableFieldLimited ||
        type === DataDriverEventEnum.CreateNewReferenceFieldLimited
      ) {
        const translateInfo = await this.service.getTranslateMap(['QT_XCD_INF']);
        this.toast.showWarningMessage(translateInfo['QT_XCD_INF']);
        return;
      }
      if (
        type === DataDriverEventEnum.SelectLockedTable ||
        type === DataDriverEventEnum.AddLockedTableDataRow ||
        type === DataDriverEventEnum.EditLockedFieldName ||
        type === DataDriverEventEnum.EditLockedFieldCell
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
          fileTypes = [ResourceEnum.Image];
        }
        this.#selectResourceFromPhotoKitByFileType({
          fileDriverId: this.driver.resource.fileDriver,
          instanceId: this.driver.id,
          instanceType: 'dataDriver',
          fileTypes: fileTypes
        }).then(data => {
          if (data?.urls) {
            if (fileType === FieldValueEnum.MultipleImages || fileType === FieldValueEnum.Image) {
              resolve([data.selectedCropUrl ?? data.urls.full]);
            } else {
              resolve([data.urls.full]);
            }
          } else {
            resolve([]);
          }
        });
      });
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
  }): Promise<{ urls?: ImageUrlQuality; id?: string; selectedCropUrl?: string }> {
    return new Promise<{ urls?: ImageUrlQuality; id?: string; selectedCropUrl?: string }>(
      resolve => {
        const dialogRef = this.dialog.open(PhotoKitComponent, {
          width: '80%'
        });
        dialogRef.componentInstance.init({
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
          environment: <any>this.service.client
        });
        dialogRef.componentInstance.onSelectedPhoto.subscribe(
          async (data: { urls: ImageUrlQuality; id: string; selectedCropUrl?: string }) => {
            resolve(data);
          }
        );
        dialogRef.afterClosed().subscribe(() => {
          if (!dialogRef.componentInstance.selectedImage) {
            resolve({});
          }
        });
      }
    );
  }
}
