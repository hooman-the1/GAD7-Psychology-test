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
});
