import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';

import { UseFabricRoutingModule } from './use-fabric-routing.module';
import { UseFabricComponent } from './use-fabric.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HookFabricDirective } from './hook-fabric.directive';
import { FabricToolboxComponent } from './fabric-toolbox/fabric-toolbox.component';
import { BrushPaletteComponent } from './brush-palette/brush-palette.component';
import { ColorPickerModule } from '../component/color-picker/color-picker.module';
import { LayoutModule } from '@angular/cdk/layout';

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
    LayoutModule,
  ],
})
export class UseFabricModule {}
