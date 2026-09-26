import { TestBed } from '@angular/core/testing';
import { Gad7Module } from './gad7.module';
import { Gad7Component } from './gad7.component';

describe('local GAD-7 feature boundary', () => {
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
});
