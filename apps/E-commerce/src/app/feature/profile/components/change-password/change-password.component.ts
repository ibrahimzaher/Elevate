import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ChangePassword} from '@elevate/change-password';

@Component({
  selector: 'app-change-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChangePassword],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {


}
