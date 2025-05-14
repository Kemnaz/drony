import { Routes } from '@angular/router';

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
];
