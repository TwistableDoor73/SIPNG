import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age?: number;
  phone?: string;
}

export interface LoginResponse {
  statusCode: number;
  intOpCode: string;
  data: {
    token: string;
    user: {
      id: string;
      uuid: string;
      name: string;
      email: string;
      role: string;
      avatarUrl?: string;
      permissions: string[];
      permissionsByGroup: Record<string, string[]>;
      groups: Array<{ id: string; uuid: string; name: string }>;
      age?: number;
      phone?: string;
    };
  };
}

export interface User {
  id: string;
  uuid: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  avatarUrl?: string;
  permissions: string[];
  permissionsByGroup: Record<string, string[]>;
  groups: Array<{ id: string; uuid: string; name: string }>;
  age?: number;
  phone?: string;
}

export interface Ticket {
  id: string;
  uuid: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creator: User;
  assignedTo?: User;
  groupId: string;
  group?: { id: string; name: string };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments?: TicketComment[];
  history?: TicketHistory[];
}

export interface TicketComment {
  id: string;
  author: User;
  text: string;
  createdAt: Date;
}

export interface TicketHistory {
  id: string;
  author: User;
  action: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private apiUrl = environment.apiUrl;
  private authTokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );

  constructor(private http: HttpClient) {}

  // ==================== Authentication ====================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.authTokenSubject.next(response.data.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap((response) => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.authTokenSubject.next(response.data.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authTokenSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ==================== Tickets ====================

  getTickets(groupId?: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Ticket[];
  }> {
    let url = `${this.apiUrl}/tickets`;
    if (groupId) {
      url += `?groupId=${groupId}`;
    }
    return this.http.get<any>(url).pipe(
      map((response) => ({
        ...response,
        data: response.data.map(this.mapTicket),
      })),
      catchError(this.handleError)
    );
  }

  getTicket(id: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Ticket;
  }> {
    return this.http.get<any>(`${this.apiUrl}/tickets/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapTicket(response.data),
      })),
      catchError(this.handleError)
    );
  }

  createTicket(ticket: Partial<Ticket>): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Ticket;
  }> {
    return this.http.post<any>(`${this.apiUrl}/tickets`, ticket).pipe(
      map((response) => ({
        ...response,
        data: this.mapTicket(response.data),
      })),
      catchError(this.handleError)
    );
  }

  updateTicket(
    id: string,
    updates: Partial<Ticket>
  ): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Ticket;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/tickets/${id}`, updates).pipe(
      map((response) => ({
        ...response,
        data: this.mapTicket(response.data),
      })),
      catchError(this.handleError)
    );
  }

  deleteTicket(id: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: null;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/tickets/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addComment(ticketId: string, text: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: TicketComment;
  }> {
    return this.http.post<any>(
      `${this.apiUrl}/tickets/${ticketId}/comments`,
      { text }
    ).pipe(catchError(this.handleError));
  }

  // ==================== Groups ====================

  getGroups(): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Group[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/groups`).pipe(
      catchError(this.handleError)
    );
  }

  getGroup(id: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Group;
  }> {
    return this.http.get<any>(`${this.apiUrl}/groups/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createGroup(group: Partial<Group>): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Group;
  }> {
    return this.http.post<any>(`${this.apiUrl}/groups`, group).pipe(
      catchError(this.handleError)
    );
  }

  updateGroup(id: string, updates: Partial<Group>): Observable<{
    statusCode: number;
    intOpCode: string;
    data: Group;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/groups/${id}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  deleteGroup(id: string): Observable<{
    statusCode: number;
    intOpCode: string;
    data: null;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/groups/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Users ====================

  getUsers(): Observable<{
    statusCode: number;
    intOpCode: string;
    data: any[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== Helper Methods ====================

  private mapTicket(ticket: any): Ticket {
    return {
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      dueDate: ticket.dueDate ? new Date(ticket.dueDate) : undefined,
      comments: ticket.comments?.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      })) || [],
      history: ticket.history?.map((h: any) => ({
        ...h,
        createdAt: new Date(h.createdAt),
      })) || [],
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.data?.message) {
        errorMessage = error.error.data.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
