import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chart-container">
      <div class="controls">
        <label for="parameterSelect">Wybierz parametr:</label>
        <select
          id="parameterSelect"
          [(ngModel)]="selectedParameter"
          (change)="updateChart()"
          class="parameter-select">
          <option *ngFor="let param of availableParameters" [value]="param.key">
            {{param.label}} ({{param.unit}})
          </option>
        </select>
      </div>

      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #36A2EB;"></span>
          <span>Średnia</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #FF6384;"></span>
          <span>Minimum</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #4BC0C0;"></span>
          <span>Maksimum</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 1200px;
      margin: 0 auto;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .parameter-select {
      padding: 8px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      min-width: 200px;
    }

    .parameter-select:focus {
      outline: none;
      border-color: #007bff;
    }

    .chart-wrapper {
      position: relative;
      height: 400px;
      margin-bottom: 20px;
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    label {
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 768px) {
      .chart-container {
        padding: 15px;
      }

      .controls {
        flex-direction: column;
        align-items: flex-start;
      }

      .parameter-select {
        width: 100%;
      }
    }
  `]
})
export class AirQualityChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;
  selectedParameter = 'pm25';

  // Przykładowe dane - zastąp swoimi rzeczywistymi danymi
  data: AirQualityData[] = [
    {
      "date": "2023-02-22",
      "averages": {
        "no": 2955.46,
        "co2": 895.92,
        "pm10": 108.63,
        "h2s": 3.17,
        "tout": 98.31,
        "co": 0.058,
        "rhin": 752.07,
        "rhout": 691.12,
        "p": 98691.65,
        "no2": 0.0065,
        "hcl": 17.90,
        "hcho": 6.41,
        "hcn": 432.86,
        "pm25": 40.75,
        "so2": 0,
        "iaq": 244.44,
        "tin": 96.23,
        "nh3": 176.64,
        "ec": 0
      },
      "minimums": {
        "no": 0,
        "co2": 859,
        "pm10": 58,
        "h2s": 1,
        "tout": 83,
        "co": 0,
        "rhin": 636,
        "rhout": 607,
        "p": 98677,
        "no2": 0,
        "hcl": 0,
        "hcho": 3,
        "hcn": 24,
        "pm25": 32,
        "so2": 0,
        "iaq": 189,
        "tin": 76,
        "nh3": 126,
        "ec": 0
      },
      "maximums": {
        "no": 7320,
        "co2": 921,
        "pm10": 300,
        "h2s": 20,
        "tout": 123,
        "co": 1,
        "rhin": 829,
        "rhout": 751,
        "p": 98708,
        "no2": 2,
        "hcl": 190,
        "hcho": 7,
        "hcn": 1123,
        "pm25": 52,
        "so2": 0,
        "iaq": 393,
        "tin": 133,
        "nh3": 234,
        "ec": 0
      }
    },
    // Dodaj więcej dat dla lepszej wizualizacji
    {
      "date": "2023-02-23",
      "averages": {
        "no": 2800.25,
        "co2": 885.45,
        "pm10": 95.23,
        "h2s": 2.98,
        "tout": 102.15,
        "co": 0.062,
        "rhin": 745.32,
        "rhout": 678.94,
        "p": 98695.23,
        "no2": 0.0078,
        "hcl": 19.45,
        "hcho": 5.87,
        "hcn": 398.76,
        "pm25": 38.91,
        "so2": 0.1,
        "iaq": 231.67,
        "tin": 94.58,
        "nh3": 182.45,
        "ec": 0.05
      },
      "minimums": {
        "no": 12,
        "co2": 862,
        "pm10": 52,
        "h2s": 0.8,
        "tout": 87,
        "co": 0,
        "rhin": 628,
        "rhout": 598,
        "p": 98681,
        "no2": 0,
        "hcl": 2,
        "hcho": 2.8,
        "hcn": 18,
        "pm25": 28,
        "so2": 0,
        "iaq": 178,
        "tin": 72,
        "nh3": 134,
        "ec": 0
      },
      "maximums": {
        "no": 6890,
        "co2": 915,
        "pm10": 285,
        "h2s": 18,
        "tout": 127,
        "co": 0.9,
        "rhin": 825,
        "rhout": 745,
        "p": 98712,
        "no2": 1.8,
        "hcl": 175,
        "hcho": 6.9,
        "hcn": 1089,
        "pm25": 49,
        "so2": 0.5,
        "iaq": 378,
        "tin": 128,
        "nh3": 245,
        "ec": 0.2
      }
    },
    {
      "date": "2023-02-22",
      "averages": {
        "no": 2955.46,
        "co2": 895.92,
        "pm10": 108.63,
        "h2s": 3.17,
        "tout": 98.31,
        "co": 0.058,
        "rhin": 752.07,
        "rhout": 691.12,
        "p": 98691.65,
        "no2": 0.0065,
        "hcl": 17.90,
        "hcho": 6.41,
        "hcn": 432.86,
        "pm25": 40.75,
        "so2": 0,
        "iaq": 244.44,
        "tin": 96.23,
        "nh3": 176.64,
        "ec": 0
      },
      "minimums": {
        "no": 0,
        "co2": 859,
        "pm10": 58,
        "h2s": 1,
        "tout": 83,
        "co": 0,
        "rhin": 636,
        "rhout": 607,
        "p": 98677,
        "no2": 0,
        "hcl": 0,
        "hcho": 3,
        "hcn": 24,
        "pm25": 32,
        "so2": 0,
        "iaq": 189,
        "tin": 76,
        "nh3": 126,
        "ec": 0
      },
      "maximums": {
        "no": 7320,
        "co2": 921,
        "pm10": 300,
        "h2s": 20,
        "tout": 123,
        "co": 1,
        "rhin": 829,
        "rhout": 751,
        "p": 98708,
        "no2": 2,
        "hcl": 190,
        "hcho": 7,
        "hcn": 1123,
        "pm25": 52,
        "so2": 0,
        "iaq": 393,
        "tin": 133,
        "nh3": 234,
        "ec": 0
      }
    },{
      "date": "2023-02-22",
      "averages": {
        "no": 2955.46,
        "co2": 895.92,
        "pm10": 108.63,
        "h2s": 3.17,
        "tout": 98.31,
        "co": 0.058,
        "rhin": 752.07,
        "rhout": 691.12,
        "p": 98691.65,
        "no2": 0.0065,
        "hcl": 17.90,
        "hcho": 6.41,
        "hcn": 432.86,
        "pm25": 40.75,
        "so2": 0,
        "iaq": 244.44,
        "tin": 96.23,
        "nh3": 176.64,
        "ec": 0
      },
      "minimums": {
        "no": 0,
        "co2": 859,
        "pm10": 58,
        "h2s": 1,
        "tout": 83,
        "co": 0,
        "rhin": 636,
        "rhout": 607,
        "p": 98677,
        "no2": 0,
        "hcl": 0,
        "hcho": 3,
        "hcn": 24,
        "pm25": 32,
        "so2": 0,
        "iaq": 189,
        "tin": 76,
        "nh3": 126,
        "ec": 0
      },
      "maximums": {
        "no": 7320,
        "co2": 921,
        "pm10": 300,
        "h2s": 20,
        "tout": 123,
        "co": 1,
        "rhin": 829,
        "rhout": 751,
        "p": 98708,
        "no2": 2,
        "hcl": 190,
        "hcho": 7,
        "hcn": 1123,
        "pm25": 52,
        "so2": 0,
        "iaq": 393,
        "tin": 133,
        "nh3": 234,
        "ec": 0
      }
    },{
      "date": "2023-02-22",
      "averages": {
        "no": 2955.46,
        "co2": 895.92,
        "pm10": 108.63,
        "h2s": 3.17,
        "tout": 98.31,
        "co": 0.058,
        "rhin": 752.07,
        "rhout": 691.12,
        "p": 98691.65,
        "no2": 0.0065,
        "hcl": 17.90,
        "hcho": 6.41,
        "hcn": 432.86,
        "pm25": 40.75,
        "so2": 0,
        "iaq": 244.44,
        "tin": 96.23,
        "nh3": 176.64,
        "ec": 0
      },
      "minimums": {
        "no": 0,
        "co2": 859,
        "pm10": 58,
        "h2s": 1,
        "tout": 83,
        "co": 0,
        "rhin": 636,
        "rhout": 607,
        "p": 98677,
        "no2": 0,
        "hcl": 0,
        "hcho": 3,
        "hcn": 24,
        "pm25": 32,
        "so2": 0,
        "iaq": 189,
        "tin": 76,
        "nh3": 126,
        "ec": 0
      },
      "maximums": {
        "no": 7320,
        "co2": 921,
        "pm10": 300,
        "h2s": 20,
        "tout": 123,
        "co": 1,
        "rhin": 829,
        "rhout": 751,
        "p": 98708,
        "no2": 2,
        "hcl": 190,
        "hcho": 7,
        "hcn": 1123,
        "pm25": 52,
        "so2": 0,
        "iaq": 393,
        "tin": 133,
        "nh3": 234,
        "ec": 0
      }
    },
  ];

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
    { key: 'p', label: 'Ciśnienie', unit: 'Pa' },
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
    this.initChart();

  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.data.map(item => this.formatDate(item.date)),
        datasets: [
          {
            label: 'Średnia',
            data: this.data.map(item => item.averages[this.selectedParameter]),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: false,
            tension: 0.2
          },
          {
            label: 'Minimum',
            data: this.data.map(item => item.minimums[this.selectedParameter]),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: false,
            tension: 0.2
          },
          {
            label: 'Maksimum',
            data: this.data.map(item => item.maximums[this.selectedParameter]),
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.getChartTitle(),
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false // Używamy własnej legendy
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data'
            }
          },
          y: {
            title: {
              display: true,
              text: this.getYAxisLabel()
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart() {
    if (!this.chart) return;

    // Aktualizuj dane
    this.chart.data.datasets[0].data = this.data.map(item => item.averages[this.selectedParameter]);
    this.chart.data.datasets[1].data = this.data.map(item => item.minimums[this.selectedParameter]);
    this.chart.data.datasets[2].data = this.data.map(item => item.maximums[this.selectedParameter]);

    // Aktualizuj tytuł i etykiety
    if (this.chart.options.plugins?.title) {
      this.chart.options.plugins.title.text = this.getChartTitle();
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

  private getYAxisLabel(): string {
    const param = this.availableParameters.find(p => p.key === this.selectedParameter);
    return param?.unit || 'Wartość';
  }
}
