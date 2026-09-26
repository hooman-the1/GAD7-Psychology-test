import { Component } from '@angular/core';

import { questionEntries } from './gad7.constants';

@Component({
  selector: 'app-gad-7',
  templateUrl: './gad7.component.html',
  styleUrls: ['./gad7.component.scss']
})
export class Gad7Component {
  readonly questions = questionEntries;
}

