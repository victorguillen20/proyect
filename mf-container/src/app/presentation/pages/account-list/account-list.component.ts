import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { AccountRepository } from '../../../domain/ports/account.repository';
import { Account } from '../../../domain/models/account.model';
import { Page } from '../../../domain/models/page.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-list.component.html',
  styles: [''] // using global styles
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  private searchTerms = new Subject<string>();
  searchTerm: string = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showModal = false;
  showDeleteModal = false;
  modalMode: 'create' | 'update' = 'create';
  
  currentAccount: Account = this.getEmptyAccount();
  
  activeDropdownId: number | null = null;
  idToDelete: number | null = null;

  // Notification State
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification: boolean = false;

  constructor(private accountRepository: AccountRepository) {
  }

  ngOnInit(): void {
    this.loadAccounts();

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged() 
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadAccounts();
    });
  }

  loadAccounts(): void {
    this.accountRepository.getAll(this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData: Page<Account>) => {
          this.accounts = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
        },
        error: (err) => {
           console.error('Error fetching accounts', err);
           this.accounts = [];
        }
      });
  }

  changePage(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages) {
          this.currentPage = newPage;
          this.loadAccounts();
      }
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSearchChange(term: string): void {
    this.searchTerms.next(term);
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.currentAccount = this.getEmptyAccount();
    this.showModal = true;
    this.activeDropdownId = null;
  }

  openUpdateModal(account: Account) {
    this.modalMode = 'update';
    this.currentAccount = { 
      ...account, 
      clientId: account.client?.clientId,
      clientIdentification: account.client?.identification 
    }; 
    this.showModal = true;
    this.activeDropdownId = null;
  }


  closeModal() {
    this.showModal = false;
    this.currentAccount = this.getEmptyAccount();
  }

  saveAccount() {
    const payload = { ...this.currentAccount };
    
    if (this.currentAccount.clientIdentification) {
       payload.client = { identification: this.currentAccount.clientIdentification };
    } else if (this.currentAccount.clientId) {
       payload.client = { clientId: this.currentAccount.clientId };
    }

    if (this.modalMode === 'create') {
      this.accountRepository.create(payload).subscribe({
        next: () => {
          this.closeModal();
          this.refreshList();
          this.showToast('success', 'Su registro se guardó correctamente');
        },
        error: (err) => {
          console.error('Error creating account', err);
          const msg = err.error?.message || 'Ocurrió un error al guardar el registro';
          this.showToast('error', msg);
        }
      });
    } else {
      if (this.currentAccount.accountNumber) {
        this.accountRepository.update(this.currentAccount.accountNumber, payload).subscribe({
          next: () => {
            this.closeModal();
            this.refreshList();
            this.showToast('success', 'Su registro se guardó correctamente');
          },
          error: (err) => {
             console.error('Error updating account', err);
             const msg = err.error?.message || 'Ocurrió un error al guardar el registro';
             this.showToast('error', msg);
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
      this.accountRepository.delete(this.idToDelete).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.idToDelete = null;
          this.refreshList();
          this.showToast('success', 'Registro eliminado correctamente');
        },
        error: (err) => {
          console.error('Error deleting account', err);
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
    this.loadAccounts();
  }

  private getEmptyAccount(): Account {
    return {
      accountType: 'Ahorros',
      initialBalance: 0,
      status: true,
      clientId: undefined
    };
  }
}
