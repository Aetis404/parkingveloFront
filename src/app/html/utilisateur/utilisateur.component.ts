import { Component, OnInit, inject, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { UtilisateurDTO } from '../../models/utilisateur.model';
import { UtilisateurService } from '../../services/utilisateur.service';

export interface UtilisateurForm {
  nom: string;
  prenom: string;
  mail: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatPaginatorModule],
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nom', 'prenom', 'mail', 'username', 'action'];
  dataSource = new MatTableDataSource<UtilisateurDTO>([]);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  creerUtilisateur(): void {
    const dialogRef = this.dialog.open(DialogCreerUtilisateur, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'utilisateur-dialog-no-padding',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newUtilisateur: any = {
          nom: result.nom,
          prenom: result.prenom,
          mail: result.mail,
          username: result.username,
          password: result.password
        };
        
        this.utilisateurService.createUtilisateur(newUtilisateur).subscribe({
          next: (data) => {
            console.log('Utilisateur créé:', data);
            this.loadUtilisateurs();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
          }
        });
      }
    });
  }

  modifier(utilisateur: UtilisateurDTO): void {
    const dialogRef = this.dialog.open(DialogModifierUtilisateur, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'utilisateur-dialog-no-padding',
      disableClose: false,
      autoFocus: true,
      data: utilisateur
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.utilisateurService.updateUtilisateur(utilisateur.id, result).subscribe({
          next: (data) => {
            console.log('Utilisateur modifié:', data);
            this.loadUtilisateurs();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
          }
        });
      }
    });
  }

  supprimer(utilisateur: UtilisateurDTO): void {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} ?`)) {
      this.utilisateurService.deleteUtilisateur(utilisateur.id).subscribe({
        next: () => {
          console.log('Utilisateur supprimé:', utilisateur);
          this.loadUtilisateurs();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}

@Component({
  selector: 'dialog-creer-utilisateur',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <div class="ultra-modern-dialog">
      <div class="gradient-header">
        <div class="icon-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1>Créer un utilisateur</h1>
      </div>

      <div class="form-body">
        <div class="row-inputs">
          <div class="field">
            <label>Nom</label>
            <input [(ngModel)]="utilisateur.nom" placeholder="Dupont">
          </div>
          <div class="field">
            <label>Prénom</label>
            <input [(ngModel)]="utilisateur.prenom" placeholder="Jean">
          </div>
        </div>

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="utilisateur.mail" placeholder="jean.dupont@exemple.fr">
        </div>

        <div class="field">
          <label>Nom d'utilisateur</label>
          <input [(ngModel)]="utilisateur.username" placeholder="jdupont">
        </div>

        <div class="field">
          <label>Mot de passe</label>
          <input type="password" [(ngModel)]="utilisateur.password" placeholder="••••••••">
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn-annuler" (click)="dialogRef.close()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Annuler
        </button>
        <button class="btn-action" (click)="creer()" [disabled]="!isValid()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Créer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ultra-modern-dialog {
      width: 520px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .gradient-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 40px;
      text-align: center;
    }

    .icon-box {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .gradient-header h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .form-body {
      padding: 40px;
      background: #ffffff;
    }

    .row-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .field {
      margin-bottom: 24px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }

    .field input {
      width: 100%;
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      color: #111827;
      background: #f9fafb;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .field input:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }

    .field input:focus {
      outline: none;
      border-color: #667eea;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .field input::placeholder {
      color: #9ca3af;
    }

    .actions-bar {
      padding: 24px 40px;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .btn-annuler {
      flex: 1;
      padding: 14px 24px;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      color: #6b7280;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-annuler:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      color: #374151;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .btn-action {
      flex: 1;
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-action:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }

    .btn-action[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-annuler svg,
    .btn-action svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class DialogCreerUtilisateur {
  utilisateur = {
    nom: '',
    prenom: '',
    mail: '',
    username: '',
    password: ''
  };

  constructor(public dialogRef: MatDialogRef<DialogCreerUtilisateur>) {}

  isValid(): boolean {
    return !!(this.utilisateur.nom && this.utilisateur.prenom && 
              this.utilisateur.mail && this.utilisateur.username && 
              this.utilisateur.password);
  }

  creer(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.utilisateur);
    }
  }
}

// Dialog component pour modifier un utilisateur
@Component({
  selector: 'dialog-modifier-utilisateur',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <div class="ultra-modern-dialog">
      <div class="gradient-header">
        <div class="icon-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <h1>Modifier l'utilisateur</h1>
      </div>

      <div class="form-body">
        <div class="row-inputs">
          <div class="field">
            <label>Nom</label>
            <input [(ngModel)]="utilisateur.nom">
          </div>
          <div class="field">
            <label>Prénom</label>
            <input [(ngModel)]="utilisateur.prenom">
          </div>
        </div>

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="utilisateur.mail">
        </div>

        <div class="field">
          <label>Nom d'utilisateur</label>
          <input [(ngModel)]="utilisateur.username">
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn-annuler" (click)="dialogRef.close()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Annuler
        </button>
        <button class="btn-action" (click)="modifier()" [disabled]="!isValid()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Enregistrer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ultra-modern-dialog {
      width: 520px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .gradient-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 40px;
      text-align: center;
    }

    .icon-box {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .gradient-header h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .form-body {
      padding: 40px;
      background: #ffffff;
    }

    .row-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .field {
      margin-bottom: 24px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }

    .field input {
      width: 100%;
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      color: #111827;
      background: #f9fafb;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .field input:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }

    .field input:focus {
      outline: none;
      border-color: #667eea;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .field input::placeholder {
      color: #9ca3af;
    }

    .actions-bar {
      padding: 24px 40px;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .btn-annuler {
      flex: 1;
      padding: 14px 24px;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      color: #6b7280;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-annuler:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      color: #374151;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .btn-action {
      flex: 1;
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-action:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }

    .btn-action[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-annuler svg,
    .btn-action svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class DialogModifierUtilisateur {
  utilisateur: UtilisateurDTO;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UtilisateurDTO,
    public dialogRef: MatDialogRef<DialogModifierUtilisateur>
  ) {
    this.utilisateur = { ...data };
  }

  isValid(): boolean {
    return !!(this.utilisateur.nom && this.utilisateur.prenom && 
              this.utilisateur.mail && this.utilisateur.username);
  }

  modifier(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.utilisateur);
    }
  }
}
