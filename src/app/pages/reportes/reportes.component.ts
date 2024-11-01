import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { CocherasService } from '../../services/cocheras.service';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import { Reporte } from '../../interfaces/reportes';
import { Estacionamiento } from '../../interfaces/estacionamiento';
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, NgFor],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  headerR = {
    numero: "N°",
    mes: "Mes",
    usos: "Usos",
    cobrado: "Cobrado",
  };

  reportes: Reporte[] = []; //array de reportes que se envia luego de que los datos hayan sido recolectados del otro array de reportes, porque si no se cargara cada vez que se abra.

  cochera = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);

  ngOnInit(): void { //para reflejar en pantalla todo lo que hicimos en traerEstacionamiento.
    this.traerEstacionamientos().then((res) => {
      this.reportes = res;
    });
  }

  traerCocherasById(id: number) {
    this.cochera.getCocherasId(id).then(cochera => {
      console.log(cochera);
    });
  }

  traerEstacionamientos() {
    return this.estacionamientos.getEstacionamiento().then(estacionamientos => {
      let reportes: Reporte[] = []; //array de reportes en el que cada elemento es un mes.
      for (let estacionamiento of estacionamientos) {
        if (estacionamiento.horaEgreso != null) {  //codigo explicado por paulina bruno (ponganle puntos extra)!
          let fecha = new Date(estacionamiento.horaEgreso);
          let mes = fecha.toLocaleDateString("es-CL", {
            month: "numeric",
            year: "numeric",
          });
          const indiceMes = reportes.findIndex((res) => res.mes === mes); //r.mes es mes del array, mes es el que le estoy pasando yo. Constante devuelve indice que puede existir o no existir. Si el mes que estoy buscando esta en la lista, se suma. Si no, se crea.
          if (indiceMes === -1) {
            reportes.push({
              mes: mes,
              usos: 1,
              cobrados: estacionamiento.costo,
            });
          } else {
            reportes[indiceMes].usos += 1;
            reportes[indiceMes].cobrados += estacionamiento.costo;
          }
        }
      }
      return reportes;
    });
  }
}
