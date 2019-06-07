import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { delay } from 'q';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface DialogData {
  nombre: string;
  correo: string;
  password: string;
  password2: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private nombre: string;
  private correo: string;
  private password: string;
  private password2: string;

  constructor(private router: Router, private _snackBar: MatSnackBar, public dialog: MatDialog
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  ngOnInit() {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogUserRegister, {
      width: '50rem',
      data: { nombre: this.nombre, correo: this.correo, password: this.password }
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log(result)
      //console.log(this.nombre, this.password, this.correo)
    });
  }

  async login() {
    var xhttp;
    //console.log(this.correo)
    //console.log(this.password)

    var flag = false;

    xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    xhttp.open("GET", "https://dynamiclibraryjdl.herokuapp.com/iniciarSesion?correo=" + this.correo + "&password=" + this.password, true);
    xhttp.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {
        
        let response = this.responseText;
        response = JSON.parse(response)
        localStorage.setItem('nombreUsuario', response.nombreUsuario);
        localStorage.setItem('idUsuario', response.idUsuario);
        flag = true;

      }
    }
    xhttp.send();
    let delayres = await delay(2000);
    if (flag) {
      this.openSnackBar('Bienvenido', 'Login');
      this.router.navigate(['/']);
    }
    else
      this.openSnackBar('Error al iniciar sesión, inténtalo de nuevo', 'Error')
  }
}



@Component({
  selector: 'dialogUserRegister',
  templateUrl: 'dialogUserRegister.html',
})
export class DialogUserRegister {

  constructor(
    public dialogRef: MatDialogRef<DialogUserRegister>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(50)
  ]);

  pass1FC = new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]);

  pass2FC = new FormControl('', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(this.data.password)
  ]);

  nombreFC = new FormControl('', [
    Validators.required,
    Validators.maxLength(200)
  ]);

  matcher = new MyErrorStateMatcher();

  diference(){
    return this.data.password == this.data.password2;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  async registrar() {

    var xhttp, flag = false;
    console.log(this.data.nombre, this.data.correo, this.data.password)
    xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://dynamiclibraryjdl.herokuapp.com/registrarUsuario", true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function () {
      var response = this.responseText
      if (response != '') { // si se logeo!
        response = JSON.parse(response)
        console.log(response)
        if (response.state == 0) {
          flag = true;
          //this.openSnackBar('Usuario registrado correctamente', 'Registro');
        }
        else {
          flag = false;
          //this.openSnackBar('Error con el registro del usuario', 'Error');
          //localStorage.clear();
        }
      }
    }
    xhttp.send("nombre=" + this.data.nombre + "&correo=" + this.data.correo + "&password=" + this.data.password);
    let delayres = await delay(1500);
    if (flag)
      this.openSnackBar('Usuario registrado correctamente', 'Registro');
    else
      this.openSnackBar('Error con el registro del usuario', 'Error');
  }
}