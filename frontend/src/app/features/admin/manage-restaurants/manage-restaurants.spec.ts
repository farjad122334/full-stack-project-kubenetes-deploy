import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRestaurants } from './manage-restaurants';

describe('ManageRestaurants', () => {
  let component: ManageRestaurants;
  let fixture: ComponentFixture<ManageRestaurants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRestaurants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRestaurants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
