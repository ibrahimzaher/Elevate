import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthRepo } from '@elevate/auth-domain';

@Component({
  selector: 'app-profile-security',
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './profile-security.html',
  styleUrl: './profile-security.css',
})
export class ProfileSecurity {
  private readonly _fb = inject(FormBuilder);
  private readonly _authRepo = inject(AuthRepo);

  passwordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.passwordForm = this._fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const confirmCtrl = control.get('confirmPassword');
      if (confirmCtrl?.hasError('passwordMismatch')) {
        delete confirmCtrl.errors?.['passwordMismatch'];
        if (Object.keys(confirmCtrl.errors || {}).length === 0) {
          confirmCtrl.setErrors(null);
        }
      }
      return null;
    }
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      password: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
    };

    this._authRepo.changePassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to change password.';
      },
    });
  }
}
