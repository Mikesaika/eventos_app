import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ServEventosJson } from '../../../services/ServEventosJson';
import { User } from '../../../models/User';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dialog } from '../../../shared/dialog/dialog';
import { TableReutilizable } from '../../../shared/table-reutilizable/table-reutilizable';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, TableReutilizable],
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

  // Modal de “VER”  tabla reutilizable
  viewModalVisible = false;
  viewTableData: any[] = [];
  viewTableColumns: string[] = ['id', 'name', 'email', 'role', 'estado'];
  viewTableHeaders: string[] = ['ID', 'Nombre', 'Correo', 'Rol', 'Estado'];

  constructor(private service: ServEventosJson, private modalService: NgbModal) {}

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
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.role ?? '').toLowerCase().includes(term)
    );
  }

  /*  LÓGICA DE VALIDACIÓN  */

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

  private async showMessageDialog(title: string, message: string): Promise<void> {
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

    try {
      await modalRef.result;
    } catch {}
  }

  /*  MODAL PRINCIPAL (CREAR / EDITAR)  */

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

  onSubmit(form: NgForm, event: Event) {
    event.preventDefault(); // prevenimos submit nativo
    this.saveUser(form);
  }

  async saveUser(form: NgForm) {
    if (!this.canSubmit(form)) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.isEditing && this.formModel.id) {
      // UPDATE
      this.service.updateUser(this.formModel.id, this.formModel).subscribe(async () => {
        this.loadUsers();
        this.closeModal(form);
        this.isEditing = false;

        await this.showMessageDialog(
          'Usuario actualizado',
          'El usuario se actualizó correctamente.'
        );
      });
    } else {
      // CREATE
      const { id, ...userData } = this.formModel;
      this.service.createUser(userData as Omit<User, 'id'>).subscribe(async () => {
        this.loadUsers();
        this.closeModal(form);

        await this.showMessageDialog('Usuario creado', 'El usuario se creó correctamente.');
      });
    }
  }

  async deleteUser(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Deseas eliminar este usuario?')) return;

    this.service.deleteUser(id).subscribe(async () => {
      this.loadUsers();

      await this.showMessageDialog('Usuario eliminado', 'El usuario se eliminó correctamente.');
    });
  }

  /*  MODAL TABLE-REUTILIZABLE  */

  openViewModal(user: User) {
    // Mostramos solo ese usuario en la tabla
    const userConEstado = {
      ...user,
      estado: user.active ? 'Activo' : 'Inactivo',
    };

    this.viewTableData = [userConEstado];
    this.viewModalVisible = true;
  }

  closeViewModal() {
    this.viewModalVisible = false;
  }
}
