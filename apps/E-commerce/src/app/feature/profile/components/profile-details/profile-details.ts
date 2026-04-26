import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthRepo, eAuthStateService } from '@elevate/auth-domain';

@Component({
  selector: 'app-profile-details',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-details.html',
  styleUrl: './profile-details.css',
})
export class ProfileDetails implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _authRepo = inject(AuthRepo);
  private readonly _authState = inject(eAuthStateService);

  profileForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showDeleteModal = false;
  selectedFile: File | null = null;
  photoPreview: string | null = null;

  ngOnInit(): void {
    this.profileForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
    });

    this.loadUserData();
  }

  loadUserData() {
    const user = this._authState.currentUser();
    if (user) {
      this.populateForm(user);
    } else {
      this._authRepo.profileData().subscribe({
        next: (res) => {
          this.populateForm(res.user);
        },
        error: (err) => {
          console.error('Error fetching profile data', err);
        },
      });
    }
  }

  private populateForm(user: any) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender || 'male',
    });
    if (user.photo) {
      this.photoPreview = user.photo;
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValues = this.profileForm.getRawValue();
    let payload: any;

    if (this.selectedFile) {
      // If there's a file, we might need FormData
      // The `AuthApiService` will need to accept FormData for EditProfileParams
      payload = new FormData();
      Object.keys(formValues).forEach(key => {
        payload.append(key, formValues[key]);
      });
      payload.append('photo', this.selectedFile);
    } else {
      payload = formValues;
    }

    this._authRepo.editProfile(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to update profile.';
      },
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    this._authRepo.deleteMe().subscribe({
      next: () => {
        this._authRepo.cleanData();
        window.location.href = '/auth/login';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete account.';
        this.closeDeleteModal();
      },
    });
  }
}
