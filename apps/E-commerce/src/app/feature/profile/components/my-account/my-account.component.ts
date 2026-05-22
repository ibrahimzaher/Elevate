import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MyAccount } from "@elevate/my-account";

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [MyAccount],
  providers: [ConfirmationService],
  templateUrl: './my-account.component.html',
})
export class MyAccountComponent  {
onSubmit(): void {
  // Handle form submission if needed, otherwise this can be removed  
}
}
