import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDriverComponent } from './data-driver.component';

describe('DataDriverComponent', () => {
  let component: DataDriverComponent;
  let fixture: ComponentFixture<DataDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataDriverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
