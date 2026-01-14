import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovementListComponent } from './movement-list.component';
import { MovementRepository } from '../../../domain/ports/movement.repository';
import { AccountRepository } from '../../../domain/ports/account.repository';
import { of } from 'rxjs';
import { Movement } from '../../../domain/models/movement.model';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../domain/models/account.model';
import { Page } from '../../../domain/models/page.model';

describe('MovementListComponent', () => {
  let component: MovementListComponent;
  let fixture: ComponentFixture<MovementListComponent>;
  let mockMovementRepo: jasmine.SpyObj<MovementRepository>;
  let mockAccountRepo: jasmine.SpyObj<AccountRepository>;

  const mockMovements: Movement[] = [
    { movementId: 1, value: 100, balance: 200, movementType: 'Ahorro', account: { accountNumber: 123 } as Account }
  ];

  const mockPage: Page<Movement> = {
    content: mockMovements,
    totalElements: mockMovements.length,
    totalPages: 1,
    size: 10,
    number: 0,
    numberOfElements: mockMovements.length,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockMovementRepo = jasmine.createSpyObj('MovementRepository', ['getAll', 'create', 'update', 'delete']);
    mockAccountRepo = jasmine.createSpyObj('AccountRepository', ['getById']);

    mockMovementRepo.getAll.and.returnValue(of(mockPage));
    mockMovementRepo.create.and.returnValue(of({} as Movement));
    mockMovementRepo.update.and.returnValue(of({} as Movement));
    mockMovementRepo.delete.and.returnValue(of(undefined));
    
    mockAccountRepo.getById.and.returnValue(of({ accountNumber: 123, accountType: 'Ahorros' } as Account));

    await TestBed.configureTestingModule({
      imports: [MovementListComponent, FormsModule],
      providers: [
        { provide: MovementRepository, useValue: mockMovementRepo },
        { provide: AccountRepository, useValue: mockAccountRepo }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovementListComponent);
    component = fixture.componentInstance;
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search movements', fakeAsync(() => {
    fixture.detectChanges(); // Init
    tick(1000);
    mockMovementRepo.getAll.calls.reset();
    
    component.onSearchChange('100');
    tick(1000);
    expect(mockMovementRepo.getAll).toHaveBeenCalledWith('100', 0, 10);
  }));

  it('should auto-fill account type when account ID changes', fakeAsync(() => {
    component.onAccountIdChange(123);
    tick(500); 
    
    expect(mockAccountRepo.getById).toHaveBeenCalledWith(123);
    expect(component.currentMovement.movementType).toBe('Ahorro'); 
    expect(component.isAccountTypeLocked).toBe(true);
  }));

  it('should validate inputs before saving', () => {
    spyOn(window, 'alert');
    component.currentMovement = { value: 0, accountId: null } as any; 
    
    component.saveMovement();

    expect(mockMovementRepo.create).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Valor y Cuenta son requeridos');
  });

  it('should save movement if valid', () => {
    component.openCreateModal();
    component.currentMovement = { value: 100, accountId: 123, movementType: 'Ahorro' } as any;
    
    component.saveMovement();

    expect(mockMovementRepo.create).toHaveBeenCalled();
  });
});
