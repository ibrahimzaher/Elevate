import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ConfirmDialogComponent } from './shared/components/ui/dialogs/confirm-dialog/confirm-dialog.component';
import { SeoService } from './core/services/seo.service';

@Component({
  imports: [
    RouterOutlet,
    NgxSpinnerComponent,
    ConfirmDialogComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly seoService = inject(SeoService);
  protected title = 'E-commerce';

  ngOnInit(): void {
    this.seoService.init();
  }
}
