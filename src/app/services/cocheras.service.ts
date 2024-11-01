import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Cochera } from '../interfaces/cochera';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {

getCocheras() {
    return fetch("http://localhost:4000/cocheras", {//fetch que trae cocheras, id cocheras
      method: "GET",
      headers: {
        Authorization: "Bearer " + (this.auth.getToken() ?? "")
      },
    }).then(r => r.json());
  }

auth = inject(AuthService);
getCocherasId(idCochera: number) {
  return fetch(`http://localhost:4000/cocheras/${idCochera}`, {//fetch que trae cocheras, id cocheras.
    method: "GET",
    headers: {
      Authorization: "Bearer " + (this.auth.getToken() ?? "")
    },
  }).then(r => r.json());
}


}
