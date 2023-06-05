/**
 * @Description:
 * @author xianti.xiong
 * @date 2022/11/18
 */

import { Directive } from '@angular/core';
import { Language } from '@towify/scf-engine';
import { LiveTable } from 'src/package-index/driver';
import { Subscription } from 'rxjs';

@Directive()
export abstract class DataDriverDataComponent {
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
    },
    {
      name: 'towify_file_driver',
      path: 'assets/toolbar/toolbar_file_driver_icon.svg'
    },
    {
      name: 'towify_photo_kit_pexels',
      path: 'assets/toolbar/toolbar_photo_kit_pexels_icon.svg'
    },
    {
      name: 'towify_photo_kit_unsplash',
      path: 'assets/toolbar/toolbar_photo_kit_unsplash_icon.svg'
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

  menuInfo?: LiveTable.ContentMenuInfoType & {
    hold: (key: LiveTable.ContentMenuResultType) => void;
  };
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
}
