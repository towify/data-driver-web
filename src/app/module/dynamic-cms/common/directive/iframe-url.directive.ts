import { Directive, ElementRef, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[frameUrl]'
})
export class IframeUrlDirective {
  @Input('frameUrl')
  set url(url: string) {
    (<HTMLIFrameElement>this.el.nativeElement).src = url;
  }

  constructor(private el: ElementRef, @Inject(DOCUMENT) protected readonly document: Document) {}
}
