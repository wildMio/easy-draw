import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { ColorPickerComponent } from './color-picker.component';
import { HintForegroundPipe } from './hint-foreground.pipe';
import { OptionItemDirective } from './option-item.directive';
import { OptionWrapperDirective } from './option-wrapper.directive';

@NgModule({
  declarations: [
    ColorPickerComponent,
    OptionWrapperDirective,
    OptionItemDirective,
    HintForegroundPipe,
  ],
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
