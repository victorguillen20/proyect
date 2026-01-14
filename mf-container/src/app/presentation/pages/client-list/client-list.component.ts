import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError, map } from 'rxjs/operators';
import { ClientRepository } from '../../../domain/ports/client.repository';
import { Client } from '../../../domain/models/client.model';
import { Page } from '../../../domain/models/page.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-list.component.html',
  styles: ['']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
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
  
  currentClient: Client = this.getEmptyClient();
  
  activeDropdownId: number | null = null;
  clientToDeleteId: number | null = null;

  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification: boolean = false;

  constructor(private clientRepository: ClientRepository) {
  }

  ngOnInit(): void {
    // Initial load
    this.loadClients();
    
    // Subscribe to search terms
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm = term;
      this.currentPage = 0; // Reset to first page on search
      this.loadClients();
    });
  }

  loadClients(): void {
    this.clientRepository.getAll(this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData: Page<Client>) => {
          this.clients = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
        },
        error: (err) => {
          console.error('Error fetching clients', err);
          this.clients = [];
        }
      });
  }

  changePage(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages) {
          this.currentPage = newPage;
          this.loadClients();
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
    this.currentClient = this.getEmptyClient();
    this.showModal = true;
    this.activeDropdownId = null;
  }

  openUpdateModal(client: Client) {
    this.modalMode = 'update';
    this.currentClient = { ...client };
    this.showModal = true;
    this.activeDropdownId = null;
  }

  closeModal() {
    this.showModal = false;
    this.currentClient = this.getEmptyClient();
  }

  saveClient() {
    if (this.modalMode === 'create') {
      this.clientRepository.create(this.currentClient).subscribe({
        next: () => {
          this.closeModal();
          this.refreshList();
          this.showToast('success', 'Su registro se guardó correctamente');
        },
        error: (err) => {
          console.error('Error creating client', err);
          const msg = err.error?.message || 'Ocurrió un error al guardar el registro';
          this.showToast('error', msg);
        }
      });
    } else {
      if (this.currentClient.clientId) {
        this.clientRepository.update(this.currentClient.clientId, this.currentClient).subscribe({
          next: () => {
            this.closeModal();
            this.refreshList();
            this.showToast('success', 'Su registro se guardó correctamente');
          },
          error: (err) => {
             console.error('Error updating client', err);
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
    this.clientToDeleteId = id;
    this.showDeleteModal = true;
    this.activeDropdownId = null;
  }

  confirmDelete() {
    if (this.clientToDeleteId) {
      this.clientRepository.delete(this.clientToDeleteId).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.clientToDeleteId = null;
          this.refreshList();
          this.showToast('success', 'Registro eliminado correctamente');
        },
        error: (err) => {
          console.error('Error deleting client', err);
          this.showToast('error', 'Ocurrió un error al eliminar el registro');
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.clientToDeleteId = null;
  }

  toggleDropdown(clientId: number | undefined) {
    if (!clientId) return;
    if (this.activeDropdownId === clientId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = clientId;
    }
  }

  refreshList() {
    this.loadClients();
  }

  private getEmptyClient(): Client {
    return {
      name: '',
      gender: 'Male',
      age: 0,
      identification: '',
      address: '',
      phone: '',
      password: '',
      status: true
    };
  }
}
