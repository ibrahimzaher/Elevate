import { Component, effect, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../../shared/components/ui/product-card/interface/product';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './product-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGalleryComponent {
  product = input.required<Product | null>();

  mainImage = signal<string>('');

  constructor() {
    effect(() => {
      const cover = this.product()?.imgCover;
      if (cover) {
        this.mainImage.set(cover);
      }
    });
  }

  changeImage(imgUrl: string): void {
    this.mainImage.set(imgUrl);
  }
}
