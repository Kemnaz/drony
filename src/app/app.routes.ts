import { Routes } from '@angular/router';
import { AirQualityComponent } from './air-quality/air-quality.component';
import { AirQualityChartComponent } from './chart/chart.component';

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
  { path: 'Graftest', component: AirQualityChartComponent }
];
