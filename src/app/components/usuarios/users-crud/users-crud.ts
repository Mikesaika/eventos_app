import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { NotificationService } from '../../../services/notification.service';
import { Dialog } from '../../../shared/dialog/dialog';
import { TableReutilizable } from '../../../shared/table-reutilizable/table-reutilizable';
import { NotificationComponent } from '../../../shared/notification/notification';
@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableReutilizable,
    NotificationComponent
  ],
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css',
})
export class UsersCrud implements OnInit {
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

  // Modal de ver
  viewModalVisible = false;
  viewTableData: any[] = [];
  viewTableColumns: string[] = ['id', 'name', 'email', 'role', 'estado'];
  viewTableHeaders: string[] = ['ID', 'Nombre', 'Correo', 'Rol', 'Estado'];

  constructor(
    private service: UserService,
    private modalService: NgbModal,
    private notify: NotificationService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (e) => this.notify.show('Error al cargar usuarios', 'error')
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

  /// LÓGICA DE VALIDACIÓN  

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

  // MODAL PRINCIPAL (CREAR / EDITAR)  

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
    event.preventDefault();
    this.saveUser(form);
  }

  saveUser(form: NgForm) {
    if (!this.canSubmit(form)) {
      form.control.markAllAsTouched();
      this.notify.show('Por favor completa el formulario correctamente', 'error');
      return;
    }

    if (this.isEditing && this.formModel.id) {
      // UPDATE
      this.service.updateUser(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.isEditing = false;
          this.notify.show('Usuario actualizado correctamente', 'success');
        },
        error: (err) => this.notify.show('Error al actualizar: ' + err.message, 'error')
      });
    } else {
      // CREATE
      const { id, ...userData } = this.formModel;
      this.service.createUser(userData as Omit<User, 'id'>).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.notify.show('Usuario creado exitosamente', 'success');
        },
        error: (err) => this.notify.show('Error al crear: ' + err.message, 'error')
      });
    }
  }


  deleteUser(id: string | undefined) {
    if (!id) return;

    const modalRef = this.modalService.open(Dialog, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.data = {
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      showCancel: true,
    };

    modalRef.result.then((result) => {
      if (result === true) {
        this.service.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.notify.show('Usuario eliminado correctamente', 'success');
          },
          error: (err) => this.notify.show('Error al eliminar', 'error')
        });
      }
    }).catch(() => { });
  }

  //MODAL TABLE-REUTILIZABLE  //

  openViewModal(user: User) {
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