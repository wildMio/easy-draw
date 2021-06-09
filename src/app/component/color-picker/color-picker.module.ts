import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { OptionWrapperDirective } from './option-wrapper.directive';
import { OptionItemDirective } from './option-item.directive';
import { HintForegroundPipe } from './hint-foreground.pipe';

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
