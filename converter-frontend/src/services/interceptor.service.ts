import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, of, throwError } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(public loaderService: LoaderService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.isLoading.next(true);
    return next.handle(req).pipe(
      catchError(x => this.handleErrorResponse(x)),
      finalize(
        () => {
          this.loaderService.isLoading.next(false);
        }
      )
    )
  }

  handleErrorResponse(err: HttpErrorResponse) : Observable<any> {
    if (err.status === 401) {
      alert ("Incorrect password... ")
      return of(err.message)
    }
    return throwError(err);
  }
}
