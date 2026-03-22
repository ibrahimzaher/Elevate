import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Product } from '../../shared/components/ui/product-card/interface/product';
import { CartService } from '../cart/services/cart.service';
import { Review } from '../products/interfaces/review';
import { ProductsService } from '../products/services/product';
import { ProductGalleryComponent } from './components/product-gallery/product-gallery.component';
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductReviewsComponent } from './components/product-reviews/product-reviews.component';
import { RelatedProductComponent } from './components/related-product/related-product.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product.details.html',
  imports: [
    ProductInfoComponent,
    ProductGalleryComponent,
    ProductReviewsComponent,
    RelatedProductComponent,
    TranslateModule,
  ],
})
export class ProductDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);
  productId = signal<string | null>(null);
  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  relatedProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingReviews = signal<boolean>(false);
  isLoadingRelated = signal<boolean>(false);

  ngOnInit(): void {
    this.watchRouteParams();
  }

  private watchRouteParams(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.productId.set(id);
          this.loadProductData(id);
        } else {
          this.handleInvalidProductId();
        }
      });
  }

  private loadProductData(id: string): void {
    this.isLoading.set(true);
    this.isLoadingReviews.set(true);
    this.isLoadingRelated.set(true);

    forkJoin({
      product: this.productService.getProductById(id),
      reviews: this.productService.getProductReviews(id),
      related: this.productService.getRelatedProductByID(id),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
          this.isLoadingReviews.set(false);
          this.isLoadingRelated.set(false);
        })
      )
      .subscribe({
        next: ({ product, reviews, related }) => {
          this.product.set(product.product);
          this.reviews.set(reviews.reviews || []);
          this.relatedProducts.set(related.relatedProducts || []);
        },
        error: () => {
          this.router.navigate(['/404'], { skipLocationChange: true });
        },
      });
  }

  private handleInvalidProductId(): void {
    this.router.navigate([`/products`]);
  }

  handleToggleWishlist(_id: string): void {
    //Implement Add to wishlist
  }

  handleAddToCart(id: string): void {
    this.cartService
      .addToCart(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
