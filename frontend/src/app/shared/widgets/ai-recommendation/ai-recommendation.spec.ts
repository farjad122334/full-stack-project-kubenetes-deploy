import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiRecommendation } from './ai-recommendation';

describe('AiRecommendation', () => {
  let component: AiRecommendation;
  let fixture: ComponentFixture<AiRecommendation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiRecommendation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiRecommendation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
