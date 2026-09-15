import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { KeycloakService } from 'keycloak-angular';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let keycloakServiceSpy: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    keycloakServiceSpy = jasmine.createSpyObj('KeycloakService', ['isLoggedIn', 'getToken', 'login']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: KeycloakService, useValue: keycloakServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve anexar o token Authorization Bearer em chamadas para /api/', (done) => {
    keycloakServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true));
    keycloakServiceSpy.getToken.and.returnValue(Promise.resolve('mock-jwt-token'));

    httpClient.get('/api/documentos').subscribe(response => {
      expect(response).toBeTruthy();
      done();
    });

    setTimeout(() => {
      const req = httpMock.expectOne('/api/documentos');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
      req.flush([]);
    }, 50);
  });
});
