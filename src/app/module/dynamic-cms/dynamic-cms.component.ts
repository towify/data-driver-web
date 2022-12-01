import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicCmsService } from './dynamic-cms.service';
import { ProjectCMS } from '@towify-serverless/user-cms-scf-api';
import { ToastService } from './service/toast.service';

@Component({
  selector: 'lib-dynamic-cms',
  templateUrl: './dynamic-cms.component.html',
  styleUrls: ['./dynamic-cms.component.scss']
})
export class DynamicCmsComponent implements OnInit {
  projectId = '';
  qrCodeURL = '';
  appInfo: { applicationLogo: string; applicationTitle: string } = {
    applicationLogo: 'assets/icon/towify-logo.svg',
    applicationTitle: 'Project Name CMS'
  };

  constructor(
    public readonly service: DynamicCmsService,
    public readonly active: ActivatedRoute,
    private readonly toast: ToastService
  ) {}

  async ngOnInit() {
    await this.loadProjectInfoIdByDomain();
  }

  async loadProjectInfoIdByDomain(): Promise<void> {
    const result = await this.service.userService.scf.call<ProjectCMS.GetProjectCmsInfo>({
      ignoreToken: true,
      method: 'get',
      params: { domain: window.location.host },
      path: '/project/cms/info'
    });
    if (result.data) {
      this.projectId = result.data.projectId;
      this.appInfo = {
        applicationLogo: result.data.applicationLogo ?? this.appInfo.applicationLogo,
        applicationTitle: result.data.applicationTitle ?? this.appInfo.applicationTitle
      };
    } else {
      this.toast.showWarningMessage(result.errorMessage ?? 'Can not find project!');
    }
  }
}
