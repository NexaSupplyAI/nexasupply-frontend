import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HealthApi, ReportingApi } from '../../core/api.services';
import { DashboardData } from '../../core/models';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector:'app-dashboard', imports:[CommonModule,RouterLink],
  template:`
    <div class="page-head"><div><p class="eyebrow">RESUMEN OPERATIVO</p><h1>Dashboard</h1><p>Datos consolidados en tiempo real por reporting-service.</p></div><button (click)="load()" [disabled]="loading()">Actualizar</button></div>
    @if (loading()) { <div class="loading">Consultando los cinco microservicios…</div> }
    @if (data(); as d) {
      <section class="metrics">
        <article><span>Productos</span><strong>{{d.totalProductos}}</strong><small>catálogo activo</small></article>
        <article><span>Stock bajo</span><strong class="warn">{{d.productosStockBajo}}</strong><small>requieren atención</small></article>
        <article><span>Pedidos pendientes</span><strong>{{d.pedidosPendientes}}</strong><small>flujo de ventas</small></article>
        <article><span>Proveedores activos</span><strong>{{d.proveedoresActivos}}</strong><small>abastecimiento</small></article>
        <article><span>Valor inventario</span><strong>{{d.valorInventario|currency:'PEN':'symbol':'1.2-2'}}</strong><small>estimado</small></article>
        <article><span>Valor pedidos</span><strong>{{d.valorPedidos|currency:'PEN':'symbol':'1.2-2'}}</strong><small>pendiente</small></article>
      </section>
      <section class="two-cols">
        <div class="panel"><div class="panel-title"><h2>Stock crítico</h2><a routerLink="/inventario">Ver inventario</a></div>
          @if (!d.stockBajo.length) { <p class="empty">No hay productos con stock bajo.</p> }
          @for (item of d.stockBajo; track item.id) { <div class="row"><div><strong>{{item.idProducto|slice:0:8}}…</strong><small>Almacén {{item.idAlmacen|slice:0:8}}…</small></div><span class="badge danger">{{item.cantidadDisponible}} disp.</span></div> }
        </div>
        <div class="panel"><div class="panel-title"><h2>Pedidos pendientes</h2><a routerLink="/pedidos">Gestionar</a></div>
          @if (!d.pedidosPendientesDetalle.length) { <p class="empty">No hay pedidos pendientes.</p> }
          @for (order of d.pedidosPendientesDetalle; track order.id) { <div class="row"><div><strong>{{order.numeroPedido}}</strong><small>{{order.nombreCliente||'Sin cliente'}} · {{order.solicitadoEn|date:'short'}}</small></div><span class="badge">{{order.estado}}</span></div> }
        </div>
      </section>
      <p class="generated">Generado {{d.generadoEn|date:'medium'}} · Fuentes: {{d.generadoDesde.join(', ')}}</p>
    }
    <section class="panel services"><div class="panel-title"><h2>Estado de servicios</h2><span>Actuator health</span></div><div class="service-grid">
      @for (name of serviceNames; track name) { <div><span class="status" [class.up]="health()[name]==='UP'"></span><strong>{{name}}</strong><small>{{health()[name]||'SIN CONEXIÓN'}}</small></div> }
    </div></section>
  `,
  styles:[`:host{display:block}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}.metrics article{background:white;border:1px solid var(--border);border-radius:10px;padding:18px}.metrics span,.metrics small{display:block;color:var(--muted)}.metrics strong{display:block;font-size:27px;margin:7px 0}.metrics .warn{color:#ba6b15}.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}.panel{background:white;border:1px solid var(--border);border-radius:10px;padding:18px}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}.panel-title h2{margin:0;font-size:16px}.panel-title a{font-size:12px}.row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #edf1f5;padding:12px 0}.row small{display:block;color:var(--muted);margin-top:3px}.badge{font-size:11px;background:#e9f1ff;color:#245fae;padding:4px 8px;border-radius:20px}.badge.danger{background:#fff0e7;color:#a94a13}.generated{color:var(--muted);font-size:11px;text-align:right}.services{margin-top:18px}.service-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.service-grid>div{border:1px solid var(--border);padding:11px;border-radius:7px}.service-grid strong,.service-grid small{display:block}.service-grid small{color:var(--muted);font-size:10px;margin-top:3px}.status{display:inline-block;width:7px;height:7px;border-radius:50%;background:#d25151;margin-right:6px}.status.up{background:#26a874}@media(max-width:1000px){.metrics{grid-template-columns:repeat(2,1fr)}.two-cols{grid-template-columns:1fr}.service-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:550px){.metrics{grid-template-columns:1fr}}`]
})
export class Dashboard {
  private api=inject(ReportingApi); private healthApi=inject(HealthApi); private notify=inject(NotificationService);
  readonly data=signal<DashboardData|null>(null); readonly loading=signal(true); readonly health=signal<Record<string,string>>({}); readonly serviceNames=['inventory','orders','suppliers','reporting','ai'];
  constructor(){this.load()}
  load(){this.loading.set(true);this.api.dashboard().subscribe({next:d=>{this.data.set(d);this.loading.set(false)},error:e=>{this.loading.set(false);this.notify.error(e)}});this.healthApi.all().subscribe({next:r=>this.health.set(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v.status]))),error:()=>this.health.set({})})}
}
