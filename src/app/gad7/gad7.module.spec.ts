import { TestBed } from '@angular/core/testing';
import { Gad7Module } from './gad7.module';
import { Gad7Component } from './gad7.component';
import { GAD7_STORAGE_KEY } from './models/gad7-storage';

describe('local GAD-7 feature boundary', () => {
  beforeEach(() => window.localStorage.removeItem(GAD7_STORAGE_KEY));
  afterEach(() => window.localStorage.removeItem(GAD7_STORAGE_KEY));
  function createFixture() {
    const fixture = TestBed.configureTestingModule({
      imports: [Gad7Module]
    }).createComponent(Gad7Component);

    fixture.detectChanges();
    return fixture;
  }

  it('imports and instantiates without HTTP or copied application services', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [Gad7Module]
    }).createComponent(Gad7Component);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders all seven questions with four choices each before any answer is selected', () => {
    const fixture = createFixture();

    const questions = fixture.nativeElement.querySelectorAll('[data-question]');
    const choices = fixture.nativeElement.querySelectorAll('[data-choice]');

    expect(questions.length).toBe(7);
    expect(choices.length).toBe(28);
    questions.forEach((question: HTMLElement, index: number) => {
      expect(question.getAttribute('data-question')).toBe(String(index + 1));
      expect(Array.from(question.querySelectorAll('[data-choice]')).map((choice) =>
        choice.getAttribute('data-value'))).toEqual(['0', '1', '2', '3']);
    });
  });

  it('keeps an untouched questionnaire invalid and marks every question after submit', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    expect(component.submitQuestionnaire()).toBeFalse();
    fixture.detectChanges();

    expect(component.questionnaire.invalid).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('[data-validation-error]').length).toBe(7);
  });

  it('identifies only unanswered questions in a partial submission', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.questionnaire.controls.answer0.setValue(1);
    component.questionnaire.controls.answer6.setValue(2);

    expect(component.submitQuestionnaire()).toBeFalse();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-validation-error]').length).toBe(5);
    expect(component.questionnaire.controls.answer0.invalid).toBeFalse();
    expect(component.questionnaire.controls.answer6.invalid).toBeFalse();
  });

  it('treats zero as a valid answer and accepts all seven answers in any order', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.questionnaire.controls.answer6.setValue(0);
    for (let index = 0; index < 6; index += 1) {
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls].setValue(0);
    }

    expect(component.submitQuestionnaire()).toBeTrue();
    expect(component.questionnaire.valid).toBeTrue();
    expect(component.submissionAccepted).toBeTrue();
  });

  it('does not duplicate validation state and clears an error when corrected', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.submitQuestionnaire();
    component.submitQuestionnaire();
    component.questionnaire.controls.answer3.setValue(3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-validation-error]').length).toBe(6);
    expect(component.questionnaire.controls.answer3.valid).toBeTrue();
    expect(component.questionnaire.controls.answer3.value).toBe(3);
  });

  it('submits locally in question order and renders the calculated interpretation', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const selectedAnswers = [3, 0, 2, 1, 0, 3, 1] as const;

    [6, 0, 4, 2, 1, 5, 3].forEach((index) => {
      const answer = selectedAnswers[index];
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls]
        .setValue(answer);
    });

    expect(component.submitQuestionnaire()).toBeTrue();
    fixture.detectChanges();

    expect(component.submittedAnswers).toEqual(selectedAnswers);
    expect(component.activeResult).toEqual(jasmine.objectContaining({
      score: 10,
      category: 'moderate'
    }));
    expect(fixture.nativeElement.querySelector('[data-active-result]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-result-score]').textContent).toContain('10');
  });

  it('displays the locally calculated total for every representative score boundary', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    [0, 1, 4, 5, 9, 10, 14, 15, 19, 20, 21].forEach((expectedScore) => {
      const answers = Array(7).fill(0) as number[];
      let remaining = expectedScore;
      answers.forEach((_, index) => {
        answers[index] = Math.min(3, remaining);
        remaining -= answers[index];
      });

      answers.forEach((answer, index) => {
        component.questionnaire.controls[
          `answer${index}` as keyof typeof component.questionnaire.controls
        ].setValue(answer);
      });

      expect(component.submitQuestionnaire()).toBeTrue();
      expect(component.activeResult?.score).toBe(expectedScore);
    });
  });

  it('accepts seven zero answers and keeps the same result on repeated submission', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const answers = [0, 0, 0, 0, 0, 0, 0] as const;

    answers.forEach((answer, index) => {
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls]
        .setValue(answer);
    });

    expect(component.submitQuestionnaire()).toBeTrue();
    const firstResult = component.activeResult;
    expect(component.submitQuestionnaire()).toBeTrue();
    fixture.detectChanges();

    expect(component.submittedAnswers).toEqual(answers);
    expect(component.activeResult).toBe(firstResult);
    expect(component.activeResult?.score).toBe(0);
    expect(component.savedAssessments).toHaveSize(2);
    expect(fixture.nativeElement.querySelector('[data-active-result]')).toBeTruthy();
  });

  it('does not create or replace a result when submission is invalid', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const setItem = spyOn(window.localStorage, 'setItem');

    expect(component.submitQuestionnaire()).toBeFalse();
    fixture.detectChanges();

    expect(component.activeResult).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-active-result]')).toBeNull();
  });

  it('persists a valid completed assessment without changing the active result contract', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const setItem = spyOn(window.localStorage, 'setItem');

    for (let index = 0; index < 7; index += 1) {
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls]
        .setValue(0);
    }

    expect(component.submitQuestionnaire()).toBeTrue();
    expect(setItem).toHaveBeenCalledWith(GAD7_STORAGE_KEY, jasmine.any(String));
    expect(component.savedAssessments).toHaveSize(1);
    expect(component.persistenceFailure).toBeNull();
  });

  it('offers a restart control that clears a completed assessment without changing saved records', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    [3, 0, 2, 1, 0, 3, 1].forEach((answer, index) => {
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls]
        .setValue(answer);
    });
    component.submitQuestionnaire();
    const savedRecords = component.savedAssessments;
    const storedHistory = window.localStorage.getItem(GAD7_STORAGE_KEY);
    const setItem = spyOn(window.localStorage, 'setItem').and.callThrough();
    fixture.detectChanges();

    const restart = fixture.nativeElement.querySelector('[data-restart-assessment]') as HTMLButtonElement;
    expect(restart).toBeTruthy();

    restart.click();
    fixture.detectChanges();

    expect(component.questionnaire.value).toEqual({
      answer0: null,
      answer1: null,
      answer2: null,
      answer3: null,
      answer4: null,
      answer5: null,
      answer6: null
    });
    expect(component.activeResult).toBeNull();
    expect(component.submittedAnswers).toBeNull();
    expect(component.submissionAccepted).toBeFalse();
    expect(component.validationAttempted).toBeFalse();
    expect(component.savedAssessments).toBe(savedRecords);
    expect(component.questionnaire.pristine).toBeTrue();
    expect(component.questionnaire.untouched).toBeTrue();
    expect(setItem).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(GAD7_STORAGE_KEY)).toBe(storedHistory);
    expect(fixture.nativeElement.querySelector('[data-active-result]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-validation-error]').length).toBe(0);
  });

  it('can submit a new zero-valued assessment after restart', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.questionnaire.controls.answer0.setValue(1);
    component.questionnaire.controls.answer1.setValue(1);
    component.questionnaire.controls.answer2.setValue(1);
    component.questionnaire.controls.answer3.setValue(1);
    component.questionnaire.controls.answer4.setValue(1);
    component.questionnaire.controls.answer5.setValue(1);
    component.questionnaire.controls.answer6.setValue(1);
    component.submitQuestionnaire();

    component.restartAssessment();
    for (let index = 0; index < 7; index += 1) {
      component.questionnaire.controls[`answer${index}` as keyof typeof component.questionnaire.controls]
        .setValue(0);
    }

    expect(component.submitQuestionnaire()).toBeTrue();
    expect(component.activeResult?.score).toBe(0);
    expect(component.submittedAnswers).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('makes repeated restart safe from a blank or partially answered assessment', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.questionnaire.controls.answer2.setValue(2);
    component.submitQuestionnaire();
    component.restartAssessment();
    component.restartAssessment();

    expect(component.questionnaire.value).toEqual({
      answer0: null,
      answer1: null,
      answer2: null,
      answer3: null,
      answer4: null,
      answer5: null,
      answer6: null
    });
    expect(component.activeResult).toBeNull();
    expect(component.submittedAnswers).toBeNull();
    expect(component.validationAttempted).toBeFalse();
  });
});
