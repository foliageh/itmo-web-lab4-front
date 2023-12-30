import {HttpInterceptorFn} from '@angular/common/http'
import {catchError, throwError} from 'rxjs'
import {inject} from '@angular/core'
import {MessageService} from 'primeng/api'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService)

  return next(req).pipe(
    catchError((error, source) => {
      const errorMessages: string[] = error?.error?.errors
      if (errorMessages != null)
        messageService.addAll(errorMessages.map(msg => ({severity: 'error', summary: 'Error', detail: msg})))
      else
        messageService.add({severity: 'error', summary: 'Error', detail: 'Unknown error'})
      return throwError(() => error)
    })
  )
}
