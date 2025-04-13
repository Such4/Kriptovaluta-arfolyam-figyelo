import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/user';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signUpForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rePassword: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  
  isLoading = false;
  showForm = true;
  signupError = '';

  constructor(private router: Router) {}

  signup(): void {
    if (this.signUpForm.invalid) {
      this.signupError = 'Please correct the form errors before submitting.';
      return;
    }

    const password = this.signUpForm.get('password');
    const rePassword = this.signUpForm.get('rePassword');

    if (password?.value !== rePassword?.value) {
      return;
    }

    this.isLoading = true;
    this.showForm = false;

    const newUser: User = {
      username: this.signUpForm.value.username || '',
      email: this.signUpForm.value.email || '',
      password: this.signUpForm.value.password || '',
      watchlist: [],
    };

    console.log('New user:', newUser);
    console.log('Form value:', this.signUpForm.value);

    setTimeout(() => {
      this.router.navigateByUrl('/home');
    }, 1000);
  }
}
