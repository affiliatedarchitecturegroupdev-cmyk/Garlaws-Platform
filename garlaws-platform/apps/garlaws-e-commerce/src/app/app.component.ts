import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'garlaws-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="ecommerce-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .ecommerce-container {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {}