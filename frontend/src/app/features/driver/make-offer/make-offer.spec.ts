import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeOffer } from './make-offer';

describe('MakeOffer', () => {
  let component: MakeOffer;
  let fixture: ComponentFixture<MakeOffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeOffer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeOffer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
