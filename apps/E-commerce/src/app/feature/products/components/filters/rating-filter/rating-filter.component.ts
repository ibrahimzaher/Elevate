import { ChangeDetectionStrategy, Component, output, signal, inject, computed } from '@angular/core';
import { FilterResetBtnComponent } from '../filter-reset-btn/filter-reset-btn.component';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, Star } from 'lucide-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-rating-filter',
  imports: [FilterResetBtnComponent, TranslatePipe, LucideAngularModule],
  templateUrl: './rating-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingFilterComponent {
  readonly StarIcon = Star;
  private document = inject(DOCUMENT);

  selectedRating = signal<number | null>(null);
  hoverRating = signal<number | null>(null);

  ratingChange = output<number | null>();

  stars = [1, 2, 3, 4, 5];

  readonly displayRating = computed(() => {
    const hover = this.hoverRating();
    return hover !== null ? hover : (this.selectedRating() || 0);
  });

  readonly starClips = computed(() => {
    const rating = this.displayRating();
    const isRtl = this.document.documentElement.dir === 'rtl';
    
    return this.stars.map((star) => {
      let fill = 0;
      if (rating >= star) fill = 100;
      else if (rating === star - 0.5) fill = 50;

      if (fill === 100) return 'none';
      if (fill === 0) return 'inset(0 100% 0 0)';
      return isRtl ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)';
    });
  });

  onStarMousemove(event: MouseEvent, star: number): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isRtl = this.document.documentElement.dir === 'rtl';

    const isHalf = isRtl ? (x > rect.width / 2) : (x < rect.width / 2);
    this.hoverRating.set(star - (isHalf ? 0.5 : 0));
  }

  onStarMouseleave(): void {
    this.hoverRating.set(null);
  }

  onStarClick(event: MouseEvent, star: number): void {
    this.onStarMousemove(event, star);
    const rating = this.hoverRating();

    const newRating = this.selectedRating() === rating ? null : rating;
    this.selectedRating.set(newRating);
    this.ratingChange.emit(newRating);
  }

  onReset(emitChange = true): void {
    this.selectedRating.set(null);

    if (emitChange) {
      this.ratingChange.emit(null);
    }
  }
}