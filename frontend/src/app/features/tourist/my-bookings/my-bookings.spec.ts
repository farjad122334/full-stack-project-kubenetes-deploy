import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MyBookings } from './my-bookings';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('MyBookings', () => {
  let component: MyBookings;
  let fixture: ComponentFixture<MyBookings>;

  beforeEach(async () => {
    const bookingServiceMock = {
      getTouristBookings: () => of([])
    };
    const authServiceMock = {
      getUser: () => ({ roleSpecificId: 1 })
    };

    await TestBed.configureTestingModule({
      imports: [MyBookings, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MyBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
