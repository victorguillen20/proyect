import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportComponent } from './report.component';
import { MovementRepository } from '../../../domain/ports/movement.repository';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Movement } from '../../../domain/models/movement.model';
import { ReportResponse } from '../../../domain/models/report.model';
import { Page } from '../../../domain/models/page.model';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let mockRepo: jasmine.SpyObj<MovementRepository>;

  const mockMovements: Movement[] = [
       { 
         date: new Date().toISOString(), 
         value: 50, 
         balance: 100, 
         movementType: 'Depósito',
         account: { client: { name: 'Test' } } 
       } as unknown as Movement
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
    mockRepo = jasmine.createSpyObj('MovementRepository', ['getAll', 'getReport']);
    
    mockRepo.getAll.and.returnValue(of(mockPage));

    mockRepo.getReport.and.returnValue(of({ pdfBase64: 'fakeBase64' } as ReportResponse));

    await TestBed.configureTestingModule({
      imports: [ReportComponent, FormsModule],
      providers: [
        { provide: MovementRepository, useValue: mockRepo }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load table data on init', () => {
    expect(mockRepo.getAll).toHaveBeenCalledWith('', 0, 10);
    expect(component.reportData.length).toBe(1);
    expect(component.reportData[0]['Movimiento']).toBe(50);
  });

  it('should fail validation if dates are missing for report generation', () => {
    component.startDate = '';
    component.endDate = '';
    
    component.generateReport();

    expect(mockRepo.getReport).not.toHaveBeenCalled();
    
    expect(component.notificationType).toBe('info');
  });

  it('should generate report and download PDF if dates are present', () => {
    component.startDate = '2023-01-01';
    component.endDate = '2023-01-31';

   
    component.downloadPdf = jasmine.createSpy('downloadPdf');

    component.generateReport();

    expect(mockRepo.getReport).toHaveBeenCalledWith('2023-01-01', '2023-01-31', '');
    
    expect(component.downloadPdf).toHaveBeenCalledWith('fakeBase64');
  });

  it('should show error if report generation fails', () => {
    component.startDate = '2023-01-01';
    component.endDate = '2023-01-31';
    mockRepo.getReport.and.returnValue(throwError(() => new Error('Error')));

    component.generateReport();

    expect(component.notificationType).toBe('error');
  });
});
