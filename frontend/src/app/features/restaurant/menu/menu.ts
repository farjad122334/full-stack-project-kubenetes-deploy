import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface MenuItem {
  itemId: number;
  itemName: string;
  description: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  menuId: number;
}

// Renamed to ApiMenu to avoid conflict with component class 'Menu'
interface ApiMenu {
  menuId: number;
  menuName: string;
  category: string;
  description?: string;
  menuItems: MenuItem[];
}

// UI Interface matching the HTML template's expectations
interface MenuCategoryUI {
  id: number;       // mapped from menuId
  title: string;    // mapped from menuName
  badge: string;    // mapped from category
  badgeClass: string;
  itemCount: number;
  isOpen?: boolean;
  items: any[];

  // Keep reference to original for API calls
  originalMenuId: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {

  // HTML iterates over 'categories'
  categories: MenuCategoryUI[] = [];
  loading = false;

  // Modal State
  isAddItemModalOpen = false;
  isEditMode = false;

  // HTML uses 'selectedCategoryForAdd'
  selectedCategoryForAdd: MenuCategoryUI | null = null;
  selectedItemOriginal: any | null = null;

  // HTML binds to 'newItem' object
  newItem: {
    name: string;
    description: string;
    price: number | null;
    image: string | null;
    isAvailable: boolean;
    imageFile?: File;
  } = { name: '', description: '', price: null, image: null, isAvailable: true };

  // Add Menu Modal State
  isAddMenuModalOpen = false;

  // HTML binds to 'newMenu' object
  newMenu = {
    title: '',
    badge: ''
  };

  // Delete Modal State
  isDeleteModalOpen = false;
  deleteTarget: { type: 'category' | 'item', category?: MenuCategoryUI, item?: any } | null = null;
  deleteMessage = '';

  private readonly API_URL = `${environment.apiUrl}/api/RestaurantMenu`;

  constructor(private http: HttpClient, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus() {
    this.loading = true;
    this.http.get<ApiMenu[]>(this.API_URL).subscribe({
      next: (data) => {
        // Map Backend API Data to UI Structure
        this.categories = data.map(m => ({
          id: m.menuId,
          originalMenuId: m.menuId,
          title: m.menuName,
          badge: m.category,
          badgeClass: 'bg-primary-subtle text-primary border-primary-subtle',
          itemCount: m.menuItems?.length || 0,
          isOpen: false,
          items: (m.menuItems || []).map(i => ({
            id: i.itemId,
            name: i.itemName,
            description: i.description,
            price: i.price,
            image: i.image,
            isAvailable: i.isAvailable
          }))
        }));

        // Open first one by default if exists
        if (this.categories.length > 0) {
          this.categories[0].isOpen = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading menus', err);
        this.loading = false;
      }
    });
  }

  // --- MENU (CATEGORY) MANAGEMENT ---

  addMenu() {
    this.newMenu = { title: '', badge: '' };
    this.isAddMenuModalOpen = true;
  }

  closeAddMenuModal() {
    this.isAddMenuModalOpen = false;
  }

  submitAddMenu() {
    if (!this.newMenu.title || !this.newMenu.badge) return;

    const payload = {
      menuName: this.newMenu.title,
      category: this.newMenu.badge,
      description: ''
    };

    this.http.post<ApiMenu>(this.API_URL, payload).subscribe({
      next: (createdMenu) => {
        // Add locally
        const newCategory: MenuCategoryUI = {
          id: createdMenu.menuId,
          originalMenuId: createdMenu.menuId,
          title: createdMenu.menuName,
          badge: createdMenu.category,
          badgeClass: 'bg-secondary-subtle text-secondary border-secondary-subtle',
          itemCount: 0,
          isOpen: true,
          items: []
        };

        this.categories.unshift(newCategory);
        this.closeAddMenuModal();
      },
      error: (err) => {
        console.error('Error creating menu', err);
        this.toastService.show('Failed to create menu', 'error');
      }
    });
  }

  deleteCategory(category: MenuCategoryUI) {
    this.deleteTarget = { type: 'category', category };
    this.deleteMessage = `Are you sure you want to delete "${category.title}" and all its items?`;
    this.isDeleteModalOpen = true;
  }

  toggleCategory(category: MenuCategoryUI) {
    category.isOpen = !category.isOpen;
  }

  // --- ITEM MANAGEMENT ---

  openAddItemModal(category: MenuCategoryUI) {
    this.isEditMode = false;
    this.selectedCategoryForAdd = category;
    this.selectedItemOriginal = null;

    // Reset form
    this.newItem = {
      name: '',
      description: '',
      price: null,
      image: null,
      isAvailable: true
    };

    this.isAddItemModalOpen = true;
  }

  openEditItemModal(category: MenuCategoryUI, item: any) {
    this.isEditMode = true;
    this.selectedCategoryForAdd = category;
    this.selectedItemOriginal = item;

    // Fill form
    this.newItem = {
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      isAvailable: item.isAvailable
    };

    this.isAddItemModalOpen = true;
  }

  closeAddItemModal() {
    this.isAddItemModalOpen = false;
    this.selectedCategoryForAdd = null;
    this.selectedItemOriginal = null;
  }

  onItemImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newItem.imageFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newItem.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitAddItem() {
    if (!this.selectedCategoryForAdd || !this.newItem.name || this.newItem.price === null) return;

    const formData = new FormData();
    formData.append('ItemName', this.newItem.name);
    formData.append('Price', this.newItem.price.toString());
    formData.append('Description', this.newItem.description || '');
    formData.append('IsAvailable', this.newItem.isAvailable.toString());

    if (this.newItem.imageFile) {
      formData.append('ImageFile', this.newItem.imageFile);
    }

    if (this.isEditMode && this.selectedItemOriginal) {
      // UPDATE
      this.http.put<any>(`${this.API_URL}/items/${this.selectedItemOriginal.id}`, formData).subscribe({
        next: (updatedItem) => {
          // Update locally
          this.selectedItemOriginal.name = updatedItem.itemName;
          this.selectedItemOriginal.price = updatedItem.price;
          this.selectedItemOriginal.description = updatedItem.description;
          this.selectedItemOriginal.isAvailable = updatedItem.isAvailable;
          if (updatedItem.image) this.selectedItemOriginal.image = updatedItem.image;

          this.closeAddItemModal();
        },
        error: (err) => {
          console.error('Error updating item', err);
          this.toastService.show('Failed to update item', 'error');
        }
      });
    } else {
      // CREATE
      this.http.post<any>(`${this.API_URL}/${this.selectedCategoryForAdd.originalMenuId}/items`, formData).subscribe({
        next: (createdItem) => {
          const newItemUI = {
            id: createdItem.itemId,
            name: createdItem.itemName,
            description: createdItem.description,
            price: createdItem.price,
            image: createdItem.image,
            isAvailable: createdItem.isAvailable
          };

          this.selectedCategoryForAdd!.items.push(newItemUI);
          this.selectedCategoryForAdd!.itemCount = this.selectedCategoryForAdd!.items.length;
          this.closeAddItemModal();
        },
        error: (err) => {
          console.error('Error creating item', err);
          this.toastService.show('Failed to create item', 'error');
        }
      });
    }
  }

  deleteItem(category: MenuCategoryUI, item: any) {
    this.deleteTarget = { type: 'item', category, item };
    this.deleteMessage = `Are you sure you want to delete "${item.name}"?`;
    this.isDeleteModalOpen = true;
  }

  // --- DELETE CONFIRMATION ---

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;

    if (this.deleteTarget.type === 'category' && this.deleteTarget.category) {
      const menuId = this.deleteTarget.category.originalMenuId;
      this.http.delete(`${this.API_URL}/${menuId}`).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== menuId);
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Error deleting menu', err);
          this.toastService.show('Failed to delete menu', 'error');
        }
      });
    } else if (this.deleteTarget.type === 'item' && this.deleteTarget.item && this.deleteTarget.category) {
      const itemId = this.deleteTarget.item.id;
      this.http.delete(`${this.API_URL}/items/${itemId}`).subscribe({
        next: () => {
          if (this.deleteTarget?.category) {
            this.deleteTarget.category.items = this.deleteTarget.category.items.filter(i => i.id !== itemId);
            this.deleteTarget.category.itemCount = this.deleteTarget.category.items.length;
          }
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Error deleting item', err);
          this.toastService.show('Failed to delete item', 'error');
        }
      });
    }
  }
}
