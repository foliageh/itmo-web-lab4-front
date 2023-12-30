import {HttpInterceptorFn} from '@angular/common/http'
import {inject} from '@angular/core'
import {UserService} from '../services/user.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  req = req.clone({headers: req.headers.set('Content-Type', 'application/json')})
  const authToken = inject(UserService).authToken
  if (authToken != null)
    req = req.clone({headers: req.headers.set('Authorization', `Bearer ${authToken}`)})
  return next(req)
}
