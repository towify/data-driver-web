/**
 * @author kaysaith
 * @date 2021/12/16
 */

import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicCmsMessageService {
  private subjects: { [key: string]: Subject<any> } = {};

  public getMessage<T>(name: string): Observable<T> {
    if (!this.subjects[name]) {
      this.registerSubject(name);
    }
    return this.subjects[name].asObservable();
  }

  public notify<T>(name: string, message?: T): void {
    this.subjects[name]?.next(message);
  }

  private registerSubject(name: string) {
    this.subjects[name] = new Subject<any>();
    return this;
  }

  public removeSubject(name: string) {
    (this.subjects as { [key: string]: Subject<any> })[name].unsubscribe();
    delete this.subjects[name];
  }

  public detach() {
    Object.keys(this.subjects).forEach(key => {
      this.removeSubject(key);
    });
  }
}
