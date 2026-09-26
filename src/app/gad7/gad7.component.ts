import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  getSeverityCategory,
  getSeverityText,
  getRecommendationText,
  getGaugeColor,
  getEmojiIcon,
  getGaugeMarkers
} from './gad7.helpers';

import { SeverityCategory, questions } from './gad7.constants';
import { SessionID } from './shared/sessionid.service';
import { environment } from './config/environment';

@Component({
  selector: 'app-gad-7',
  templateUrl: './gad7.component.html',
  styleUrls: ['./gad7.component.scss']
})
export class Gad7Component implements OnInit {
  showResult = false;
  gadForm!: FormGroup;
  gaugeValue = 0;
  totalScore = 0;
  currentStep = 0;
  questions = questions;

  severityText = '';
  recommendationText = '';
  gaugeColorCode = '';
  severityEmojiIcon = '';
  severityColor = '';
  gaugeLabel = 'Score';

  initialSubRoute = '/test/gad7?action=enter';
  patchSubRoute = '/test/gad7?action=calculate-result';
  sessionKey = 'gad7_session_id';

  gaugeMarkers: any = {};

  constructor(
    private fb: FormBuilder,
    private sessionIdService: SessionID,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.gadForm = this.fb.group({
      answers: this.fb.array(this.questions.map(() => this.fb.control(null, Validators.required)))
    });

    const sessionId = this.sessionIdService.ensureSessionId(this.sessionKey);
    this.http.post(environment.apiBaseUrl + this.initialSubRoute, { sessionId }).subscribe();
  }

  get answers(): FormArray {
    return this.gadForm.get('answers') as FormArray;
  }

  getCurrentControl(): FormControl {
    return this.answers.at(this.currentStep) as FormControl;
  }

  next(): void {
    if (this.getCurrentControl().invalid) return;
    this.currentStep++;
  }

  prev(): void {
    this.currentStep--;
  }

  calculateScore(): void {
    this.totalScore = this.answers.value.reduce((acc: number, val: number) => acc + +val, 0);
    this.gaugeValue = this.totalScore;
  }

  setSeverityDetails(category: SeverityCategory): void {
    this.severityText = getSeverityText(category);
    this.recommendationText = getRecommendationText(category);
    this.gaugeColorCode = getGaugeColor(category);
    this.severityEmojiIcon = getEmojiIcon(category);
    this.severityColor = this.gaugeColorCode;
  }

  finalizeResults(): void {
    this.showResult = true;
    this.gadForm.reset();
    this.currentStep = 0;
    this.gaugeMarkers = getGaugeMarkers(this.gaugeValue, this.gaugeColorCode);
  }

  private sendDataToServer(category: string): void {
    const sessionId = this.sessionIdService.ensureSessionId(this.sessionKey);
    this.http.patch(environment.apiBaseUrl + this.patchSubRoute, {
      sessionId,
      severity: category
    }).subscribe();
  }

  submit(): void {
    if (this.gadForm.invalid) return;

    this.calculateScore();
    const category = getSeverityCategory(this.totalScore);
    this.setSeverityDetails(category);
    this.finalizeResults();
    this.sendDataToServer(category);
  }

  private handleSessionIDInRestart(): string {
    localStorage.removeItem(this.sessionKey);
    return this.sessionIdService.ensureSessionId(this.sessionKey);
  }

  private handlePropertiesInReset(): void {
    this.gadForm.reset();
    this.currentStep = 0;
    this.totalScore = 0;
    this.showResult = false;
  }

  restart(): void {
    const sessionId = this.handleSessionIDInRestart();
    this.handlePropertiesInReset();
    this.http.post(environment.apiBaseUrl + this.initialSubRoute, { sessionId }).subscribe();
  }
}

