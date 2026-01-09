import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeloService } from '../../services/velo.service';
import { VeloDTO } from '../../models/velo.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent , MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 

@Component({
  selector: 'app-velo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './velo-list.component.html',
  styleUrls: ['./velo-list.component.css']
})
export class VeloListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nom', 'quantite', 'description', 'latitude', 'longitude', 'actions'];
  
  dataSource = new MatTableDataSource<VeloDTO>([]);
  
  paginatedData: VeloDTO[] = []; 
  totalItems = 0;
  currentPage = 0;
  pageSize = 5;

  filterValue: string = '';

  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = false;
  error: string | null = null;

  constructor(
    private veloService: VeloService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVelos();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      
      this.paginator.page.subscribe((pageEvent: PageEvent) => {
        console.log('Changement de page: ', pageEvent);
        this.onPageChange(pageEvent);
      });
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => {
        this.updatePaginatedData();
      });
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    console.log('Page size changé à:', pageEvent.pageSize);
    console.log('Page index changé à:', pageEvent.pageIndex);
    
    this.pageSize = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex;
    this.updatePaginatedData();
  }

  loadVelos(): void {
    this.loading = true;
    this.error = null;
    
    this.veloService.getAllVelos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.totalItems = data.length;
        this.updatePaginatedData();
        
        if (this.paginator) {
          this.paginator.pageSize = 5;
          this.paginator.length = data.length;
          this.paginator.pageIndex = 0;
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des vélos';
        this.loading = false;
        console.error(err);
        this.showSnackBar('Erreur lors du chargement des données', 'error');
      }
    });
  }

  updatePaginatedData(): void {
    if (!this.dataSource.data.length) {
      this.paginatedData = [];
      return;
    }
    
    let filteredData = this.dataSource.data;

    if (this.filterValue) {
      filteredData = this.dataSource.data.filter(velo => {
        const searchableContent = `
          ${velo.nom || ''}
          ${velo.description || ''}
          ${velo.id || ''}
          ${velo.quantite || ''}
          ${velo.coordonnees?.latitude || ''}
          ${velo.coordonnees?.longitude || ''}
        `.toLowerCase();
        
        return searchableContent.includes(this.filterValue);
      });
    }

    this.totalItems = filteredData.length;

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.paginatedData = filteredData.slice(startIndex, endIndex);
    
    console.log(`Affichage ${startIndex} à ${endIndex} sur ${this.dataSource.data.length} total`);
  }

  ajouterVelo(): void {
    const dialogRef = this.dialog.open(DialogParkingVeloComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'velo-dialog-no-padding',
      disableClose: false,
      autoFocus: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.veloService.createVelo(result).subscribe({
          next: (newVelo) => {
            const updatedData = [...this.dataSource.data, newVelo];
            this.dataSource.data = updatedData;
            this.totalItems = updatedData.length;
            this.updatePaginatedData();
            
            if (this.paginator) {
              this.paginator.length = updatedData.length;
            }
            
            this.showSnackBar('Parking ajouté avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            this.showSnackBar('Erreur lors de l\'ajout', 'error');
          }
        });
      }
    });
  }

  editerVelo(velo: VeloDTO): void {
    const dialogRef = this.dialog.open(DialogParkingVeloComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'velo-dialog-no-padding',
      disableClose: false,
      autoFocus: true,
      data: { mode: 'edit', velo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && velo.id) {
        this.veloService.updateVelo(velo.id, result).subscribe({
          next: (updatedVelo) => {
            const updatedData = this.dataSource.data.map(v =>
              v.id === velo.id ? updatedVelo : v
            );
            this.dataSource.data = updatedData;
            this.updatePaginatedData();
            
            this.showSnackBar('Parking modifié avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            this.showSnackBar('Erreur lors de la modification', 'error');
          }
        });
      }
    });
  }
  
  deleteVelo(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce parking vélo ?')) {
      this.veloService.deleteVelo(id).subscribe({
        next: () => {
          const updatedData = this.dataSource.data.filter(v => v.id !== id);
          this.dataSource.data = updatedData;
          this.totalItems = updatedData.length;
          this.updatePaginatedData();
          
          if (this.paginator) {
            this.paginator.length = updatedData.length;
          }
          
          this.showSnackBar('Parking vélo supprimé avec succès', 'success');
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  applyFilter(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.currentPage = 0;

    console.log('Application du filtre:', this.filterValue);

    this.updatePaginatedData();
  
    if (this.paginator) {
      this.paginator.firstPage();
      this.paginator.length = this.totalItems;
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  formatCoordinate(coord: number | undefined): string {
    return coord ? coord.toFixed(6) : 'N/A';
  }
}

@Component({
  selector: 'dialog-parking-velo',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
    <div class="ultra-modern-dialog">
      <div class="gradient-header">
        <div class="icon-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="2"/>
            <path d="M12 2v7.5m0 5V22m5.2-16.8l-5.3 5.3m-3.7 3.7l-5.3 5.3m16.1 0l-5.3-5.3m-3.7-3.7l-5.3-5.3"/>
          </svg>
        </div>
        <h1>{{ data.mode === 'edit' ? 'Modifier le parking vélo' : 'Ajouter un parking vélo' }}</h1>
      </div>

      <div class="form-body">
        <div class="field">
          <label>Nom du parking</label>
          <input [(ngModel)]="velo.nom" placeholder="Ex: Parking Centre-ville">
        </div>

        <div class="field">
          <label>Description</label>
          <textarea [(ngModel)]="velo.description" placeholder="Description du parking..." rows="3"></textarea>
        </div>

        <div class="field">
          <label>Nombre de places</label>
          <input type="number" min="0" [(ngModel)]="velo.quantite" placeholder="Ex: 25">
        </div>

        <div class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Coordonnées GPS
        </div>

        <div class="row-inputs">
          <div class="field">
            <label>Latitude</label>
            <input type="number" [(ngModel)]="velo.coordonnees.latitude" placeholder="Ex: 48.8566">
          </div>
          <div class="field">
            <label>Longitude</label>
            <input type="number" [(ngModel)]="velo.coordonnees.longitude" placeholder="Ex: 2.3522">
          </div>
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
        <button class="btn-action" (click)="enregistrer()" [disabled]="!isValid()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ data.mode === 'edit' ? 'Enregistrer' : 'Créer' }}
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

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #667eea;
      margin: 24px 0 16px 0;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .row-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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

    .field input,
    .field textarea {
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

    .field textarea {
      resize: vertical;
      min-height: 80px;
    }

    .field input:hover,
    .field textarea:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }

    .field input:focus,
    .field textarea:focus {
      outline: none;
      border-color: #667eea;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .field input::placeholder,
    .field textarea::placeholder {
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
export class DialogParkingVeloComponent {

  velo: any = {
    nom: '',
    description: '',
    quantite: 0,
    coordonnees: {
      latitude: null,
      longitude: null
    }
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogParkingVeloComponent>
  ) {
    if (data.mode === 'edit' && data.velo) {
      this.velo = JSON.parse(JSON.stringify(data.velo));
    }
  }

  isValid(): boolean {
    return !!(this.velo.nom && this.velo.quantite !== null && this.velo.quantite >= 0);
  }

  enregistrer(): void {
    if (this.isValid()) {
      // Convertir les coordonnées en string si elles existent
      const veloToSend = {
        ...this.velo,
        coordonnees: {
          latitude: this.velo.coordonnees.latitude ? String(this.velo.coordonnees.latitude) : null,
          longitude: this.velo.coordonnees.longitude ? String(this.velo.coordonnees.longitude) : null
        }
      };
      this.dialogRef.close(veloToSend);
    }
  }
}