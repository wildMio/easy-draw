import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { UseFabricRoutingModule } from './use-fabric-routing.module';
import { UseFabricComponent } from './use-fabric.component';

@NgModule({
  declarations: [UseFabricComponent],
  imports: [CommonModule, UseFabricRoutingModule, MatButtonModule],
})
export class UseFabricModule {}
