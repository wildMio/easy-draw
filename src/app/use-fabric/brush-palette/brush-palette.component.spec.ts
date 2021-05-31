import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushPaletteComponent } from './brush-palette.component';

describe('BrushPaletteComponent', () => {
  let component: BrushPaletteComponent;
  let fixture: ComponentFixture<BrushPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrushPaletteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
