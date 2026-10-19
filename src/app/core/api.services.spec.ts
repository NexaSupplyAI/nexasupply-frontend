import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AiApi, InventoryApi, OrdersApi, ReportingApi, SuppliersApi } from './api.services';

describe('microservice API clients', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('targets inventory-service', () => {
    TestBed.inject(InventoryApi).products().subscribe();
    http.expectOne('http://localhost:8081/api/v1/productos').flush([]);
  });

  it('targets order-service', () => {
    TestBed.inject(OrdersApi).orders().subscribe();
    http.expectOne('http://localhost:8082/api/v1/ordenes').flush([]);
  });

  it('targets supplier-service', () => {
    TestBed.inject(SuppliersApi).suppliers().subscribe();
    http.expectOne('http://localhost:8083/api/v1/proveedores').flush([]);
  });

  it('targets reporting-service', () => {
    TestBed.inject(ReportingApi).dashboard().subscribe();
    http.expectOne('http://localhost:8084/api/v1/reportes/dashboard').flush({});
  });

  it('targets ai-orchestrator', () => {
    TestBed.inject(AiApi).conversations().subscribe();
    http.expectOne('http://localhost:8085/api/v1/conversaciones').flush([]);
  });
});
