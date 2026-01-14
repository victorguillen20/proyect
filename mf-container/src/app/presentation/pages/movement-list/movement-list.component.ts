import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { AccountRepository } from '../../../domain/ports/account.repository';
import { Movement } from '../../../domain/models/movement.model';
import { Page } from '../../../domain/models/page.model';
import { MovementRepository } from '../../../domain/ports/movement.repository';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movement-list.component.html',
  styles: ['']
})
export class MovementListComponent implements OnInit {
  movements: Movement[] = [];
  private searchTerms = new Subject<string>();
  private accountIdTerms = new Subject<number>();
  searchTerm: string = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showModal = false;
  showDeleteModal = false;
  modalMode: 'create' | 'update' = 'create';
  isAccountTypeLocked = false;
  
  currentMovement: Movement = this.getEmptyMovement();
  
  activeDropdownId: number | null = null;
  idToDelete: number | null = null;

  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification: boolean = false;

  constructor(
    private movementRepository: MovementRepository,
    private accountRepository: AccountRepository
  ) {

    this.accountIdTerms.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(id => {
         if (!id) return of(null);
         return this.accountRepository.getById(id).pipe(
            catchError(() => of(null))
         );
      })
    ).subscribe(account => {
       if (account) {
          let type = account.accountType;
          if (type === 'Ahorros') type = 'Ahorro';
          
          this.currentMovement.movementType = type;
          this.isAccountTypeLocked = true;
       } else {
          this.currentMovement.movementType = '';
          this.isAccountTypeLocked = true;
       }
    });
  }

  ngOnInit(): void {
    this.loadMovements();

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadMovements();
    });
  }

  loadMovements(): void {
    this.movementRepository.getAll(this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData: Page<Movement>) => {
          this.movements = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
        },
        error: (err) => {
          console.error("Error fetching movements", err);
          this.movements = [];
        }
      });
  }

  changePage(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages) {
          this.currentPage = newPage;
          this.loadMovements();
      }
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSearchChange(term: string): void {
    this.searchTerms.next(term);
  }

  onAccountIdChange(id: number): void {
    this.accountIdTerms.next(id);
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.currentMovement = this.getEmptyMovement();
    this.showModal = true;
    this.isAccountTypeLocked = true;
    this.activeDropdownId = null;
  }

  openUpdateModal(movement: Movement) {
    this.modalMode = 'update';
    this.currentMovement = { ...movement, accountId: movement.account?.accountNumber };
    this.showModal = true;
    this.activeDropdownId = null;
  }

  closeModal() {
    this.showModal = false;
    this.currentMovement = this.getEmptyMovement();
  }

  saveMovement() {
    if (!this.currentMovement.value || !this.currentMovement.accountId) {
      alert("Valor y Cuenta son requeridos");
      return;
    }

    const payload = { ...this.currentMovement };
    
    payload.account = { accountNumber: this.currentMovement.accountId };
    
    if (this.modalMode === 'create') {
      this.movementRepository.create(payload).subscribe({
        next: () => {
          this.closeModal();
          this.refreshList();
          this.showToast('success', 'Su registro se guardó correctamente');
        },
        error: (err) => {
           console.error('Error creating movement', err);
           const errorMessage = err.error?.message || 'Ocurrió un error al guardar el registro';
           this.showToast('error', errorMessage);
        }
      });
    } else {
      if (this.currentMovement.movementId) {
        this.movementRepository.update(this.currentMovement.movementId, payload).subscribe({
          next: () => {
             this.closeModal();
             this.refreshList();
             this.showToast('success', 'Su registro se guardó correctamente');
          },
          error: (err) => {
            console.error('Error updating movement', err);
            const errorMessage = err.error?.message || 'Ocurrió un error al guardar el registro';
            this.showToast('error', errorMessage);
          }
        });
      }
    }
  }

  showToast(type: 'success' | 'error', message: string) {
    this.notificationType = type;
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }


  promptDelete(id: number) {
    this.idToDelete = id;
    this.showDeleteModal = true;
    this.activeDropdownId = null;
  }

  confirmDelete() {
    if (this.idToDelete) {
      this.movementRepository.delete(this.idToDelete).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.idToDelete = null;
          this.refreshList();
          this.showToast('success', 'Registro eliminado correctamente');
        },
        error: (err) => {
          console.error('Error deleting movement', err);
          this.showToast('error', 'Ocurrió un error al eliminar el registro');
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.idToDelete = null;
  }

  toggleDropdown(id: number | undefined) {
    if (!id) return;
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = id;
    }
  }

  refreshList() {
    this.loadMovements();
  }

  private getEmptyMovement(): Movement {
    return {
      movementType: 'Deposito',
      value: 0,
      movementDetail: '', // Default empty string
      accountId: undefined
    };
  }
}

