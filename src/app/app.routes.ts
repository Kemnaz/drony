import { Routes } from '@angular/router';
import { AirQualityComponent } from './air-quality/air-quality.component';
import { AirQualityChartComponent } from './chart/chart.component';
import { Pm10PredictionComponent } from './pm10-prediction/pm10-prediction.component';

export const routes: Routes = [
  { path: '', redirectTo: '/table', pathMatch: 'full' },
  {
    path: 'table',
    loadComponent: () =>
      import('./table/table.component').then((m) => m.TableComponent),
  },
  {
    path: 'graph',
    loadComponent: () =>
      import('./graph/graph.component').then((m) => m.GraphComponent),
  },
  { path: 'air-quality', component: AirQualityComponent },
  { path: 'Graftest', component: AirQualityChartComponent },
  { path: 'Predictions', component: Pm10PredictionComponent }
];
