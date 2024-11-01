import { Injectable } from '@angular/core';
import { Login } from '../interfaces/login';
import { TagContentType } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getToken(): string | null {
    return localStorage.getItem('token');
  }


  login(datosLogin: Login) {
    return fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datosLogin),
    })
      .then(response => response.json().then(data => {
        if (data.status === 'ok') {
          localStorage.setItem('token', data.token);
          return true
        } else {
          return false
        }
      }))
  }

  estaLogueado(): boolean {
    if (this.getToken())
      return true;
    else
      return false;
  }



}
  


