import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'garlaws-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-page">
      <header class="hero">
        <h1 class="hero-title">GARLAWS</h1>
        <p class="hero-subtitle">Property Lifecycle Maintenance Orchestration Ecosystem</p>
        <p class="hero-tagline">Design • Build • Maintain</p>
      </header>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--garlaws-black) 0%, var(--garlaws-navy) 100%);
    }
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .hero-title {
      font-size: 4rem;
      font-weight: 700;
      letter-spacing: 0.5rem;
      color: var(--garlaws-gold);
      margin: 0;
    }
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--garlaws-slate);
      margin-top: 1rem;
    }
    .hero-tagline {
      font-size: 1rem;
      color: var(--garlaws-olive);
      margin-top: 0.5rem;
      letter-spacing: 0.25rem;
    }
  `]
})
export class HomeComponent {}