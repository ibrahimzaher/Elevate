import {
  Component,
  inject,
  signal,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { EditOccasionComponent } from './editOccasions.component';

@Component({
  selector: 'app-edit-occasion',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (isOpen()) {
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl border border-zinc-100 dark:border-zinc-800 text-start"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Update Occasion
          </h2>
          <button
            (click)="closeModal()"
            class="text-zinc-400 hover:text-zinc-600 text-lg"
          >
            &times;
          </button>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label
              for="edit-name"
              class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >Occasion Name *</label
            >
            <input
              id="edit-name"
              type="text"
              formControlName="name"
              class="w-full px-3 py-2 border rounded-md text-sm bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >Occasion Image</label
            >
            <input
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="text-xs text-zinc-500"
            />
            @if (imagePreview()) {
            <div class="mt-2 w-24 h-24 rounded-md overflow-hidden border">
              <img
                [src]="imagePreview()"
                class="w-full h-full object-cover"
                alt="Preview"
              />
            </div>
            }
          </div>

          <div class="pt-4 flex justify-end gap-2">
            <button
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="editForm.invalid || isLoading()"
              class="px-4 py-2 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-md text-sm"
            >
              {{ isLoading() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    }
  `,
})
class EditOccasionModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  @Input() occasionData: any = null;
  @Output() updated = new EventEmitter<any>();

  isOpen = signal(false);
  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    if (this.occasionData) {
      this.editForm.patchValue({ name: this.occasionData.name });
      this.imagePreview.set(this.occasionData.image);
      this.isOpen.set(true);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.updated.emit(null);
  }

  onSubmit(): void {
    if (this.editForm.invalid) return;
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http
      .put(
        `https://flower.elevateegy.com/api/v1/occasions/${this.occasionData._id}`,
        formData
      )
      .subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          alert('Occasion Updated Successfully ✔');
          this.updated.emit(
            res.data || {
              _id: this.occasionData._id,
              name: this.editForm.value.name,
              image: this.imagePreview(),
            }
          );
          this.isOpen.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}

@Component({
  selector: 'app-occasions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    TranslateModule,
    EditOccasionComponent,
  ],
  template: `
    <div class="mx-auto max-w-4xl p-8 text-start space-y-10">
      <div
        class="max-w-xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-zinc-100 dark:border-zinc-800"
      >
        <h1 class="mb-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          {{ 'DASHBOARD.PAGES.OCCASIONS.TITLE' | translate }}
        </h1>
        <p class="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          {{ 'DASHBOARD.PAGES.OCCASIONS.DESCRIPTION' | translate }}
        </p>

        <form
          [formGroup]="occasionForm"
          (ngSubmit)="onSubmit()"
          class="space-y-5"
        >
          <div class="flex flex-col gap-1.5">
            <label
              for="name"
              class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >Occasion Name *</label
            >
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Enter occasion name"
              class="w-full px-3 py-2 border rounded-md text-sm bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >Occasion Image *</label
            >
            <input
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="block w-full text-sm text-zinc-500 cursor-pointer"
            />
            @if (imagePreview()) {
            <div
              class="mt-3 w-32 h-32 rounded-lg overflow-hidden border shadow-sm"
            >
              <img
                [src]="imagePreview()"
                class="w-full h-full object-cover"
                alt="Preview"
              />
            </div>
            }
          </div>

          <div class="pt-4 flex justify-end">
            <button
              type="submit"
              [disabled]="occasionForm.invalid || isLoading()"
              class="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 flex items-center gap-2 shadow"
            >
              @if (isLoading()) {
              <span
                class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              ></span>
              } Save Occasion
            </button>
          </div>
        </form>
      </div>

      <div
        class="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-100 dark:border-zinc-800"
      >
        <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Existing Occasions
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          @for (item of occasionsList(); track item._id) {
          <div
            class="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
          >
            <div class="flex items-center gap-3">
              <img
                [src]="item.image"
                class="w-12 h-12 rounded object-cover border"
                alt="Occasion image"
              />
              <span
                class="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                >{{ item.name }}</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <button
                (click)="openEditModal(item)"
                class="px-2 py-1 text-xs border rounded bg-white dark:bg-zinc-800"
              >
                Edit
              </button>
              <button
                (click)="onDeleteOccasion(item._id, item.name)"
                class="px-2 py-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          } @empty {
          <p class="text-zinc-500 text-sm col-span-full text-center py-4">
            No occasions found.
          </p>
          }
        </div>
      </div>
    </div>

    @if (selectedOccasion()) {
    <app-edit-occasion
      [occasionData]="selectedOccasion()"
      (updated)="onOccasionUpdated($event)"
    ></app-edit-occasion>
    }
  `,
})
export class OccasionsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  occasionsList = signal<any[]>([]);
  selectedOccasion = signal<any | null>(null);

  occasionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    image: [null, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadOccasions();
  }

  loadOccasions(): void {
    this.http
      .get('https://flower.elevateegy.com/api/v1/occasions?page=1&limit=100')
      .subscribe({
        next: (res: any) => {
          this.occasionsList.set(res.occasions || res.data || []);
        },
      });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      this.occasionForm.patchValue({ image: file });
      this.occasionForm.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.occasionForm.invalid) return;
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('name', this.occasionForm.value.name);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.http
      .post('https://flower.elevateegy.com/api/v1/occasions', formData)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Occasion Added Successfully ✔');
          this.occasionForm.reset();
          this.imagePreview.set(null);
          this.selectedFile = null;
          this.loadOccasions();
        },
        error: () => this.isLoading.set(false),
      });
  }

  openEditModal(occasion: any): void {
    this.selectedOccasion.set(occasion);
  }

  onOccasionUpdated(updatedItem: any): void {
    if (updatedItem) {
      this.occasionsList.update((list) =>
        list.map((item) =>
          item._id === updatedItem._id ? { ...item, ...updatedItem } : item
        )
      );
    }
    this.selectedOccasion.set(null);
  }

  onDeleteOccasion(id: string, name: string): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmDelete) {
      this.http
        .delete(`https://flower.elevateegy.com/api/v1/occasions/${id}`)
        .subscribe({
          next: () => {
            alert('Occasion Deleted Successfully ✔');
            this.occasionsList.update((list) =>
              list.filter((item) => item._id !== id)
            );
          },
          error: () => alert('Failed to delete.'),
        });
    }
  }
}
