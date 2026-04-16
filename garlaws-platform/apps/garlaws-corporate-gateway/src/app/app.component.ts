import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'garlaws-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="garlaws-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .garlaws-container {
      min-height: 100vh;
      background-color: var(--garlaws-black, #0b0c10);
      color: var(--garlaws-slate, #45a29e);
    }
  `]
})
export class AppComponent {
  title = 'Garlaws Platform';
}