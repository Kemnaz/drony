import { MatToolbarModule } from '@angular/material/toolbar';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Drone Data Viewer';
}
