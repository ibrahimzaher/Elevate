import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environments';

declare global {
  interface Window {
    __elevateGoogleMapsInit?: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scriptId = 'google-maps-sdk';
  private readonly callbackName = '__elevateGoogleMapsInit';
  private loadPromise?: Promise<boolean>;

  load(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId) || !environment.googleMapsKey) {
      return Promise.resolve(false);
    }

    const googleMaps = (globalThis as typeof globalThis & {
      google?: { maps?: { Map?: unknown } };
    }).google?.maps;

    if (googleMaps?.Map) {
      return Promise.resolve(true);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const existingScript = this.document.getElementById(
      this.scriptId
    ) as HTMLScriptElement | null;

    if (existingScript) {
      this.loadPromise = new Promise<boolean>((resolve, reject) => {
        if (this.isMapsApiReady()) {
          resolve(true);
          return;
        }

        existingScript.addEventListener('load', () => {
          if (this.isMapsApiReady()) {
            resolve(true);
          }
        }, {
          once: true,
        });
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Google Maps failed to load.')),
          { once: true }
        );
      });

      return this.loadPromise;
    }

    this.loadPromise = new Promise<boolean>((resolve, reject) => {
      window[this.callbackName] = () => {
        resolve(true);
        delete window[this.callbackName];
      };

      const script = this.document.createElement('script');
      script.id = this.scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsKey}&v=weekly&libraries=maps,marker&callback=${this.callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        delete window[this.callbackName];
        reject(new Error('Google Maps failed to load.'));
      };
      this.document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  private isMapsApiReady(): boolean {
    const googleMaps = (globalThis as typeof globalThis & {
      google?: { maps?: { Map?: unknown } };
    }).google?.maps;

    return Boolean(googleMaps?.Map);
  }
}
