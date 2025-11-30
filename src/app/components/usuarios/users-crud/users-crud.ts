import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ServEventosJson } from '../../../services/ServEventosJson';
import { User } from '../../../models/User'; 

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

  constructor(private service: ServEventosJson) {}

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
    if (form.invalid) return;

    if (this.isEditing && this.formModel.id) {
      // UPDATE
      this.service.updateUser(this.formModel.id, this.formModel).subscribe(() => {
        this.loadUsers();
        this.closeModal(form);
        this.isEditing = false;
      });
    } else {
      // CREATE
      const { id, ...userData } = this.formModel;
      this.service.createUser(userData as Omit<User, 'id'>).subscribe(() => {
        this.loadUsers();
        this.closeModal(form);
      });
    }
  }

  deleteUser(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Deseas eliminar este usuario?')) return;

    this.service.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
