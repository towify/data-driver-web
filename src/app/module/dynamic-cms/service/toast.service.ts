/**
 * @Description:
 * @author xianti.xiong
 * @date 2022/1/1
 */
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  #toasts: { header: string; body: string; classname: string; delay?: number }[] = [];

  get toasts(): any[] {
    return this.#toasts;
  }

  show(header: string, body: string) {
    this.showSuccess(header, body);
  }

  showSuccess(header: string, body: string) {
    this.#toasts.push({ header, body, classname: 'bg-success text-light' });
  }

  showWarning(header: string, body: string) {
    this.#toasts.push({ header, body, classname: 'bg-danger text-light' });
  }

  showSuccessMessage(message: string) {
    this.showSuccess('', message);
  }

  showWarningMessage(message: string) {
    this.showWarning('', message);
  }

  remove(toast: any) {
    this.#toasts = this.toasts.filter(item => item !== toast);
  }
}
