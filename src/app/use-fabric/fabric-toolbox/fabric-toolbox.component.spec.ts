import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricToolboxComponent } from './fabric-toolbox.component';

describe('FabricToolboxComponent', () => {
  let component: FabricToolboxComponent;
  let fixture: ComponentFixture<FabricToolboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FabricToolboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
