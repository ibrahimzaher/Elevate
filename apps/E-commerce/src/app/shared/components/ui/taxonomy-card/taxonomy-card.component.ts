import {
  Component,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Image, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-taxonomy-card',
  imports: [TranslatePipe, LucideAngularModule, NgOptimizedImage],
  templateUrl: './taxonomy-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxonomyCardComponent {
  private readonly router = inject(Router);

  readonly title = input.required<string>();
  readonly imageUrl = input<string | undefined>();
  readonly priority = input(false);
  readonly queryParamName = input.required<string>();
  readonly queryParamValue = input.required<string>();
  readonly productsCount = input<number | undefined>();
  readonly productsCountKey = input.required<string>();
  readonly ImageIcon = Image;

  navigateToProducts(): void {
    this.router.navigate(['/products'], {
      queryParams: {
        [this.queryParamName()]: this.queryParamValue(),
      },
    });
  }
}
