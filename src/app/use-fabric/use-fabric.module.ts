import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ColorPickerModule } from '../component/color-picker/color-picker.module';
import { BrushPaletteComponent } from './brush-palette/brush-palette.component';
import { FabricToolboxComponent } from './fabric-toolbox/fabric-toolbox.component';
import { HookFabricDirective } from './hook-fabric.directive';
import { UseFabricRoutingModule } from './use-fabric-routing.module';
import { UseFabricComponent } from './use-fabric.component';

@NgModule({
  declarations: [
    UseFabricComponent,
    HookFabricDirective,
    FabricToolboxComponent,
    BrushPaletteComponent,
  ],
  imports: [
    CommonModule,
    UseFabricRoutingModule,
    MatButtonModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    ColorPickerModule,
  ],
})
export class UseFabricModule {}
