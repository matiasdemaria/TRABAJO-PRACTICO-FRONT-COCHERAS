import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { tarifas } from '../../interfaces/tarifas';
import { NgModelGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [RouterModule,HeaderComponent,CommonModule],
  templateUrl: './precios.component.html',
  styleUrl: './precios.component.scss'
})
export class PreciosComponent {
auth = inject(AuthService)
tarifas: (tarifas)[] = [];

getTarifas() {
  return fetch('http://localhost:4000/tarifas/', {
    method: 'GET',
    headers: {
      Authorization: "Bearer " + this.auth.getToken()
    }
  })
  .then(response => response.json())
  .then((tarifas) => this.tarifas = tarifas)
  .catch(error => console.error("Error al obtener tarifas:", error));
}

ngOnInit(){
  this.getTarifas().then(tarifas => {
    this.tarifas = tarifas;
  });

}

async updateTarifas(tarifasId: string) {
  await Swal.fire({
    title: "Ingrese el monto al que quiere actualizar",
    input: "number",  // Configura el input como tipo número
    inputLabel: "",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Tienes que escribir algo"; // Mensaje de error si el valor está vacío
      }
      return fetch(`http://localhost:4000/tarifas/${tarifasId}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.auth.getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          tarifasId: tarifasId,
          valor: value, 
          
        }), // Convertir monto a número
      })
      .then((response) => {
        if (response.ok) {
          Swal.fire("Actualizado!", "El monto ha sido actualizado.", "success");
        } else {
          Swal.fire("Error!", "No se pudo actualizar el monto.", "error");
        }
      })
      .then(() => this.getTarifas())
    }
})
}
}