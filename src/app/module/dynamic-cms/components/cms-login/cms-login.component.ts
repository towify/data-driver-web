import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicCmsService } from '../../dynamic-cms.service';
import { ToastService } from '../../service/toast.service';
import { SCF } from '@towify-serverless/scf-api/scf.info.list';

@Component({
  selector: 'lib-cms-login',
  templateUrl: './cms-login.component.html',
  styleUrls: ['./cms-login.component.scss']
})
export class CmsLoginComponent implements OnChanges {
  @Input()
  driverInfo: {
    id: string;
    name: string;
    domain: string;
  } = {
    name: '',
    domain: '',
    id: ''
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
    const driverInfo = changes['driverInfo'];
    if (driverInfo.currentValue?.id) {
      this.signUpWithWeChat().then();
    }
  }

  async signUpWithWeChat() {
    if (!this.driverInfo.id) return;
    const result = await this.service.userService?.requestCmsWeChatBindingQrCode(
      this.driverInfo.domain
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
    const { message, model } = await this.service.userService.getUserInfo();
    if (message || !model) {
      return false;
    }
    const result =
      await this.service.userService.scf.call<SCF.AuthorizationGetResourceCollaborators>({
        ignoreToken: false,
        method: 'get',
        params: {
          resourceType: 'dataDriver',
          resourceId: this.driverInfo.id,
          clientType: 'web'
        },
        path: '/authorization/resource/collaborators'
      });
    if (result.errorMessage) {
      return false;
    }
    return result.data ? result.data.some(item => item.id === model.id) : false;
  }
}
