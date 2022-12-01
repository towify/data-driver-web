import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  constructor(public readonly toastService: ToastService) {}

  ngOnInit(): void {}

  isTemplate(toast: any) {
    return toast instanceof TemplateRef;
  }
}
