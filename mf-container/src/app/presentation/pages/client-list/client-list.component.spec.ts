import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientListComponent } from './client-list.component';
import { ClientRepository } from '../../../domain/ports/client.repository';
import { of, throwError } from 'rxjs';
import { Client } from '../../../domain/models/client.model';
import { Page } from '../../../domain/models/page.model';
import { FormsModule } from '@angular/forms';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let mockClientRepository: jasmine.SpyObj<ClientRepository>;

  const mockClients: Client[] = [
    { 
      clientId: 1, 
      name: 'Juan', 
      gender: 'Masculino',
      age: 25,
      identification: '1234567890',
      address: 'Calle Falsa 123',
      phone: '0987654321',
      status: true 
    }
  ];

  const mockPage: Page<Client> = {
    content: mockClients,
    totalElements: mockClients.length,
    totalPages: 1,
    size: 10,
    number: 0,
    numberOfElements: mockClients.length,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockClientRepository = jasmine.createSpyObj('ClientRepository', ['getAll', 'create', 'update', 'delete']);
    mockClientRepository.getAll.and.returnValue(of(mockPage));
    mockClientRepository.create.and.returnValue(of({} as Client));
    mockClientRepository.update.and.returnValue(of({} as Client));
    mockClientRepository.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ClientListComponent, FormsModule],
      providers: [
        { provide: ClientRepository, useValue: mockClientRepository }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on init', fakeAsync(() => {
    fixture.detectChanges(); 
    tick(1000);
    expect(mockClientRepository.getAll).toHaveBeenCalledWith('', 0, 10);
  }));

  it('should search clients', fakeAsync(() => {
    fixture.detectChanges();
    tick(1000);
    mockClientRepository.getAll.calls.reset();

    component.onSearchChange('Juan');
    tick(1000);
    expect(mockClientRepository.getAll).toHaveBeenCalledWith('Juan', 0, 10);
  }));

  it('should save new client', () => {
    component.openCreateModal();
    component.currentClient = { ...mockClients[0], clientId: undefined };
    
    component.saveClient();

    expect(mockClientRepository.create).toHaveBeenCalled();
    expect(component.showModal).toBe(false);
  });

  it('should update existing client', () => {
    component.openUpdateModal(mockClients[0]);
    
    component.saveClient();

    expect(mockClientRepository.update).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('should handle delete client', () => {
    component.promptDelete(1);
    component.confirmDelete();
    
    expect(mockClientRepository.delete).toHaveBeenCalledWith(1);
  });
});
