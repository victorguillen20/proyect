import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AccountListComponent } from './account-list.component';
import { AccountRepository } from '../../../domain/ports/account.repository';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../domain/models/account.model';
import { Page } from '../../../domain/models/page.model';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let mockAccountRepository: jasmine.SpyObj<AccountRepository>;

  const mockAccounts: Account[] = [
    { accountNumber: 1, accountType: 'Ahorro', initialBalance: 100, status: true, client: { name: 'Pepe' } }
  ];

  const mockPage: Page<Account> = {
    content: mockAccounts,
    totalElements: mockAccounts.length,
    totalPages: 1,
    size: 10,
    number: 0,
    numberOfElements: mockAccounts.length,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockAccountRepository = jasmine.createSpyObj('AccountRepository', ['getAll', 'create', 'update', 'delete']);
    mockAccountRepository.getAll.and.returnValue(of(mockPage));
    mockAccountRepository.create.and.returnValue(of({} as Account));
    mockAccountRepository.update.and.returnValue(of({} as Account));
    mockAccountRepository.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AccountListComponent, FormsModule], 
      providers: [
        { provide: AccountRepository, useValue: mockAccountRepository }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
  });

  it('should create and load accounts on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(1000); 
    expect(component).toBeTruthy();
    expect(mockAccountRepository.getAll).toHaveBeenCalledWith('', 0, 10);
  }));

  it('should search accounts when searchTerm changes', fakeAsync(() => {
    fixture.detectChanges(); 
    tick(1000); 
    mockAccountRepository.getAll.calls.reset();

    const searchTerm = 'Pepe';
    component.onSearchChange(searchTerm);
    tick(1000); 
    expect(mockAccountRepository.getAll).toHaveBeenCalledWith(searchTerm, 0, 10);
  }));

  it('should open create modal', () => {
    component.openCreateModal();
    expect(component.showModal).toBe(true);
    expect(component.modalMode).toBe('create');
  });

  it('should open update modal with account data', () => {
    const account = mockAccounts[0];
    component.openUpdateModal(account);
    expect(component.showModal).toBe(true);
    expect(component.modalMode).toBe('update');
  });

  it('should call create on repository when saving in create mode', () => {
    component.openCreateModal();
    component.currentAccount = { ...mockAccounts[0], accountNumber: 99 };
    
    component.saveAccount();

    expect(mockAccountRepository.create).toHaveBeenCalled();
    expect(component.showModal).toBe(false);
    expect(component.notificationType).toBe('success');
  });

  it('should call update on repository when saving in update mode', () => {
    const account = mockAccounts[0];
    component.openUpdateModal(account);
    
    component.saveAccount();

    expect(mockAccountRepository.update).toHaveBeenCalledWith(account.accountNumber!, jasmine.any(Object));
    expect(component.showModal).toBe(false);
  });
});
