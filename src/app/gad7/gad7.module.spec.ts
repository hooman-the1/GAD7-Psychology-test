import { TestBed } from '@angular/core/testing';
import { Gad7Module } from './gad7.module';
import { Gad7Component } from './gad7.component';

describe('local GAD-7 feature boundary', () => {
  it('imports and instantiates without HTTP or copied application services', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [Gad7Module]
    }).createComponent(Gad7Component);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders all seven questions with four choices each before any answer is selected', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [Gad7Module]
    }).createComponent(Gad7Component);

    fixture.detectChanges();

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
});
