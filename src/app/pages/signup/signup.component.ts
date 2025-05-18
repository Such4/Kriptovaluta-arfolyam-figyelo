import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../shared/user';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signUpForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rePassword: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required])
  });
  
  isLoading = false;
  showForm = true;
  signupError = '';
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  signup(): void {
    if (this.signUpForm.invalid) {
      this.signupError = 'Minden adatot adj meg helyesen!';
      return;
    }
    
    const password = this.signUpForm.get('password')?.value;
    const rePassword = this.signUpForm.get('rePassword')?.value;
   
    if (password !== rePassword) {
      this.signupError = 'A jelszavak nem egyeznek.';
      return;
    }
    
    this.isLoading = true;
    this.showForm = false;
    
    const userData: Partial<User> = {
      username: this.signUpForm.value.username || '',
      email: this.signUpForm.value.email || '',
      watchlist: [],
    };
    
    const email = this.signUpForm.value.email || '';
    const pw = this.signUpForm.value.password || '';
    
    this.authService.signUp(email, pw, userData)
      .then(userCredential => {
        console.log('Regisztráció sikeres:', userCredential.user);
        this.authService.updateLoginStatus(true);
        this.router.navigateByUrl('/home');
      })
  }
}