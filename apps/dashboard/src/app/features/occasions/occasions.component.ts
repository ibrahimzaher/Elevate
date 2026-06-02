import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Occasion, OccasionsService } from '@elevate/core-data-access';
import { DashboardDataTableComponent } from '../../shared/components/dashboard-data-table/dashboard-data-table.component';
import { occasionsTableConfig } from './occasions-table.config';

@Component({
  selector: 'app-occasions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardDataTableComponent],
  templateUrl: './occasions.component.html',
})
export class OccasionsComponent implements OnInit {
  private readonly occasionsService = inject(OccasionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly config = occasionsTableConfig;
  readonly occasions = signal<Occasion[] | null>(null);

  readonly isModelOpen = signal(false);
  readonly isEditMode = signal(false);
  readonly selectedOccasionId = signal<string | null>(null);

  readonly isDeletePopupOpen = signal(false);
  readonly itemToDelete = signal<Occasion | null>(null);

  occasionForm = this.fb.group({
    name: ['', [Validators.required]],
    image: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadOccasions();
  }

  private loadOccasions(): void {
    this.occasionsService
      .getAllOccasions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (occasions) => this.occasions.set(occasions),
        error: (err: unknown) => console.error('خطأ أثناء جلب البيانات:', err),
      });
  }

  openModel(occasionOrId?: any): void {
    this.isModelOpen.set(true);

    if (occasionOrId) {
      this.isEditMode.set(true);

      if (typeof occasionOrId === 'object' && occasionOrId !== null) {
        const id = occasionOrId._id || occasionOrId.id;
        this.selectedOccasionId.set(id);
        this.occasionForm.patchValue({
          name: occasionOrId.name,
          image: occasionOrId.image,
        });
      } else if (typeof occasionOrId === 'string') {
        // إذا كان القادم مجرد ID نصي، نبحث عنه في القائمة الحالية لتعبئة النموذج
        this.selectedOccasionId.set(occasionOrId);
        const found = this.occasions()?.find(
          (o) => o._id === occasionOrId || o.id === occasionOrId
        );
        if (found) {
          this.occasionForm.patchValue({
            name: found.name,
            image: found.image,
          });
        }
      }
    } else {
      this.isEditMode.set(false);
      this.selectedOccasionId.set(null);
      this.occasionForm.reset({ name: '', image: '' });
    }
  }

  closeModel(): void {
    this.isModelOpen.set(false);
    this.isEditMode.set(false);
    this.selectedOccasionId.set(null);
    this.occasionForm.reset({ name: '', image: '' });
  }

  onSubmit(): void {
    if (this.occasionForm.invalid) {
      this.occasionForm.markAllAsTouched();
      return;
    }

    const formValues = this.occasionForm.getRawValue();

    const data: Partial<Occasion> = {
      name: formValues.name ?? '',
      image: formValues.image ?? '',
    };

    const id = this.selectedOccasionId();

    if (this.isEditMode() && id) {
      this.occasionsService
        .updateOccasion(id, data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadOccasions();
            this.closeModel();
          },
          error: (err: unknown) =>
            console.error('خطأ أثناء تحديث المناسبة:', err),
        });
    } else {
      this.occasionsService
        .createOccasion(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadOccasions();
            this.closeModel();
          },
          error: (err: unknown) =>
            console.error('خطأ أثناء إضافة المناسبة:', err),
        });
    }
  }
  onDelete(occasionOrId: any): void {
    if (typeof occasionOrId === 'object' && occasionOrId !== null) {
      this.itemToDelete.set(occasionOrId);
    } else if (typeof occasionOrId === 'string') {
      const found = this.occasions()?.find(
        (o) => o._id === occasionOrId || o.id === occasionOrId
      );
      if (found) {
        this.itemToDelete.set(found);
      } else {
        this.itemToDelete.set({
          _id: occasionOrId,
          name: 'هذه المناسبة',
        } as Occasion);
      }
    }
    this.isDeletePopupOpen.set(true);
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const occasion = this.itemToDelete();
    if (!occasion) return;

    const id = occasion._id || occasion.id;
    if (!id) return;

    this.occasionsService
      .deleteOccasion(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadOccasions();
          this.closeDeletePopup();
        },
        error: (err: unknown) => console.error('خطأ أثناء حذف المناسبة:', err),
      });
  }
}
