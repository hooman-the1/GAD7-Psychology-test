import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Gad7Component } from './gad7.component';

const routes: Routes = [
  { path: '', component: Gad7Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Gad7RoutingModule {}
