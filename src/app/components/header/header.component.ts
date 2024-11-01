import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  esAdmin:boolean = true

  deslogin(): Promise<number> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: true
    });
    return swalWithBootstrapButtons
      .fire({
        title: "",
        text: "Estas seguro de querer cerrar la sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
        reverseButtons: true
      })
      .then((result) => {
        return result.isConfirmed ? 1 : 0;
      });
  }
  constructor(private router: Router) {}

  async handleLogin() {
    const result = await this.deslogin();
    if (result === 1) {
      this.router.navigate(['login']);
    }
  }  


}
