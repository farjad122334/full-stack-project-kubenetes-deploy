import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  stats = {
    totalTours: 0,
    totalDrivers: 0,
    totalPartners: 0,
    pendingVerifications: 0
  };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/api/admin/dashboard-stats`).subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error loading stats', err)
    });
    
    this.loadRecentTours();
  }

  loadRecentTours() {
    this.http.get<any[]>(`${environment.apiUrl}/api/tours`).subscribe({
      next: (tours) => {
        this.recentTours = tours.slice(0, 5).map(t => ({
          id: `T${t.tourId.toString().padStart(3, '0')}`,
          destination: t.destination,
          client: t.title, // Using title as a display name
          status: t.status,
          statusClass: this.getStatusClass(t.status),
          amount: `${t.pricePerHead.toLocaleString()} PKR`
        }));
      },
      error: (err) => console.error('Error loading tours', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft': return 'bg-secondary-subtle text-secondary';
      case 'Published': return 'bg-info-subtle text-info';
      case 'Finalized': return 'bg-success-subtle text-success';
      case 'InProgress': return 'bg-warning-subtle text-warning';
      case 'Completed': return 'bg-primary-subtle text-primary';
      default: return 'bg-light text-dark';
    }
  }

  // Charts Configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 60, 45, 80],
        label: 'Tours',
        fill: true,
        tension: 0.5,
        borderColor: '#4dbd74',
        backgroundColor: 'rgba(77, 189, 116, 0.2)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        label: 'Revenue',
        backgroundColor: '#20c997'
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  recentTours: any[] = [];

}
