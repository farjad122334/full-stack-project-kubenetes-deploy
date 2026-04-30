import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitPlan } from './submit-plan';

describe('SubmitPlan', () => {
  let component: SubmitPlan;
  let fixture: ComponentFixture<SubmitPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
