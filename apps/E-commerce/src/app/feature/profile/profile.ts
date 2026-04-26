import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthRepo } from '@elevate/auth-domain';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly _authRepo = inject(AuthRepo);
  private readonly _router = inject(Router);

  logout() {
    this._authRepo.logout().subscribe({
      next: () => {
        this._router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Force logout locally if API fails
        this._authRepo.cleanData();
        this._router.navigate(['/auth/login']);
      }
    });
  }
}
