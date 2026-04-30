import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  tour: string;
  client: string;
  amount: number;
  date: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments {
  summaryCards = [
    {
      title: 'Total Revenue',
      amount: 'PKR 3.6M',
      trend: '+18% this month',
      trendUp: true,
      icon: 'bi-currency-dollar', // mapped to $
      bg: 'bg-teal',
      note: 'month'
    },
    {
      title: 'Net Profit',
      amount: 'PKR 1.1M',
      trend: '+22% this month',
      trendUp: true,
      icon: 'bi-graph-up-arrow',
      bg: 'bg-green',
      note: 'month'
    },
    {
      title: 'Pending Payments',
      amount: 'PKR 425K',
      trend: '8 transactions',
      trendUp: false,
      isWarning: true,
      icon: 'bi-clock-history',
      bg: 'bg-orange',
      note: 'transactions'
    },
    {
      title: 'Completed',
      amount: 'PKR 3.2M',
      trend: '124 transactions',
      trendUp: true,
      icon: 'bi-check-lg',
      bg: 'bg-blue',
      note: 'transactions'
    }
  ];

  transactions: Transaction[] = [
    {
      id: 'TXN001',
      tour: 'Northern Areas Adventure',
      client: 'John Smith',
      amount: 240000,
      date: '2025-10-18',
      method: 'Bank Transfer',
      status: 'Completed'
    },
    {
      id: 'TXN002',
      tour: 'Lahore Heritage Tour',
      client: 'Sarah Khan',
      amount: 120000,
      date: '2025-10-17',
      method: 'Credit Card',
      status: 'Completed'
    },
    {
      id: 'TXN003',
      tour: 'Swat Valley Explorer',
      client: 'Sara Ahmed',
      amount: 180000,
      date: '2025-10-16',
      method: 'Cash',
      status: 'Pending'
    },
    {
      id: 'TXN004',
      tour: 'Murree Hills Retreat',
      client: 'Emma Wilson',
      amount: 75000,
      date: '2025-10-15',
      method: 'Online Payment',
      status: 'Completed'
    },
    {
      id: 'TXN005',
      tour: 'Hunza Autumn Tour',
      client: 'Ali Raza',
      amount: 150000,
      date: '2025-10-12',
      method: 'Bank Transfer',
      status: 'Failed'
    }
  ];

  breakdown = [
    { label: 'Tours', amount: 450000, color: '#00c09d', percent: 60 },
    { label: 'Hotels', amount: 187500, color: '#4d90fe', percent: 25 },
    { label: 'Restaurants', amount: 75000, color: '#f59f00', percent: 10 },
    { label: 'Transport', amount: 37500, color: '#7950f2', percent: 5 }
  ];

  // Helper for SVG donut chart
  get donutSegments() {
    let cumulativePercent = 0;
    return this.breakdown.map(item => {
      const startAngle = (cumulativePercent / 100) * 360;
      cumulativePercent += item.percent;
      const endAngle = (cumulativePercent / 100) * 360;

      // Calculate SVG path for arc
      const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
      const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
      const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
      const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

      const largeArc = item.percent > 50 ? 1 : 0;

      return {
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: item.color
      };
    });
  }
}
