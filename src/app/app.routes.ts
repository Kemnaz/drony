import { Routes } from '@angular/router';
import { AirQualityComponent } from './air-quality/air-quality.component';

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
  },  { path: 'air-quality', component: AirQualityComponent }

];
