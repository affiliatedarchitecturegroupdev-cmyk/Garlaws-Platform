import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

@Component({
  selector: 'garlaws-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop-page">
      <header class="shop-header">
        <h1>Garlaws Store</h1>
        <p>Premium Gardening & Landscaping Products</p>
      </header>
      
      <nav class="categories">
        <button class="cat-btn active">All</button>
        <button class="cat-btn">Plants</button>
        <button class="cat-btn">Pottery</button>
        <button class="cat-btn">Equipment</button>
        <button class="cat-btn">Tools</button>
      </nav>
      
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-image">{{product.category}}</div>
          <div class="product-info">
            <h3>{{product.name}}</h3>
            <p class="price">R {{product.price | number}}</p>
            <button class="add-btn">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shop-page { background: var(--light-grey); min-height: 100vh; }
    .shop-header {
      background: var(--garlaws-black);
      padding: 2rem;
      text-align: center;
    }
    .shop-header h1 { color: var(--garlaws-gold); margin: 0; }
    .shop-header p { color: var(--garlaws-slate); }
    .categories {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .cat-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--garlaws-slate);
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    .cat-btn.active {
      background: var(--garlaws-olive);
      color: white;
      border-color: var(--garlaws-olive);
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .product-image {
      height: 150px;
      background: var(--garlaws-navy);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.875rem;
    }
    .product-info { padding: 1rem; }
    .product-info h3 { margin: 0 0 0.5rem; color: var(--garlaws-black); }
    .price {
      color: var(--garlaws-gold);
      font-weight: 700;
      font-size: 1.25rem;
    }
    .add-btn {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: var(--garlaws-olive);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .add-btn:hover { background: var(--garlaws-black); }
  `]
})
export class ShopComponent {
  products: Product[] = [
    { id: 1, name: 'Indigenous Fern Bundle', category: 'Plants', price: 450, image: '' },
    { id: 2, name: 'Terracotta Planter Large', category: 'Pottery', price: 890, image: '' },
    { id: 3, name: 'Electric Pruning Shears', category: 'Equipment', price: 2500, image: '' },
    { id: 4, name: 'Garden Tool Set', category: 'Tools', price: 1200, image: '' },
    { id: 5, name: 'Aloe Vera Collection', category: 'Plants', price: 350, image: '' },
    { id: 6, name: 'Ceramic Pot Medium', category: 'Pottery', price: 450, image: '' },
  ];
}