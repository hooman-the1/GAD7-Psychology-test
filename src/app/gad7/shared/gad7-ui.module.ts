import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, Directive, EventEmitter, forwardRef, Input, NgModule, OnDestroy, Output, QueryList } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

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

@Component({
  selector: 'mat-radio-group',
  template: '<ng-content></ng-content>',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LocalRadioGroupComponent), multi: true }]
})
export class LocalRadioGroupComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
  @Input() formControl: FormControl | null = null;
  @ContentChildren(forwardRef(() => LocalRadioButtonComponent))
  buttons!: QueryList<LocalRadioButtonComponent>;

  private selectedValue: unknown = null;
  private buttonSubscriptions = new Subscription();
  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterContentInit(): void {
    this.bindButtons();
    this.buttons.changes.subscribe(() => this.bindButtons());
  }

  writeValue(value: unknown): void {
    this.selectedValue = value;
    this.updateButtonSelection();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.buttons?.forEach((button) => button.disabled = isDisabled);
  }

  ngOnDestroy(): void {
    this.buttonSubscriptions.unsubscribe();
  }

  private bindButtons(): void {
    this.buttonSubscriptions.unsubscribe();
    this.buttonSubscriptions = new Subscription();
    this.buttons.forEach((button) => {
      this.buttonSubscriptions.add(button.selected.subscribe((value) => {
        this.selectedValue = value;
        this.updateButtonSelection();
        this.onChange(value);
        this.onTouched();
      }));
    });
    this.updateButtonSelection();
  }

  private updateButtonSelection(): void {
    this.buttons?.forEach((button) => button.selectedValue = button.value === this.selectedValue);
  }
}

@Component({ selector: 'mat-radio-button', template: '<button type="button" (click)="selectValue()"><ng-content></ng-content></button>' })
export class LocalRadioButtonComponent {
  @Input() value: unknown;
  @Input() disabled = false;
  selectedValue = false;
  @Output() selected = new EventEmitter<unknown>();

  selectValue(): void {
    if (!this.disabled) {
      this.selected.emit(this.value);
    }
  }
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
