import {inject, Injectable} from '@angular/core'
import {HttpClient} from "@angular/common/http"
import {Shot} from '../domain/shot'
import {API_URL} from '../constants'

@Injectable({
  providedIn: 'root'
})
export class ShotService {
  private readonly baseUrl = `${API_URL}/my-shots`
  private http = inject(HttpClient)

  retrieveShots() {
    return this.http.get<Shot[]>(this.baseUrl)
  }

  createShot(x: number | string, y: number | string, r: number | string) {
    return this.http.post<Shot>(this.baseUrl, {x, y, r})
  }
}
