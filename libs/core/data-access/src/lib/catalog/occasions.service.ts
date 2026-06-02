import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { OccasionsRes, Occasion } from './occasions.interface';
import { catalogUrl, loadAllPages, pageParams } from './catalog-http.util';

@Injectable({
  providedIn: 'root',
})
export class OccasionsService {
  private readonly http = inject(HttpClient);

  getOccasions(page = 1, limit = 100): Observable<OccasionsRes> {
    return this.http.get<OccasionsRes>(catalogUrl('occasions'), {
      params: pageParams(page, limit),
    });
  }

  getAllOccasions(limit = 100): Observable<Occasion[]> {
    return loadAllPages(
      (page) => this.getOccasions(page, limit),
      (res) => res.occasions
    );
  }

  createOccasion(data: Partial<Occasion>): Observable<any> {
    return this.http.post(
      catalogUrl('occasions'),
      data
    );
  }

  updateOccasion(id: string, data: Partial<Occasion>): Observable<any> {
    return this.http.put(
      `${catalogUrl('occasions')}/${id}`,
      data
    );
  }

  deleteOccasion(id: string): Observable<any> {
    return this.http.delete(
      `${catalogUrl('occasions')}/${id}`
    );
  }
}
