import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTours } from './manage-tours';

describe('ManageTours', () => {
  let component: ManageTours;
  let fixture: ComponentFixture<ManageTours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
