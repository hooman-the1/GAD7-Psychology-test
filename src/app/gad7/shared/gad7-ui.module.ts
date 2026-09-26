import { CommonModule } from '@angular/common';
import { Component, Directive, Input, NgModule } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * The feature-local UI seam for the controls used by the extracted template.
 * It intentionally does not depend on the copied application's broad UI module.
 */
@Component({ selector: 'mat-card', template: '<ng-content></ng-content>' })
export class LocalCardComponent {}

@Component({ selector: 'mat-card-title', template: '<ng-content></ng-content>' })
export class LocalCardTitleComponent {}

@Component({ selector: 'mat-card-content', template: '<ng-content></ng-content>' })
export class LocalCardContentComponent {}

@Component({ selector: 'mat-card-actions', template: '<ng-content></ng-content>' })
export class LocalCardActionsComponent {}

@Component({ selector: 'mat-divider', template: '' })
export class LocalDividerComponent {}

@Component({ selector: 'mat-progress-bar', template: '' })
export class LocalProgressBarComponent {
  @Input() mode = 'determinate';
  @Input() value = 0;
}

@Component({ selector: 'mat-radio-group', template: '<ng-content></ng-content>' })
export class LocalRadioGroupComponent {
  @Input() formControl: FormControl | null = null;
}

@Component({ selector: 'mat-radio-button', template: '<ng-content></ng-content>' })
export class LocalRadioButtonComponent {
  @Input() value: unknown;
}

@Directive({ selector: 'button[mat-button], button[mat-raised-button], button[mat-stroked-button]' })
export class LocalButtonDirective {
  @Input() color = '';
}

@Component({ selector: 'ngx-gauge', template: '' })
export class LocalGaugeComponent {
  @Input() value = 0;
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 0;
  @Input() size = 0;
  @Input() type = '';
  @Input() thick = 0;
  @Input() foregroundColor = '';
  @Input() duration = 0;
  @Input() cap = '';
  @Input() markers: Record<string, unknown> = {};
  @Input() margin = 0;
  @Input() append = '';
}

@NgModule({
  declarations: [
    LocalCardComponent,
    LocalCardTitleComponent,
    LocalCardContentComponent,
    LocalCardActionsComponent,
    LocalDividerComponent,
    LocalProgressBarComponent,
    LocalRadioGroupComponent,
    LocalRadioButtonComponent,
    LocalButtonDirective,
    LocalGaugeComponent
  ],
  imports: [CommonModule],
  exports: [
    LocalCardComponent,
    LocalCardTitleComponent,
    LocalCardContentComponent,
    LocalCardActionsComponent,
    LocalDividerComponent,
    LocalProgressBarComponent,
    LocalRadioGroupComponent,
    LocalRadioButtonComponent,
    LocalButtonDirective,
    LocalGaugeComponent
  ]
})
export class Gad7UiModule {}
