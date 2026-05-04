import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@elevate/reusable-ui';
import { GoogleMapsLoaderService } from '../../../../../../../../../core/services/google-maps-loader.service';

@Component({
  selector: 'app-address-map-step',
  imports: [GoogleMapsModule, TranslateModule, ButtonComponent],
  templateUrl: './address-map-step.component.html',
})
export class AddressMapStepComponent implements OnInit {
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  center = input.required<google.maps.LatLngLiteral>();
  zoom = input.required<number>();
  markerPosition = input.required<google.maps.LatLngLiteral>();
  markerOptions = input.required<google.maps.MarkerOptions>();
  isEdit = input.required<boolean>();
  isRtl = input.required<boolean>();

  back = output<void>();
  mapClicked = output<google.maps.MapMouseEvent>();
  findLocation = output<void>();
  submitted = output<void>();
  readonly isMapReady = signal(false);

  async ngOnInit(): Promise<void> {
    const isLoaded = await this.googleMapsLoader.load();
    this.isMapReady.set(isLoaded);
  }

  onBack() {
    this.back.emit();
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    this.mapClicked.emit(event);
  }

  onFindLocation() {
    this.findLocation.emit();
  }

  onSubmit() {
    this.submitted.emit();
  }
}
