import {Component, inject} from '@angular/core'
import {UserService} from '../../services/user.service'
import {ButtonModule} from 'primeng/button'
import {InputTextModule} from 'primeng/inputtext'
import {RouterLink} from '@angular/router'
import {RippleModule} from 'primeng/ripple'
import {FormsModule, NgForm} from '@angular/forms'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    RouterLink,
    RippleModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private userService = inject(UserService)

  onSubmit(form: NgForm) {
    const {username, password} = form.value
    this.userService.login(username, password)
  }
}
