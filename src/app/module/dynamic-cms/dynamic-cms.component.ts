import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicCmsService } from './dynamic-cms.service';
import { ToastService } from './service/toast.service';
import { SCF } from '@towify-serverless/scf-api/scf.info.list';
import { Commodity } from '@towify-types/user';

@Component({
  selector: 'lib-dynamic-cms',
  templateUrl: './dynamic-cms.component.html',
  styleUrls: ['./dynamic-cms.component.scss']
})
export class DynamicCmsComponent implements OnInit {
  appInfo: { applicationLogo: string; applicationTitle: string } = {
    applicationLogo: 'assets/icon/towify-logo.svg',
    applicationTitle: 'Project Name'
  };

  driverInfo: {
    id: string;
    name: string;
    domain: string;
    commodities: Commodity.Type[];
  } = {
    id: '',
    name: '',
    domain: '',
    commodities: []
  };

  constructor(
    public readonly service: DynamicCmsService,
    public readonly active: ActivatedRoute,
    private readonly toast: ToastService
  ) {}

  async ngOnInit() {
    await this.loadDriverInfoIdByDomain();
  }

  async loadDriverInfoIdByDomain(): Promise<void> {
    let domain = window.location.host;
    // TODO test info local host
    if (domain.startsWith('localhost')) {
      domain = '6384968b0b135713e6e2925f.towify.cn';
    }
    const result = await this.service.userService.scf.call<SCF.LiveTableGetDataDriverCmsInfo>({
      ignoreToken: true,
      method: 'post',
      params: { subdomain: domain },
      path: '/livetable/dataDriver/getCmsInfo'
    });
    if (result.data) {
      this.driverInfo = {
        id: result.data.id,
        name: result.data.name,
        domain: domain,
        commodities: []
      };
      this.appInfo = {
        applicationLogo: result.data.cmsLogo ?? this.appInfo.applicationLogo,
        applicationTitle: result.data.cmsName ?? this.appInfo.applicationTitle
      };
      await this.#loadDriverCommodity(this.driverInfo.id);
    } else {
      this.toast.showWarningMessage(result.errorMessage ?? 'Can not find driver info!');
    }
  }

  async #loadDriverCommodity(driverId: string): Promise<void> {
    const result =
      await this.service.userService.scf.call<SCF.CommodityGetCommodityResourceCommodities>({
        ignoreToken: true,
        method: 'get',
        params: { resourceId: driverId, resourceType: 'dataDriver' },
        path: '/commodity/resource/commodities'
      });
    this.driverInfo.commodities = result.data ?? [];
  }
}
