import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cochera';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import Swal from 'sweetalert2';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import { CocherasService } from '../../services/cocheras.service';

@Component({
  selector: 'app-estado-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './estado-cocheras.component.html',
  styleUrls: ['./estado-cocheras.component.scss']
})
export class EstadoCocherasComponent {
  titulo: string = 'Estado de la cochera';

  header: { nro: string, disponibilidad: string, ingreso: string, acciones: string } = {
    nro: 'Nro',
    disponibilidad: 'Disponibilidad',
    ingreso: 'Ingreso',
    acciones: 'Acciones',
  };

  filas: (Cochera & { activo: Estacionamiento | null, horaDeshabilitacion: string | null })[] = [];
  siguienteNumero: number = 1;
  auth = inject(AuthService);
  cocheras = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);

  
  ngOnInit() {
    this.reload().then((filas: Cochera[]) => {
      this.filas = filas.map((fila: Cochera) => ({
        ...fila,
        activo: fila.activo || null,
        horaDeshabilitacion: fila.horaDeshabilitacion || (fila.deshabilitada ? new Date().toLocaleTimeString('es-ES',{year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }) : null),
        deshabilitada: fila.deshabilitada || 0
      })) as (Cochera & { activo: Estacionamiento | null; horaDeshabilitacion: string | null; deshabilitada: number })[];
    }).catch(error => {
      console.error('Error al cargar las cocheras:', error);
    });
  }
    
  
  traerCocheras() {
    return fetch('http://localhost:4000/cocheras/', {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.auth.getToken()
      }
    }).then((response) => response.json());
  }

  reload() {
    return fetch('http://localhost:4000/cocheras', {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.auth.getToken(),
      },
    }).then(r => r.json());
  }

  agregarFila() {
    Swal.fire({
      title: "Esta seguro que quiere añadir una cochera?",
      text: "",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Si, añadir !"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('http://localhost:4000/cocheras/', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + this.auth.getToken(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ descripcion: "" })
        }).then(() => {
          this.traerCocheras().then((filas) => {
            this.filas = filas;
          });
        }).catch(error => {
          console.error('Error en la solicitud:', error);
        });
        this.siguienteNumero += 1;
      }
    });
    
  }

  async eliminarCochera(cocheraId: number) {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar cochera?',
      text: 'Esta acción eliminará la cochera de la plataforma permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:4000/cocheras/${cocheraId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
          },
        });
        this.filas = this.filas.filter(fila => fila.id !== cocheraId);
        Swal.fire('Cochera Eliminada', 'La cochera ha sido eliminada de la plataforma.', 'success');
      } catch (error) {
        console.error('Error al eliminar la cochera:', error);
        Swal.fire('Error', 'No se pudo eliminar la cochera. Inténtalo de nuevo.', 'error');
      }
    }
  }

  async cambiarDisponibilidadCochera(cocheraId: number, estadoActual: number) {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'disable' : 'enable';
    const url = `http://localhost:4000/cocheras/${cocheraId}/${accion}`;
    const mensaje = nuevoEstado === 1 ? 'deshabilitar' : 'habilitar';
  
    const confirmacion = await Swal.fire({
      title: `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} cochera?`,
      text: `Esta acción cambiará la disponibilidad a "${mensaje === 'habilitar' ? 'Disponible' : 'No disponible'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${mensaje}`,
      cancelButtonText: 'Cancelar'
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
          }
        });
  
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
  
        // Actualizar la horaDeshabilitacion: asignarla si está "No disponible" y borrarla si está "Disponible"
        const horaDeshabilitacion = nuevoEstado === 1 ? new Date().toISOString() : null;
  
        // Actualizar el estado en `this.filas`
        this.filas = this.filas.map(fila => 
          fila.id === cocheraId 
            ? { ...fila, deshabilitada: nuevoEstado, horaDeshabilitacion, activo: nuevoEstado ? null : fila.activo } 
            : fila
        );
  
        Swal.fire('Disponibilidad Actualizada', `La cochera ha sido marcada como "${nuevoEstado === 1 ? 'No disponible' : 'Disponible'}".`, 'success');
      } catch (error) {
        console.error(`Error al ${mensaje} la cochera:`, error);
        Swal.fire('Error', `No se pudo ${mensaje} la cochera. Verifica la conexión y la URL.`, 'error');
      }
    }
  }
  
  
  

  async abrirModalNuevoEstacionamiento(idCochera: number) {
    await Swal.fire({
      title: "Ingrese la patente del vehículo",
      input: "text",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente válida";
        }
        return null;
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        const patente = res.value;
        const horaIngreso = new Date().toISOString();
  
        try {
          const response = await fetch('http://localhost:4000/estacionamientos/abrir', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + this.auth.getToken(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idCochera: idCochera,patente,idUsuarioIngreso : idCochera })
          });
  
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data: Estacionamiento = await response.json();
  
          this.filas = this.filas.map(fila => 
            fila.id === idCochera 
              ? { ...fila, activo: { id: data.id, patente, horaIngreso } as Estacionamiento, horaDeshabilitacion: null } 
              : fila
          ) as (Cochera & { activo: Estacionamiento | null; horaDeshabilitacion: string | null; })[];
          localStorage.setItem('cocheras',JSON.stringify(this.filas))
          Swal.fire('Estacionamiento Abierto', `La cochera fue marcada como ocupada con la patente: ${patente}.`, 'success');
        } catch (error) {
          console.error('Error al abrir el estacionamiento en el servidor:', error);
          Swal.fire('Error', 'No se pudo abrir el estacionamiento. Inténtalo de nuevo.', 'error');
        }
      }
    });
  }

  async cerrarEstacionamiento(idCochera: number, estacionamientoId: number,estacionamientoPatente:string) {
    const confirmacion = await Swal.fire({
      title: '¿Cerrar estacionamiento?',
      text: 'Esta acción liberará la cochera y la marcará como disponible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/estacionamientos/cerrar`, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ estacionamientoId, patente:estacionamientoPatente,idUsuarioEgreso:idCochera})
        });
  
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
  
        this.filas = this.filas.map(fila => 
          fila.id === idCochera 
            ? { ...fila, activo: null, horaDeshabilitacion: null } 
            : fila
        ) as (Cochera & { activo: Estacionamiento | null; horaDeshabilitacion: string | null; })[];
        localStorage.setItem('cocheras',JSON.stringify(this.filas))
  
        Swal.fire('Estacionamiento Cerrado', 'La cochera ha sido liberada y marcada como disponible.', 'success');
      } catch (error) {
        console.error('Error al cerrar el estacionamiento:', error);
        Swal.fire('Error', 'No se pudo cerrar el estacionamiento. Inténtalo de nuevo.', 'error');
      }
    }
  }
}
