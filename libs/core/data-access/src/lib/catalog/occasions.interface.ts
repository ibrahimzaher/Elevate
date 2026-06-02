import { CatalogMetadata } from './catalog.interface';

export interface Occasion {
  id: any;
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
  isSuperAdmin?: boolean;
  productsCount?: number;
}

export interface OccasionsRes {
  message: string;
  metadata: CatalogMetadata;
  occasions: Occasion[];
}
