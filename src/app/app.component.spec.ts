import { TestBed } from '@angular/core/testing';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  it('renders the GAD-7 shell without starter navigation', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AppShellComponent]
    }).createComponent(AppShellComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('GAD-7');
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(0);
  });
});
