import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gad7Component } from './gad7.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LatinToPersianNumbersPipe } from './shared/latin-to-persian-numbers.pipe';
import { Gad7UiModule } from './shared/gad7-ui.module';
import { Gad7RoutingModule } from './gad7-routing.module';

@NgModule({
  declarations: [Gad7Component, LatinToPersianNumbersPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Gad7UiModule,
    Gad7RoutingModule
  ],
  providers: [],
  exports: [Gad7Component]
})
export class Gad7Module {}
