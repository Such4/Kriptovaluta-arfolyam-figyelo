import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/user';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Auth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  usernameForm: FormGroup;
  user: User | null = null;
  isLoading = false;
  passwordLoading = false;
  usernameLoading = false;
  passwordHidden = true;
  confirmPasswordHidden = true;
  newPasswordHidden = true;
  passwordError: string | null = null;
  usernameError: string | null = null;
  passwordSuccess: string | null = null;
  usernameSuccess: string | null = null;
  currentUsername: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: Auth
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmCurrentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordsMatchValidator });

    this.usernameForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      currentPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getCurrentUser()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.currentUsername = user.username;
            this.usernameForm.patchValue({
              username: user.username
            });
          }
        },
        error: (error) => {
          console.error('Hiba a felhasználó adatainak betöltése közben:', error);
        }
      });
  }

  getUserInitials(): string {
    if (!this.currentUsername) return 'U';
    return this.currentUsername.charAt(0).toUpperCase();
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const currentPassword = formGroup.get('currentPassword')?.value;
    const confirmCurrentPassword = formGroup.get('confirmCurrentPassword')?.value;
    
    return currentPassword === confirmCurrentPassword ? null : { passwordsMismatch: true };
  }

  async changePassword() {
    this.passwordError = null;
    this.passwordSuccess = null;
    
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    const currentUser = this.auth.currentUser;
    
    if (!currentUser || !currentUser.email) {
      this.passwordError = 'Nincs jelenleg felhasználó belépve';
      this.passwordLoading = false;
      return;
    }

    try {
      const currentPassword = this.passwordForm.get('currentPassword')?.value;
      const newPassword = this.passwordForm.get('newPassword')?.value;
      
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      this.passwordSuccess = 'Sikeres jelszó változtatás';
      this.passwordForm.reset();
    } catch (error: any) {
      console.error('Hiba a jelszó változtatás közben:', error);
      this.passwordError = this.getFirebaseErrorMessage(error);
    } finally {
      this.passwordLoading = false;
    }
  }

  changeUsername() {
    this.usernameError = null;
    this.usernameSuccess = null;
    
    if (this.usernameForm.invalid) {
      return;
    }

    this.usernameLoading = true;
    const currentUser = this.auth.currentUser;
    
    if (!currentUser || !currentUser.email) {
      this.usernameError = 'Nincs jelenleg felhasználó belépve';
      this.usernameLoading = false;
      return;
    }

    const newUsername = this.usernameForm.get('username')?.value;
    const currentPassword = this.usernameForm.get('currentPassword')?.value;
    
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    
    reauthenticateWithCredential(currentUser, credential)
      .then(() => {
        this.userService.updateUsername(currentUser.uid, newUsername)
          .subscribe({
            next: () => {
              this.currentUsername = newUsername;
              this.usernameSuccess = 'Sikeres felhasználónév változtatás';
              this.usernameLoading = false;
            },
            error: (error) => {
              console.error('Hiba a felhasználónév változtatás közben:', error);
              this.usernameError = error.message || this.getFirebaseErrorMessage(error);
              this.usernameLoading = false;
            }
          });
      })
      .catch((error) => {
        console.error('Hiba lépett fel az újra hitelesítés közben:', error);
        this.usernameError = this.getFirebaseErrorMessage(error);
        this.usernameLoading = false;
      });
  }

  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/wrong-password':
        return 'A jelenlegi jelszó helytelen';
      case 'auth/requires-recent-login':
        return 'Ehhez a művelethez friss hitelesítés szükséges. Lépj be újra.';
      case 'auth/weak-password':
        return 'A jelszó túl gyenge, minimum 6 karakter legyen!';
      default:
        return error.message || 'Hiba merült fel, próbáld újra később';
    }
  }
}