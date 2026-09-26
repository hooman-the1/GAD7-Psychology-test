import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Component } from '@angular/core';

import { questionEntries } from './gad7.constants';

@Component({
  selector: 'app-gad-7',
  templateUrl: './gad7.component.html',
  styleUrls: ['./gad7.component.scss']
})
export class Gad7Component {
  readonly questions = questionEntries;
  readonly questionnaire = new FormGroup({
    answer0: this.createAnswerControl(),
    answer1: this.createAnswerControl(),
    answer2: this.createAnswerControl(),
    answer3: this.createAnswerControl(),
    answer4: this.createAnswerControl(),
    answer5: this.createAnswerControl(),
    answer6: this.createAnswerControl()
  });
  validationAttempted = false;
  submissionAccepted = false;

  submitQuestionnaire(): boolean {
    this.validationAttempted = true;
    this.questionnaire.markAllAsTouched();

    if (this.questionnaire.invalid) {
      this.submissionAccepted = false;
      return false;
    }

    this.submissionAccepted = true;
    return true;
  }

  answerControl(questionIndex: number): FormControl<number | null> {
    return this.questionnaire.controls[
      `answer${questionIndex}` as keyof typeof this.questionnaire.controls
    ];
  }

  private createAnswerControl(): FormControl<number | null> {
    return new FormControl<number | null>(null, {
      validators: [Validators.required, validAnswerValue()]
    });
  }
}

function validAnswerValue(): ValidatorFn {
  return (control: AbstractControl): { invalidAnswer: true } | null => {
    return control.value === 0 || control.value === 1 || control.value === 2 || control.value === 3
      ? null
      : { invalidAnswer: true };
  };
}

