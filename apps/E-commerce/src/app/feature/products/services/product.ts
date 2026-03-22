import { environment } from '../../../../environments/environments';
import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../interfaces/product';
import { Product } from '../../../shared/components/ui/product-card/interface/product';
import { ReviewResponse } from '../interfaces/review';
import { RelatedProductsResponse } from '../interfaces/related';
import { SKIP_ERROR_TOAST } from '../../../core/constants/http-context';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = environment.baseUrl;
  private _http = inject(HttpClient);

  getProducts({
    page = 1,
    limit = 12,
    categoryId,
  }: {
    page?: number;
    limit?: number;
    categoryId?: string;
  } = {}): Observable<ProductsResponse> {
    let params = `?page=${page}&limit=${limit}`;
    if (categoryId) {
      params += `&category=${categoryId}`;
    }
    return this._http.get<ProductsResponse>(
      `${this.baseUrl}/products${params}`
    );
  }
  getProductById(id: string) {
    return this._http.get<{ product: Product }>(
      `${this.baseUrl}/products/${id}`,
      {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }
    );
  }
  getProductReviews(productId: string) {
    return this._http.get<ReviewResponse>(
      `${this.baseUrl}/products/${productId}/reviews`,
      {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }
    );
  }
  getRelatedProductByID(product_id: string) {
    return this._http.get<RelatedProductsResponse>(
      `${this.baseUrl}/related/category/${product_id}`,
      {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }
    );
  }
}