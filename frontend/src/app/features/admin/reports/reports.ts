import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SummaryMetric {
  title: string;
  value: string;
  subValue?: string;
  icon: string;
  colorClass: string;
}

interface ChartPoint {
  label: string;
  customers: number;
  revenue: number;
  tours: number;
}

interface DriverPerformance {
  name: string;
  tours: number;
  rating: number;
  revenue: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  // Date Range Mock
  startDate: string = '2025-01-01';
  endDate: string = '2025-06-30';
  selectedRange: string = 'Last 6 Months';

  // Summary Metrics (Matches Image 1)
  metrics: SummaryMetric[] = [
    {
      title: 'Total Tours',
      value: '328',
      icon: 'fa-map-marker-alt',
      colorClass: 'cyan'
    },
    {
      title: 'Total Customers',
      value: '1,312',
      icon: 'fa-users',
      colorClass: 'blue'
    },
    {
      title: 'Total Revenue',
      value: 'PKR 4.2M', // 4.2 Million
      icon: 'fa-chart-line',
      colorClass: 'green'
    },
    {
      title: 'Avg. Tour Value',
      value: 'PKR 12,804',
      icon: 'fa-file-invoice',
      colorClass: 'orange'
    }
  ];

  // Performance Chart Data (Matches Image 2)
  // Approximated values from the chart curves
  performanceData: ChartPoint[] = [
    { label: 'Jan', customers: 180, revenue: 420000, tours: 45 },
    { label: 'Feb', customers: 208, revenue: 580000, tours: 52 }, // Tooltip values
    { label: 'Mar', customers: 195, revenue: 500000, tours: 48 },
    { label: 'Apr', customers: 245, revenue: 680000, tours: 60 },
    { label: 'May', customers: 220, revenue: 620000, tours: 55 },
    { label: 'Jun', customers: 275, revenue: 750000, tours: 68 }
  ];

  // Top Destinations (Matches Image 3)
  destinations: { label: string, value: number, colorClass: string }[] = [
    { label: 'Northern Areas', value: 45, colorClass: 'teal' },
    { label: 'Lahore', value: 38, colorClass: 'teal' },
    { label: 'Karachi', value: 32, colorClass: 'teal' },
    { label: 'Murree', value: 28, colorClass: 'teal' },
    { label: 'Swat Valley', value: 24, colorClass: 'teal' }
  ];

  // Driver Performance (Matches Image 3)
  drivers: DriverPerformance[] = [
    {
      name: 'Ali Khan',
      tours: 45,
      rating: 4.8,
      revenue: 'PKR 1125K'
    },
    {
      name: 'Ahmed Raza',
      tours: 62,
      rating: 4.9,
      revenue: 'PKR 1550K'
    },
    {
      name: 'Hassan Malik',
      tours: 28,
      rating: 4.5,
      revenue: 'PKR 700K'
    }
  ];

  // Export Reports
  exportOptions = [
    { title: 'Tour Summary Report', icon: 'fa-file-alt' },
    { title: 'Financial Report', icon: 'fa-file-invoice-dollar' },
    { title: 'Driver Performance Report', icon: 'fa-id-card' }
  ];

  // SVG Helper Properties
  chartWidth = 800;
  chartHeight = 300;
  chartPadding = 40;

  pathCustomers: string = '';
  pathRevenue: string = '';
  pathTours: string = '';

  ngOnInit() {
    this.generateChartPaths();
  }

  generateChartPaths() {
    const customers = this.performanceData.map(d => d.customers);
    const revenue = this.performanceData.map(d => d.revenue);
    const tours = this.performanceData.map(d => d.tours);

    // Normalize each path to fill the chart height relatively, to mimic dual-axis look
    this.pathCustomers = this.getSmoothPath(customers, Math.max(...customers) * 1.2);
    this.pathRevenue = this.getSmoothPath(revenue, Math.max(...revenue) * 1.2);
    this.pathTours = this.getSmoothPath(tours, Math.max(...tours) * 2.5); // Tours are lower numbers, scale them down visually
  }

  getSmoothPath(values: number[], maxVal: number): string {
    if (values.length === 0) return '';

    const stepX = (this.chartWidth - this.chartPadding * 2) / (values.length - 1);

    const points = values.map((val, i) => {
      const x = this.chartPadding + i * stepX;
      const y = this.chartHeight - this.chartPadding - (val / maxVal) * (this.chartHeight - this.chartPadding * 2);
      return [x, y];
    });

    return this.svgPath(points, 0.2);
  }

  svgPath(points: number[][], smoothing: number): string {
    const line = (pointA: number[], pointB: number[]) => {
      const lengthX = pointB[0] - pointA[0];
      const lengthY = pointB[1] - pointA[1];
      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
      };
    };

    const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
      const p = previous || current;
      const n = next || current;
      const o = line(p, n);
      const angle = o.angle + (reverse ? Math.PI : 0);
      const length = o.length * smoothing;
      const x = current[0] + Math.cos(angle) * length;
      const y = current[1] + Math.sin(angle) * length;
      return [x, y];
    };

    const bezierCommand = (point: number[], i: number, a: number[][]) => {
      const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
      const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
      return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    };

    const d = points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point[0]},${point[1]}`;
      return `${acc} ${bezierCommand(point, i, a)}`;
    }, '');

    return d;
  }

  getBarHeight(value: number): number {
    const maxVal = Math.max(...this.destinations.map(d => d.value)) * 1.2;
    return (value / maxVal) * 100;
  }
}
