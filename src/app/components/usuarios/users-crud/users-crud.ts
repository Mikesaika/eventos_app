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
  imports: [CommonModule, FormsModule, TableReutilizable, NotificationComponent],
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css',
})
export class UsersCrud implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  
  // Inicializado con 'passwordHash' y 'activo' para coincidir con el db.json
  formModel: User = {
    usuarioID: 0,
    nombre: '',
    email: '',
    passwordHash: '',
    telefono: '', 
    direccion: '', 
    fechaRegistro: new Date(),
    rol: 'Cliente',
    activo: true, // Sincronizado con db.json
  };

  isEditing = false;
  modalVisible = false;

  viewModalVisible = false;
  viewTableData: any[] = [];
  // Columnas de vista actualizadas para usar 'activo' en lugar de 'estado' si se prefiere directo
  viewTableColumns: string[] = ['usuarioID', 'nombre', 'email', 'telefono', 'direccion', 'fechaRegistro', 'rol', 'activo'];
  viewTableHeaders: string[] = ['ID', 'Nombre', 'Correo', 'Teléfono', 'Dirección', 'Registro', 'Rol', 'Estado'];

  constructor(
    private service: UserService,
    private modalService: NgbModal,
    private notify: NotificationService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: () => this.notify.show('Error al cargar usuarios desde el servidor', 'error'),
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (u) =>
        (u.nombre ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.telefono ?? '').toLowerCase().includes(term) ||
        (u.rol ?? '').toLowerCase().includes(term) ||
        (u.direccion ?? '').toLowerCase().includes(term)
    );
  }

  onSubmit(form: NgForm, event: Event) {
    event.preventDefault();
    if (this.canSubmit(form)) {
      this.saveUser(form);
    } else {
      form.control.markAllAsTouched();
      this.notify.show('Por favor, completa los campos requeridos', 'error');
    }
  }

  canSubmit(form: NgForm | null | undefined): boolean {
    return !!form && form.valid === true;
  }

  isFieldInvalid(form: NgForm | undefined, field: keyof User | string): boolean {
    if (!form || !form.controls[field as string]) return false;
    const control = form.controls[field as string];
    return control.invalid && (control.dirty || control.touched || form.submitted);
  }

  getFieldError(field: keyof User | string, form: NgForm | undefined): string {
    if (!form || !form.controls[field as string]) return '';
    const control = form.controls[field as string];
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['email']) return 'Formato de correo inválido.';
    return 'Valor inválido.';
  }

  // --- GESTIÓN DE MODALES ---
  openCreateModal() {
    this.isEditing = false;
    this.formModel = {
      usuarioID: 0,
      nombre: '',
      email: '',
      passwordHash: '',
      telefono: '',
      direccion: '',
      fechaRegistro: new Date().toISOString(), // Formato ISO para consistencia
      rol: 'Cliente',
      activo: true,
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
    if (form) form.resetForm();
  }

  saveUser(form: NgForm) {
    // Aseguramos que el passwordHash se envíe si es nuevo usuario
    if (this.isEditing) {
      this.service.updateUser(this.formModel).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.notify.show('Usuario actualizado correctamente', 'success');
        },
        error: (err) => this.notify.show('Error al actualizar: ' + err.message, 'error'),
      });
    } else {
      this.service.createUser(this.formModel).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.notify.show('Usuario creado con éxito', 'success');
        },
        error: (err) => this.notify.show('Error al crear: ' + err.message, 'error'),
      });
    }
  }

  deleteUser(id: number | undefined) {
    if (id === undefined) return;
    
    const modalRef = this.modalService.open(Dialog, { centered: true });
    modalRef.componentInstance.data = {
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que deseas eliminar este registro?',
      showCancel: true,
    };

    modalRef.result.then((result) => {
      if (result === true) {
        this.service.deleteUser(id).subscribe({
          next: () => { 
            this.loadUsers(); 
            this.notify.show('Usuario eliminado correctamente', 'success'); 
          },
          error: () => this.notify.show('Error al eliminar el usuario', 'error'),
        });
      }
    }).catch(() => {});
  }

  openViewModal(user: User) {
    // Mapeo dinámico del estado basado en el campo 'activo' del db.json
    const userConEstado = { ...user, estado: user.activo ? 'Activo' : 'Inactivo' };
    this.viewTableData = [userConEstado];
    this.viewModalVisible = true;
  }

  closeViewModal() { this.viewModalVisible = false; }
}