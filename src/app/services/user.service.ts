import {inject, Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {API_URL} from '../constants'
import {Router} from '@angular/router'

interface Token {
  token: string
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${API_URL}/auth`
  private http = inject(HttpClient)
  private router = inject(Router)

  get username(): string | null {
    return localStorage.getItem('username')
  }

  set username(username: string | null | undefined) {
    if (username == null) localStorage.removeItem('username')
    else localStorage.setItem('username', username)
  }

  get isLoggedIn(): boolean {
    return this.authToken != null
  }

  get authToken(): string | null {
    return localStorage.getItem('token')  // TODO: httpOnly cookie
  }

  set authToken(token: string | null | undefined) {
    if (token == null) localStorage.removeItem('token')
    else localStorage.setItem('token', token)
  }

  private auth(username: string, token: string) {
    this.authToken = token
    this.username = username
    this.router.navigate(['main'])
  }

  login(username: string, password: string) {
    return this.http
      .post<Token>(`${this.baseUrl}/login`, {username, password})
      .subscribe((data) => this.auth(username, data.token))
  }

  register(username: string, password: string) {
    return this.http
      .post<Token>(`${this.baseUrl}/register`, {username, password})
      .subscribe((data) => this.auth(username, data.token))
  }

  logout() {
    this.authToken = null
    this.username = undefined
    this.router.navigate(['login'])
  }
}
