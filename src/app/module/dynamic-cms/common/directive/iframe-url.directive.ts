import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[frameUrl]'
})
export class IframeUrlDirective {
  @Input('frameUrl')
  set url(url: string) {
    (<HTMLIFrameElement>this.el.nativeElement).src = url;
  }

  constructor(private el: ElementRef) {}
}
