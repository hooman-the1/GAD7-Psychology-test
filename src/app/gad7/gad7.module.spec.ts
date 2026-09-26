import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Gad7Module } from './gad7.module';
import { Gad7Component } from './gad7.component';

describe('local GAD-7 feature boundary', () => {
  it('imports and instantiates the feature without copied application modules', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [Gad7Module, HttpClientTestingModule]
    }).createComponent(Gad7Component);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
