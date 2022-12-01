import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicCmsService } from '../../dynamic-cms.service';
import { Project } from '@towify-serverless/user-cms-scf-api';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'lib-cms-login',
  templateUrl: './cms-login.component.html',
  styleUrls: ['./cms-login.component.scss']
})
export class CmsLoginComponent implements OnChanges {
  @Input()
  projectId = '';

  @Input()
  appInfo: { applicationLogo: string; applicationTitle: string } = {
    applicationLogo: 'assets/icon/towify-logo.svg',
    applicationTitle: 'Project Name'
  };

  loginFailIcon = 'assets/icon/login/login-fail.svg';
  message = 'Scan QR Code to Login!';
  qrCodeURL = '';
  loginStateIcon = '';

  readonly qrCodeCSSHref =
    'https%3A%2F%2Felectron-test-1251112954.cos.ap-shanghai.myqcloud.com%2Ftowify-wechat-qr-code.css';

  constructor(
    private readonly service: DynamicCmsService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.qrCodeURL) {
      return;
    }
    const projectIdChanges = changes['projectId'];
    if (projectIdChanges.currentValue) {
      this.signUpWithWeChat().then();
    }
  }

  async signUpWithWeChat() {
    if (!this.projectId) return;
    const result = await this.service.userService?.requestCmsWeChatBindingQrCode(
      window.location.href
    );
    this.loginStateIcon = '';
    if (result?.qrCode) {
      this.qrCodeURL = result.qrCode;
      const urlElementArray = result.qrCode.split('?');
      if (urlElementArray.length !== 2) {
        this.message = 'Get QR Code Error!';
        this.loginStateIcon = this.loginFailIcon;
        return;
      }
      this.qrCodeURL = `${urlElementArray[0]}?href=${this.qrCodeCSSHref}&${urlElementArray[1]}&login_type=jssdk&self_redirect=true`;
      await this.startPollingWechatLoginState();
    } else {
      this.toast.showWarningMessage(result.message ?? '');
    }
  }

  private async startPollingWechatLoginState(): Promise<void> {
    this.service.isLoginLoading = true;
    const error = await this.service.userService?.startPollingWeChatLoginState();
    if (error) {
      this.service.isLoginLoading = false;
      this.loginStateIcon = this.loginFailIcon;
    } else {
      const checkProjectAuth = await this.checkProjectMemberAuthority();
      if (!checkProjectAuth) {
        this.message = 'No permission is available to access this project.';
        this.service.isLoginLoading = false;
        this.loginStateIcon = this.loginFailIcon;
        await this.service.logOut();
        return;
      }
      await this.service.updateLoginInfo();
    }
  }

  private async checkProjectMemberAuthority(): Promise<boolean> {
    console.debug(this.projectId);
    const result = await this.service.userService.scf.call<Project.CheckProjectMemberAuthority>({
      ignoreToken: false,
      method: 'get',
      params: { projectId: this.projectId },
      path: '/project/member/authority/check'
    });
    console.debug(result, 'check');
    if (result.errorMessage) {
      return false;
    }
    return result.data !== undefined ? result.data : false;
  }
}
