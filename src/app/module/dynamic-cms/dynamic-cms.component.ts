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
  appInfo: { applicationLogo: string; applicationTitle: string } = {
    applicationLogo: 'assets/icon/towify-logo.svg',
    applicationTitle: 'Project Name'
  };

  driverInfo: {
    id: string;
    name: string;
    domain: string;
  } = {
    id: '',
    name: '',
    domain: ''
  };

  constructor(
    public readonly service: DynamicCmsService,
    public readonly active: ActivatedRoute,
    private readonly toast: ToastService
  ) {}

  async ngOnInit() {
    // await this.loadDriverInfoIdByDomain();
    // TODO test info local host run
    this.driverInfo = {
      name: 'Untitled',
      domain: '6384968b0b135713e6e2925f.towify.cn',
      id: '6384968b0b135713e6e2925f'
    };
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
      this.driverInfo = {
        id: result.data.id,
        name: result.data.name,
        domain: domain
      };
      this.appInfo = {
        applicationLogo: result.data.cmsLogo ?? this.appInfo.applicationLogo,
        applicationTitle: result.data.cmsName ?? this.appInfo.applicationTitle
      };
    } else {
      this.toast.showWarningMessage(result.errorMessage ?? 'Can not find driver info!');
    }
  }
}
