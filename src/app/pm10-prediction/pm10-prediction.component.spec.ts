import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pm10PredictionComponent } from './pm10-prediction.component';

describe('Pm10PredictionComponent', () => {
  let component: Pm10PredictionComponent;
  let fixture: ComponentFixture<Pm10PredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pm10PredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pm10PredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
