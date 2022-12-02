import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicCmsService } from './dynamic-cms.service';
import { ToastService } from './service/toast.service';
import { SCF } from '@towify-serverless/scf-api/scf.info.list';

@Component({
  selector: 'lib-dynamic-cms',
  templateUrl: './dynamic-cms.component.html',
  styleUrls: ['./dynamic-cms.component.scss']
})
export class DynamicCmsComponent implements OnInit {
  appInfo: {
    driverId: string;
    name: string;
    cmsLogo: string;
    cmsName: string;
    domain: string;
  } = {
    driverId: '',
    name: '',
    domain: '',
    cmsLogo: 'assets/icon/towify-logo.svg',
    cmsName: 'Driver Name CMS'
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
    const domain = window.location.host;
    const result = await this.service.userService.scf.call<SCF.LiveTableGetDataDriverCmsInfo>({
      ignoreToken: true,
      method: 'post',
      params: { subdomain: domain },
      path: '/livetable/dataDriver/getCmsInfo'
    });
    if (result.data) {
      this.appInfo = {
        driverId: result.data.id,
        name: result.data.name,
        domain: domain,
        cmsLogo: result.data.cmsLogo ?? this.appInfo.cmsLogo,
        cmsName: result.data.cmsName ?? this.appInfo.cmsName
      };
    } else {
      this.toast.showWarningMessage(result.errorMessage ?? 'Can not find driver info!');
    }
  }
}
