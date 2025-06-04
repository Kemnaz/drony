import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartType, registerables, TitleOptions, ScaleOptionsByType } from 'chart.js';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

Chart.register(...registerables);

interface AirQualityData {
  date: string;
  averages: { [key: string]: number };
  minimums: { [key: string]: number };
  maximums: { [key: string]: number };
}

@Component({
  selector: 'app-air-quality-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class AirQualityChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;
  private http = inject(HttpClient);

  selectedParameter = 'pm25';
  data: AirQualityData[] = [];
  isLoading = true;
  errorLoading = false;
  errorMessage = '';
  initialLoadAttempted = false;

  private apiUrl = 'http://localhost:8080/api/air-quality/stats/daily/recent';

  availableParameters = [
    { key: 'no', label: 'Tlenek azotu (NO)', unit: 'µg/m³' },
    { key: 'co2', label: 'Dwutlenek węgla (CO₂)', unit: 'ppm' },
    { key: 'pm10', label: 'Pył zawieszony PM10', unit: 'µg/m³' },
    { key: 'pm25', label: 'Pył zawieszony PM2.5', unit: 'µg/m³' },
    { key: 'h2s', label: 'Siarkowodór (H₂S)', unit: 'µg/m³' },
    { key: 'tout', label: 'Temperatura zewnętrzna', unit: '°C' },
    { key: 'tin', label: 'Temperatura wewnętrzna', unit: '°C' },
    { key: 'co', label: 'Tlenek węgla (CO)', unit: 'mg/m³' },
    { key: 'rhin', label: 'Wilgotność wewnętrzna', unit: '%' },
    { key: 'rhout', label: 'Wilgotność zewnętrzna', unit: '%' },
    { key: 'p', label: 'Ciśnienie', unit: 'hPa' },
    { key: 'no2', label: 'Dwutlenek azotu (NO₂)', unit: 'µg/m³' },
    { key: 'hcl', label: 'Chlorowodór (HCl)', unit: 'µg/m³' },
    { key: 'hcho', label: 'Formaldehyd (HCHO)', unit: 'µg/m³' },
    { key: 'hcn', label: 'Cyjanowodór (HCN)', unit: 'µg/m³' },
    { key: 'so2', label: 'Dwutlenek siarki (SO₂)', unit: 'µg/m³' },
    { key: 'iaq', label: 'Indeks jakości powietrza (IAQ)', unit: '' },
    { key: 'nh3', label: 'Amoniak (NH₃)', unit: 'µg/m³' },
    { key: 'ec', label: 'Węgiel elementarny (EC)', unit: 'µg/m³' }
  ];

  ngOnInit() {
    this.fetchData();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  fetchData() {
    this.isLoading = true;
    this.errorLoading = false;
    this.errorMessage = '';
    this.initialLoadAttempted = true;

    this.http.get<AirQualityData[]>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Error fetching air quality data:', err);
          this.errorLoading = true;
          this.errorMessage = `Nie udało się połączyć z serwerem (${err.status || 'Network Error'}). Sprawdź konsolę po więcej szczegółów.`;
          if (err.status === 0) {
             this.errorMessage = 'Nie udało się połączyć z serwerem. Sprawdź czy serwer API jest uruchomiony i czy nie ma problemów z CORS.';
          }
          this.data = [];
          return throwError(() => err);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (response) => {
          this.data = response;
          if (this.data && this.data.length > 0) {
            this.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            if (this.chart) {
                this.updateChart();
            } else {
                this.initChart();
            }
          } else if (!this.errorLoading) {
            console.warn("Dane jakości powietrza są puste.");
            if (this.chart) this.chart.destroy();
          }
        }
      );
  }

  private initChart() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
        console.error("Chart canvas not available");
        this.errorLoading = true;
        this.errorMessage = "Nie można zainicjalizować wykresu - element canvas nie jest dostępny.";
        return;
    }
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
        console.error("Failed to get 2D context from chart canvas");
        this.errorLoading = true;
        this.errorMessage = "Nie można zainicjalizować wykresu - błąd kontekstu 2D.";
        return;
    }

    if (!this.data || this.data.length === 0) {
        console.warn("Attempted to initialize chart with no data.");
        return;
    }


    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.data.map(item => this.formatDate(item.date)),
        datasets: [
          {
            label: 'Średnia',
            data: this.data.map(item => item.averages[this.selectedParameter] ?? null),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: false,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Minimum',
            data: this.data.map(item => item.minimums[this.selectedParameter] ?? null),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: false,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Maksimum',
            data: this.data.map(item => item.maximums[this.selectedParameter] ?? null),
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: false,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
          title: {
            display: true,
            text: this.getChartTitle(),
            font: {
              size: 16,
              weight: 'bold'
            },
            color: document.body.classList.contains('dark') ? '#E5E7EB' : '#374151',
          } as TitleOptions,
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2);
                  const unit = this.getYAxisLabel();
                  if (unit && unit !== 'Wartość') label += ` ${unit}`;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data',
              color: document.body.classList.contains('dark') ? '#9CA3AF' : '#4B5563',
            },
            ticks: {
              color: document.body.classList.contains('dark') ? '#9CA3AF' : '#4B5563',
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {
              color: document.body.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          },
          y: {
            title: {
              display: true,
              text: this.getYAxisLabel(),
              color: document.body.classList.contains('dark') ? '#9CA3AF' : '#4B5563',
            },
            ticks: {
              color: document.body.classList.contains('dark') ? '#9CA3AF' : '#4B5563',
            },
            grid: {
              color: document.body.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }
          }
        }
      }
    };
    if (config.options?.plugins?.tooltip?.callbacks) {
        (config.options.plugins.tooltip.callbacks as any).getYAxisLabelExternal = this.getYAxisLabel.bind(this);
    }


    this.chart = new Chart(ctx, config);
  }

  updateChart() {
    if (!this.chart || !this.data || this.data.length === 0) {
        if (this.data && this.data.length > 0) {
            this.initChart();
        } else if (!this.isLoading) {
            console.warn("UpdateChart called with no data. Clearing chart if exists.");
            if(this.chart) {
                this.chart.data.labels = [];
                this.chart.data.datasets.forEach(dataset => dataset.data = []);
                this.chart.update();
            }
        }
        return;
    }


    this.chart.data.labels = this.data.map(item => this.formatDate(item.date));
    this.chart.data.datasets[0].data = this.data.map(item => item.averages[this.selectedParameter] ?? null);
    this.chart.data.datasets[1].data = this.data.map(item => item.minimums[this.selectedParameter] ?? null);
    this.chart.data.datasets[2].data = this.data.map(item => item.maximums[this.selectedParameter] ?? null);

    const chartTitle = this.getChartTitle();
    const yAxisLabel = this.getYAxisLabel();

    if (this.chart.options.plugins?.title) {
      (this.chart.options.plugins.title as TitleOptions).text = chartTitle;
    }



    this.chart.update();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private getChartTitle(): string {
    const param = this.availableParameters.find(p => p.key === this.selectedParameter);
    return param ? `${param.label} - analiza czasowa` : 'Wykres jakości powietrza';
  }

  public getYAxisLabel(): string {
    const param = this.availableParameters.find(p => p.key === this.selectedParameter);
    return param?.unit || 'Wartość';
  }
}

