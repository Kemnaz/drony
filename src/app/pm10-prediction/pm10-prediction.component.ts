import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartType, registerables, TitleOptions, TooltipItem } from 'chart.js';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import localepl from '@angular/common/locales/pl';

registerLocaleData(localepl, 'pl-PL');

Chart.register(...registerables);

interface PredictionPoint {
  timestamp: string;
  predictedPM10: number;
}

interface PredictionSummary {
  avgPredictedPM10: number;
  minPredictedPM10: number;
  maxPredictedPM10: number;
  trend: string;
}

interface PM10PredictionData {
  generatedAt: string;
  lastMeasuredPM10: number;
  lastMeasurementTime: string;
  predictionHorizonMinutes: number;
  predictions: PredictionPoint[];
  summary: PredictionSummary;
}

@Component({
  selector: 'app-pm10-prediction',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  templateUrl: './pm10-prediction.component.html',
  styleUrls: ['./pm10-prediction.component.scss'],
  providers: [DatePipe]
})
export class Pm10PredictionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('predictionChartCanvas') predictionChartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;
  private http = inject(HttpClient);
  private datePipe = inject(DatePipe);
  private cdr = inject(ChangeDetectorRef);

  predictionData: PM10PredictionData | null = null;
  isLoading = true;
  errorLoading = false;
  errorMessage = '';

  private apiUrl = 'http://localhost:8080/api/pm10/predictions/latest';

  isDarkTheme = false;

  constructor() {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkTheme = true;
    }
    this.fetchPredictionData();
  }

  ngAfterViewInit() {
    if (this.predictionData && this.predictionData.predictions && this.predictionData.predictions.length > 0) {
      setTimeout(() => {
        this.initChart();
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.updateChartAppearance();
  }

  fetchPredictionData() {
    this.isLoading = true;
    this.errorLoading = false;
    this.errorMessage = '';
    this.predictionData = null;

    this.http.get<PM10PredictionData>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Error fetching PM10 prediction data:', err);
          this.errorLoading = true;
          this.errorMessage = `Nie udało się połączyć z serwerem (${err.status || 'Network Error'}). Sprawdź konsolę po więcej szczegółów.`;
          if (err.status === 0) {
             this.errorMessage = 'Nie udało się połączyć z serwerem. Sprawdź czy serwer API jest uruchomiony i czy nie ma problemów z CORS.';
          }
          return throwError(() => err);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        this.predictionData = response;
        if (this.predictionData && this.predictionData.predictions && this.predictionData.predictions.length > 0) {
          this.predictionData.predictions.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());



          setTimeout(() => {
            this.initChart();
          }, 0);
        } else if (!this.errorLoading) {
          console.warn("Otrzymano puste dane predykcji PM10 lub brak predykcji.");
        }
      });
  }

  private getChartColors() {
    const isDark = this.isDarkTheme;
    return {
      textColor: isDark ? '#d1d5db' : '#374151',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      tooltipBgColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
      tooltipTextColor: isDark ? '#ffffff' : '#000000',
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      predictionLineColor: '#3b82f6',
    };
  }

  private updateChartAppearance() {
    if (!this.chart) return;
    const colors = this.getChartColors();

    if (this.chart.options.plugins?.title) {
      (this.chart.options.plugins.title as TitleOptions).color = colors.textColor;
    }

    this.chart.update();
  }

  private initChart() {
    if (!this.predictionChartCanvas || !this.predictionChartCanvas.nativeElement) {
      console.error("Prediction chart canvas not available");
      return;
    }

    const ctx = this.predictionChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error("Failed to get 2D context from prediction chart canvas");
      return;
    }

    if (!this.predictionData || !this.predictionData.predictions || this.predictionData.predictions.length === 0) {
      console.warn("Attempted to initialize prediction chart with no data.");
      return;
    }

    const colors = this.getChartColors();

    const chartData = {
      labels: this.predictionData.predictions.map(p =>
        this.datePipe.transform(p.timestamp, 'HH:mm', '', 'pl-PL')
      ),
      datasets: [{
        label: `Przewidywane PM10 (µg/m³)`,
        data: this.predictionData.predictions.map(p => p.predictedPM10),
        borderColor: colors.predictionLineColor,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.predictionLineColor,
      }]
    };

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: chartData,
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
            text: `Predykcja PM10 na najbliższe ${this.predictionData.predictionHorizonMinutes} minut`,
            font: { size: 16, weight: 'bold' },
            color: colors.textColor,
            padding: { top: 10, bottom: 20 }
          } as TitleOptions,
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: colors.tooltipBgColor,
            titleColor: colors.tooltipTextColor,
            bodyColor: colors.tooltipTextColor,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            displayColors: false,
            callbacks: {
              title: (tooltipItems: TooltipItem<'line'>[]) => {
                const originalTimestamp = this.predictionData?.predictions[tooltipItems[0].dataIndex].timestamp;
                return this.datePipe.transform(originalTimestamp, 'MMM d, y, HH:mm:ss', '', 'pl-PL') || '';
              },
              label: (tooltipItem: TooltipItem<'line'>) => {
                let label = `Przewidywane PM10: ${tooltipItem.formattedValue} µg/m³`;
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Czas',
              color: colors.textColor,
              font: { size: 12 }
            },
            ticks: { color: colors.textColor, font: { size: 11 } },
            grid: { color: colors.gridColor, drawOnChartArea: false },
          },
          y: {
            title: {
              display: true,
              text: 'PM10 (µg/m³)',
              color: colors.textColor,
              font: { size: 12 }
            },
            ticks: { color: colors.textColor, font: { size: 11 } },
            grid: { color: colors.gridColor },
            beginAtZero: false,
          }
        }
      }
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(ctx, config);
  }

  formatDisplayDate(dateString: string | null | undefined, format: string = 'medium'): string {
    if (!dateString) return 'N/A';
    try {
      return this.datePipe.transform(dateString, format, '', 'pl-PL') || 'N/A';
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  }

  getTrendClass(trend: string | undefined): string {
    if (!trend) return '';
    switch (trend.toUpperCase()) {
      case 'ROSNĄCY': return 'trend-increasing';
      case 'MALEJĄCY': return 'trend-decreasing';
      case 'STABILNY': return 'trend-stable';
      default: return '';
    }
  }
}
