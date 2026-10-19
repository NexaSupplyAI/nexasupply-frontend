import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'inventario', loadComponent: () => import('./features/inventory/inventory').then((m) => m.Inventory) },
  { path: 'pedidos', loadComponent: () => import('./features/orders/orders').then((m) => m.Orders) },
  { path: 'proveedores', loadComponent: () => import('./features/suppliers/suppliers').then((m) => m.Suppliers) },
  { path: 'reportes', loadComponent: () => import('./features/reports/reports').then((m) => m.Reports) },
  { path: 'asistente', loadComponent: () => import('./features/ai-assistant/ai-assistant').then((m) => m.AiAssistant) },
  { path: '**', redirectTo: '' },
];
