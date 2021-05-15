import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseFabricComponent } from './use-fabric.component';

describe('UseFabricComponent', () => {
  let component: UseFabricComponent;
  let fixture: ComponentFixture<UseFabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UseFabricComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseFabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
