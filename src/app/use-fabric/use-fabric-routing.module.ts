import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UseFabricComponent } from './use-fabric.component';

const routes: Routes = [{ path: '', component: UseFabricComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseFabricRoutingModule {}
