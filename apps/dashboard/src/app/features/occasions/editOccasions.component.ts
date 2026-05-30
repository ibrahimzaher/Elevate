import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-occasion',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl border border-zinc-100 dark:border-zinc-800 text-start animate-fade-in">

          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Update Occasion</h2>
            <button (click)="closeModal()" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg">&times;</button>
          </div>

          <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-4">

            <div class="flex flex-col gap-1.5">
              <label for="edit-name" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Occasion Name *</label>
              <input
                id="edit-name"
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border rounded-md text-sm bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              @if (editForm.get('name')?.touched && editForm.get('name')?.invalid) {
                <div class="text-red-500 text-xs">
                  @if (editForm.get('name')?.errors?.['required']) { <span>Required.</span> }
                  @if (editForm.get('name')?.errors?.['minlength']) { <span>Min 3 chars.</span> }
                </div>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Occasion Image</label>
              <input
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
                class="block w-full text-sm text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 file:cursor-pointer"
              />

              @if (imagePreview()) {
                <div class="mt-2 w-24 h-24 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <img [src]="imagePreview()" class="w-full h-full object-cover" alt="Current/New Preview"/>
                </div>
              }
            </div>

            <div class="pt-4 flex justify-end gap-2">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 rounded-md text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="editForm.invalid || isLoading()"
                class="px-4 py-2 rounded-md text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-2"
              >
                @if (isLoading()) { <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span> }
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    }
  `
})
export class EditOccasionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  // Inputs لتلقي البيانات من الشاشة الرئيسية
  @Input() occasionData: any = null;
  @Output() updated = new EventEmitter<any>(); // شرط الستوري: التحديث يسمّع فوراً

  isOpen = signal(false);
  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    // شرط الستوري: ملء البيانات الحالية وتجهيز الـ Preview تلقائياً
    if (this.occasionData) {
      this.editForm.patchValue({ name: this.occasionData.name });
      this.imagePreview.set(this.occasionData.image); // الصورة القديمة من السيرفر
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
    this.updated.emit(null); // لإغلاق الـ Modal من برة
  }

  onSubmit(): void {
    if (this.editForm.invalid) return;

    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http.put(`https://flower.elevateegy.com/api/v1/occasions/${this.occasionData._id}`, formData).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        alert('Occasion Updated Successfully ✔');
        this.updated.emit(res.data || { _id: this.occasionData._id, name: this.editForm.value.name, image: this.imagePreview() });
        this.isOpen.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        alert('Failed to update, please try again.');
      }
    });
  }
}
