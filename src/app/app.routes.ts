import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { EstadoCocherasComponent } from './pages/estado-cocheras/estado-cocheras.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import{IntroductionComponent} from './pages/introduction/introduction.component'

function guardiaLogueado(){
    let auth = inject(AuthService);
    let router = inject(Router)

    if (auth.estaLogueado())
        return true;
    else {
        router.navigate(['/login'])
        return false;
    }
}

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path:"estado-cocheras",
        component: EstadoCocherasComponent,
        canActivate:[guardiaLogueado]
    },
    {
        path:"reportes",
        component:ReportesComponent
    },
    {
        path:"",
        redirectTo: "login",
        pathMatch: "full"
    },
    {
        path:"precios",
        component:PreciosComponent
    },
    {
        path:"introduction",
        component:IntroductionComponent
    }
];
