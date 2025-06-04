import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

export interface AirQualityData {
  date: string;
  averages: { [key: string]: number };
  minimums: { [key: string]: number };
  maximums: { [key: string]: number };
}

export interface ApiResponse {
  data: AirQualityData[];
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AirQualityService {
  private readonly baseUrl = 'http://localhost:8080/api/air-quality';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Publiczne observables dla komponentów
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Pobiera najnowsze dzienne statystyki jakości powietrza
   */
  getDailyRecentStats(): Observable<AirQualityData[]> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<AirQualityData[]>(`${this.baseUrl}/stats/daily/recent`, {
      headers: {
        'accept': '*/*'
      }
    }).pipe(
      retry(2), // Powtórz żądanie 2 razy w przypadku błędu
      tap(() => this.setLoading(false)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Pobiera statystyki dla konkretnego zakresu dat
   */
  getStatsByDateRange(startDate: string, endDate: string): Observable<AirQualityData[]> {
    this.setLoading(true);
    this.clearError();

    const params = {
      startDate: startDate,
      endDate: endDate
    };

    return this.http.get<AirQualityData[]>(`${this.baseUrl}/stats/daily/range`, {
      params,
      headers: {
        'accept': '*/*'
      }
    }).pipe(
      retry(2),
      tap(() => this.setLoading(false)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Pobiera statystyki dla konkretnej daty
   */
  getStatsByDate(date: string): Observable<AirQualityData> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<AirQualityData>(`${this.baseUrl}/stats/daily/${date}`, {
      headers: {
        'accept': '*/*'
      }
    }).pipe(
      retry(2),
      tap(() => this.setLoading(false)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Sprawdza czy API jest dostępne
   */
  checkApiHealth(): Observable<{status: string, timestamp: string}> {
    return this.http.get<{status: string, timestamp: string}>(`${this.baseUrl}/health`, {
      headers: {
        'accept': '*/*'
      }
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obsługa błędów HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.setLoading(false);

    let errorMessage = 'Wystąpił nieoczekiwany błąd';

    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = `Błąd klienta: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      switch (error.status) {
        case 0:
          errorMessage = 'Brak połączenia z serwerem. Sprawdź czy API jest uruchomione.';
          break;
        case 400:
          errorMessage = 'Nieprawidłowe żądanie. Sprawdź parametry.';
          break;
        case 401:
          errorMessage = 'Brak autoryzacji. Sprawdź dane logowania.';
          break;
        case 403:
          errorMessage = 'Brak uprawnień do tego zasobu.';
          break;
        case 404:
          errorMessage = 'Nie znaleziono żądanych danych.';
          break;
        case 500:
          errorMessage = 'Błąd wewnętrzny serwera.';
          break;
        case 503:
          errorMessage = 'Serwis niedostępny. Spróbuj ponownie później.';
          break;
        default:
          errorMessage = `Błąd serwera: ${error.status} - ${error.statusText}`;
      }

      // Loguj szczegóły błędu w konsoli dla developera
      console.error('API Error Details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      });
    }

    this.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Ustawia stan ładowania
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Ustawia błąd
   */
  private setError(error: string): void {
    this.errorSubject.next(error);
  }

  /**
   * Czyści błąd
   */
  private clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Czyści stan (loading i error)
   */
  public clearState(): void {
    this.setLoading(false);
    this.clearError();
  }

  /**
   * Pomocnicza metoda do formatowania dat dla API
   */
  public formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  /**
   * Walidacja danych otrzymanych z API
   */
  public validateAirQualityData(data: any): boolean {
    if (!Array.isArray(data)) {
      console.warn('Dane nie są tablicą:', data);
      return false;
    }

    return data.every(item => {
      const hasRequiredFields = item.date && item.averages && item.minimums && item.maximums;
      if (!hasRequiredFields) {
        console.warn('Brakuje wymaganych pól w danych:', item);
        return false;
      }

      const hasValidDate = this.isValidDate(item.date);
      if (!hasValidDate) {
        console.warn('Nieprawidłowa data:', item.date);
        return false;
      }

      return true;
    });
  }

  /**
   * Sprawdza czy string jest prawidłową datą
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
