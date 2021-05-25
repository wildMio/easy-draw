import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ColorPickerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    OverlayModule,
    A11yModule,
    MatRippleModule,
    MatIconModule,
  ],
  exports: [ColorPickerComponent],
})
export class ColorPickerModule {}
