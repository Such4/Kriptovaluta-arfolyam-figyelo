import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = new FormControl('');
  password = new FormControl('');
  loginError: string = '';
  showLoginForm: boolean = true;

  constructor() {}

  login() {
    this.loginError = '';
    
    if (this.email.value === 'teszt@email.com' && this.password.value === 'teszt') {
      this.showLoginForm = false;
      
      localStorage.setItem('isLoggedIn', 'true');
      
      setTimeout(() => {
        window.location.href = '/home';
      }, 2000);
    } else {
      this.loginError = 'Helytelen email cím vagy jelszó!';
    }
  }
}
