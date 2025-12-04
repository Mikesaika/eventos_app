import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ServEventosJson } from '../../../services/ServEventosJson';
import { User } from '../../../models/User';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dialog } from '../../../shared/dialog/dialog'; 

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css',
})
export class UsersCrud {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  formModel: User = {
    name: '',
    email: '',
    role: '',
    active: true,
  };

  isEditing = false;
  modalVisible = false;

  constructor(
    private service: ServEventosJson,
    private modalService: NgbModal 
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.service.getUsers().subscribe((data) => {
      this.users = data;
      this.filteredUsers = data;
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }

  /*  LÓGICA DE VALIDACIÓN */

  isFieldInvalid(form: NgForm | undefined, field: keyof User): boolean {
    if (!form) return false;
    const control = form.controls[field as string];
    return !!control && control.invalid && (control.dirty || control.touched || form.submitted);
  }

  getFieldError(field: keyof User, form: NgForm | undefined): string {
    if (!form) return '';
    const control = form.controls[field as string];
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      if (field === 'name') return 'El nombre es obligatorio.';
      if (field === 'email') return 'El correo es obligatorio.';
      if (field === 'role') return 'El rol es obligatorio.';
      return 'Este campo es obligatorio.';
    }

    if (control.errors['email']) {
      return 'El formato del correo no es válido.';
    }

    return 'El valor ingresado no es válido.';
  }

  isFormValid(form: NgForm | null | undefined): boolean {
    if (!form) return false;

    return form.valid === true;
  }

  canSubmit(form: NgForm | null | undefined): boolean {
    return this.isFormValid(form);
  }

  /*  DIALOG REUTILIZABLE  */

  private showMessageDialog(title: string, message: string): void {
    const modalRef = this.modalService.open(Dialog, {
      centered: true,
      backdrop: 'static',
      keyboard: false, 
    });

    modalRef.componentInstance.data = {
      title,
      message,
      showCancel: false,
      confirmText: 'Aceptar',
    };
  }


  openCreateModal() {
    this.isEditing = false;
    this.formModel = {
      name: '',
      email: '',
      role: '',
      active: true,
    };
    this.modalVisible = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    this.formModel = { ...user };
    this.modalVisible = true;
  }

  closeModal(form?: NgForm) {
    this.modalVisible = false;
    if (form) {
      form.resetForm();
    }
  }

  saveUser(form: NgForm) {
    if (!this.canSubmit(form)) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.isEditing && this.formModel.id) {
      /* UPDATE */
      this.service.updateUser(this.formModel.id, this.formModel).subscribe(() => {
        this.loadUsers();
        this.closeModal(form);
        this.isEditing = false;

        this.showMessageDialog('Usuario actualizado', 'El usuario se actualizó correctamente.');
      });
    } else {
      /* CREATE */
      const { id, ...userData } = this.formModel;
      this.service.createUser(userData as Omit<User, 'id'>).subscribe(() => {
        this.loadUsers();
        this.closeModal(form);

        this.showMessageDialog('Usuario creado', 'El usuario se creó correctamente.');
      });
    }
  }

  deleteUser(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Deseas eliminar este usuario?')) return;

    this.service.deleteUser(id).subscribe(() => {
      this.loadUsers();

      this.showMessageDialog('Usuario eliminado', 'El usuario se eliminó correctamente.');
    });
  }
  onSubmit(form: NgForm, event: Event) {
    event.preventDefault(); 
    this.saveUser(form); 
  }
}
