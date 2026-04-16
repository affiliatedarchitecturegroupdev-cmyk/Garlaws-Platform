import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'garlaws-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="logo">GARLAWS</div>
        <nav class="nav">
          <a class="nav-item active">Dashboard</a>
          <a class="nav-item">Properties</a>
          <a class="nav-item">Services</a>
          <a class="nav-item">E-Commerce</a>
          <a class="nav-item">Analytics</a>
          <a class="nav-item">Compliance</a>
        </nav>
      </aside>
      <main class="content">
        <header class="header">
          <h1>Dashboard</h1>
          <div class="user-info">Admin</div>
        </header>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Active Properties</span>
            <span class="stat-value">24</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Pending Tasks</span>
            <span class="stat-value">12</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Revenue (MTD)</span>
            <span class="stat-value">R 245,000</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">B-BBEE Level</span>
            <span class="stat-value">Level 2</span>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      min-height: 100vh;
      background: var(--light-grey);
    }
    .sidebar {
      width: 250px;
      background: var(--garlaws-black);
      padding: 1rem;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--garlaws-gold);
      padding: 1rem;
      letter-spacing: 0.25rem;
    }
    .nav {
      margin-top: 2rem;
    }
    .nav-item {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--garlaws-slate);
      text-decoration: none;
      border-radius: 4px;
      margin-bottom: 0.25rem;
    }
    .nav-item:hover, .nav-item.active {
      background: var(--garlaws-olive);
      color: white;
    }
    .content {
      flex: 1;
      padding: 2rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      color: var(--garlaws-black);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--garlaws-slate);
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--garlaws-olive);
      margin-top: 0.5rem;
    }
  `]
})
export class DashboardComponent {}