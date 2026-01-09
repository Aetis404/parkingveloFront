import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UtilisateurDTO } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/utilisateur/login';
  private currentUserSubject = new BehaviorSubject<UtilisateurDTO | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<UtilisateurDTO> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.get<UtilisateurDTO>(this.apiUrl, { params }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): UtilisateurDTO | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): UtilisateurDTO | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}
