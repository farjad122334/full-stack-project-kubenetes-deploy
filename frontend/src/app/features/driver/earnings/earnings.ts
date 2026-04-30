import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './earnings.html',
  styleUrl: './earnings.css'
})
export class Earnings implements OnInit {

  stats = {
    totalEarnings: 0,
    paidAmount: 0,
    pendingPayments: 0
  };

  paymentHistory: any[] = [];
  isLoading = true;
  isDashboardLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      const driverId = user.roleSpecificId || user.id;
      this.loadEarnings(driverId);
      this.loadStats(driverId);
    }
  }

  viewStripeDashboard(): void {
    const user = this.authService.getUser();
    const driverId = user.roleSpecificId || user.id;
    this.isDashboardLoading = true;

    this.http.get<any>(`${environment.apiUrl}/api/drivers/${driverId}/dashboard-link`).subscribe({
      next: (res) => {
        window.open(res.url, '_blank');
        this.isDashboardLoading = false;
      },
      error: (err) => {
        console.error('Failed to get dashboard link', err);
        alert('Could not open Stripe dashboard. Please ensure you have completed onboarding.');
        this.isDashboardLoading = false;
      }
    });
  }

  loadStats(driverId: number): void {
    this.http.get<any>(`${environment.apiUrl}/api/drivers/${driverId}/dashboard-stats`).subscribe({
      next: (data) => {
        this.stats.totalEarnings = data.totalEarnings;
        // Mocking paid/pending based on total for now, can be refined if separate fields exist
        this.stats.paidAmount = data.totalEarnings * 0.8; 
        this.stats.pendingPayments = data.totalEarnings * 0.2;
      }
    });
  }

  loadEarnings(driverId: number): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/api/drivers/${driverId}/earnings`).subscribe({
      next: (data) => {
        this.paymentHistory = data.map(item => ({
          title: item.tourTitle,
          date: item.date,
          method: item.method,
          amount: item.amount,
          status: item.status,
          statusClass: item.status === 'Paid' ? 'success' : 'warning'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load earnings', err);
        this.isLoading = false;
      }
    });
  }

  // Bar Chart Configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderRadius: 4,
        backgroundColor: '#3b82f6'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      { data: [12000, 18000, 19000, 25000, 22000, 35000, 45000], label: 'Earnings' }
    ]
  };

  // Line Chart Configuration
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [12000, 18000, 22000, 28000, 25000, 35000, 45000],
        label: 'Earnings',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 0.8)',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public lineChartType: ChartType = 'line';
}
