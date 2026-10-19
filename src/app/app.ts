import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationService } from './core/notification.service';

@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive], templateUrl: './app.html', styleUrl: './app.scss' })
export class App {
  readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly navigation = [
    { path: '/', label: 'Dashboard', icon: '◫' }, { path: '/inventario', label: 'Inventario', icon: '▦' },
    { path: '/pedidos', label: 'Pedidos', icon: '▤' }, { path: '/proveedores', label: 'Proveedores', icon: '⇄' },
    { path: '/reportes', label: 'Reportes', icon: '◩' }, { path: '/asistente', label: 'Asistente IA', icon: '✦' },
  ];
  reload(): void { const url = this.router.url; void this.router.navigateByUrl('/_reload', { skipLocationChange: true }).then(() => this.router.navigateByUrl(url)); }
}
