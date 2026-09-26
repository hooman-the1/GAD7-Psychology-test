import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Component } from '@angular/core';

import { questionEntries } from './gad7.constants';
import {
  calculateGad7Score,
  Gad7Answers,
  Gad7AnswerValue,
  Gad7Interpretation,
  getGad7Interpretation
} from './gad7.helpers';
import {
  Gad7AssessmentPersistenceService
} from './services/gad7-persistence.service';
import { Gad7AssessmentRecord } from './models/gad7-storage';

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
  submittedAnswers: Gad7Answers | null = null;
  activeResult: Gad7Interpretation | null = null;
  savedAssessments: readonly Gad7AssessmentRecord[];
  selectedAssessmentId: string | null = null;
  selectionUnavailable = false;
  historyUnavailable = false;
  persistenceFailure: unknown | null = null;

  constructor(private readonly persistence: Gad7AssessmentPersistenceService) {
    const history = persistence.load();
    this.savedAssessments = history.records;
    this.historyUnavailable = history.status !== 'missing'
      && history.status !== 'valid'
      && history.status !== 'recovered';
  }

  submitQuestionnaire(): boolean {
    this.validationAttempted = true;
    this.questionnaire.markAllAsTouched();

    if (this.questionnaire.invalid) {
      this.submissionAccepted = false;
      this.submittedAnswers = null;
      this.activeResult = null;
      return false;
    }

    const answers = this.readAnswers();
    if (!this.activeResult || !this.answersMatch(answers)) {
      this.submittedAnswers = answers;
      this.activeResult = getGad7Interpretation(calculateGad7Score(answers));
    }
    const saveOutcome = this.persistence.save(answers, this.activeResult);
    this.persistenceFailure = saveOutcome.success ? null : saveOutcome.error ?? new Error('GAD-7 persistence failed');
    if (saveOutcome.success && saveOutcome.record) {
      this.savedAssessments = [saveOutcome.record, ...this.savedAssessments];
      this.historyUnavailable = false;
    }
    this.submissionAccepted = true;
    return true;
  }

  restartAssessment(): void {
    this.questionnaire.reset();
    this.validationAttempted = false;
    this.submissionAccepted = false;
    this.submittedAnswers = null;
    this.activeResult = null;
    this.persistenceFailure = null;
  }

  selectAssessment(recordId: string): void {
    const exists = this.savedAssessments.some((record) => record.id === recordId);
    this.selectedAssessmentId = exists ? recordId : null;
    this.selectionUnavailable = !exists;
  }

  get selectedAssessment(): Gad7AssessmentRecord | null {
    if (!this.selectedAssessmentId) return null;
    return this.savedAssessments.find((record) => record.id === this.selectedAssessmentId) ?? null;
  }

  get detailUnavailable(): boolean {
    return this.selectionUnavailable || (
      this.selectedAssessmentId !== null && this.selectedAssessment === null
    );
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

  private readAnswers(): Gad7Answers {
    return [0, 1, 2, 3, 4, 5, 6].map((index) =>
      this.answerControl(index).value as Gad7AnswerValue
    ) as unknown as Gad7Answers;
  }

  private answersMatch(answers: Gad7Answers): boolean {
    return this.submittedAnswers?.every((answer, index) => answer === answers[index]) ?? false;
  }
}

function validAnswerValue(): ValidatorFn {
  return (control: AbstractControl): { invalidAnswer: true } | null => {
    return control.value === 0 || control.value === 1 || control.value === 2 || control.value === 3
      ? null
      : { invalidAnswer: true };
  };
}

