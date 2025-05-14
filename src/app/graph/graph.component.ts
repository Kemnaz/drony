import { Component } from '@angular/core';

@Component({
  selector: 'app-graph',
  standalone: true,
  template: `
    <div class="text-center">
      <h2>Graph View</h2>
      <p class="text-muted">Drone data visualization will be displayed here</p>
    </div>
  `,
  styles: [
    `
      div {
        padding: 2rem;
        border: 2px dashed #dee2e6;
        border-radius: 10px;
      }
    `,
  ],
})
export class GraphComponent {}
