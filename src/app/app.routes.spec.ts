import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AppShellComponent } from './app-shell.component';
import { appRoutes } from './app.routes';

describe('application routes', () => {
  it('resolves the root URL to the application shell', async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(appRoutes)]
    });

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/', AppShellComponent);

    expect(component).toBeInstanceOf(AppShellComponent);
    expect(harness.routeNativeElement?.textContent).toContain('GAD-7');
  });
});
