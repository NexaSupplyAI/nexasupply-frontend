export type UUID = string;
export type JsonMap = Record<string, unknown>;
export interface ApiError { status:number; error:string; message:string; path:string; correlationId?:string; timestamp:string; fields?:Record<string,string> }

export interface Categoria { id:UUID; nombre:string; slug:string; descripcion?:string; idCategoriaPadre?:UUID; activo:boolean; creadoEn:string; actualizadoEn:string; version:number }
export type CategoriaRequest = Pick<Categoria,'nombre'|'slug'> & Partial<Pick<Categoria,'descripcion'|'idCategoriaPadre'|'activo'>>;
export interface Almacen { id:UUID; codigo:string; nombre:string; descripcion?:string; direccion?:string; distrito?:string; ciudad?:string; region?:string; codigoPais:string; activo:boolean; creadoEn:string; actualizadoEn:string; version:number }
export type AlmacenRequest = Pick<Almacen,'codigo'|'nombre'|'codigoPais'> & Partial<Pick<Almacen,'descripcion'|'direccion'|'distrito'|'ciudad'|'region'|'activo'>>;
export type UnidadMedida = 'UNIT'|'KG'|'G'|'L'|'ML'|'M'|'CM'|'BOX'|'PACK';
export interface Producto { id:UUID; sku:string; codigoBarras?:string; nombre:string; descripcion?:string; idCategoria:UUID; unidadMedida:UnidadMedida; precioVenta:number; stockMinimo:number; puntoReorden:number; cantidadReorden:number; activo:boolean; atributos:JsonMap; creadoEn:string; actualizadoEn:string; version:number }
export type ProductoRequest = Omit<Producto,'id'|'creadoEn'|'actualizadoEn'|'version'>;
export interface SaldoInventario { id:UUID; idAlmacen:UUID; idProducto:UUID; cantidadEnMano:number; cantidadReservada:number; cantidadDisponible:number; actualizadoEn:string; version:number }
export interface MovimientoInventario { id:UUID; idAlmacen:UUID; idProducto:UUID; tipoMovimiento:string; cantidad:number; saldoAnterior:number; saldoPosterior:number; tipoReferencia:string; idReferencia:UUID; claveIdempotencia:string; motivo?:string; idActor?:string; metadatos:JsonMap; ocurrioEn:string; creadoEn:string }
export interface ReservaInventario { id:UUID; idAlmacen:UUID; idProducto:UUID; idOrdenExterna:UUID; cantidad:number; estado:string; expiraEn?:string; creadoEn:string; actualizadoEn:string }
export interface EntradaInventarioRequest { idAlmacen:UUID; idProducto:UUID; cantidad:number; tipoReferencia:string; idReferencia:UUID; claveIdempotencia:string; motivo?:string; idActor?:string }

export type EstadoPedido='PENDING'|'CONFIRMED'|'PROCESSING'|'COMPLETED'|'CANCELLED';
export interface Pedido { id:UUID; numeroPedido:string; idClienteExterno?:UUID; nombreCliente?:string; emailCliente?:string; telefonoCliente?:string; estado:EstadoPedido; moneda:string; subtotal:number; montoImpuesto:number; montoDescuento:number; montoEnvio:number; montoTotal:number; notas?:string; solicitadoEn:string; confirmadoEn?:string; completadoEn?:string; canceladoEn?:string; creadoPor?:string; creadoEn:string; actualizadoEn:string; version:number }
export type PedidoRequest = Omit<Pedido,'id'|'estado'|'solicitadoEn'|'confirmadoEn'|'completadoEn'|'canceladoEn'|'creadoEn'|'actualizadoEn'|'version'>;
export interface DetallePedido { id:UUID; idPedido:UUID; idProducto:UUID; idAlmacen?:UUID; skuInstantanea:string; nombreProductoInstantanea:string; cantidad:number; precioUnitario:number; montoDescuento:number; totalLinea:number; creadoEn:string }
export type DetallePedidoRequest = Omit<DetallePedido,'id'|'totalLinea'|'creadoEn'>;
export interface HistorialPedido { id:UUID; idPedido:UUID; estadoAnterior?:EstadoPedido; nuevoEstado:EstadoPedido; motivo?:string; cambiadoPor?:string; cambiadoEn:string }

export type EstadoProveedor='ACTIVE'|'INACTIVE'|'BLOCKED';
export interface Proveedor { id:UUID; codigoProveedor:string; numeroFiscal?:string; razonSocial:string; nombreComercial?:string; email?:string; telefono?:string; estado:EstadoProveedor; calificacion?:number; diasEntregaPredeterminados:number; direccion?:string; distrito?:string; ciudad?:string; region?:string; codigoPais:string; creadoEn:string; actualizadoEn:string; version:number }
export type ProveedorRequest = Omit<Proveedor,'id'|'creadoEn'|'actualizadoEn'|'version'>;
export interface ProductoProveedor { id:UUID; idProveedor:UUID; idProducto:UUID; skuProveedor?:string; precioCompra:number; moneda:string; cantidadMinimaPedido:number; diasEntrega:number; preferido:boolean; activo:boolean; creadoEn:string; actualizadoEn:string }
export type ProductoProveedorRequest = Omit<ProductoProveedor,'id'|'creadoEn'|'actualizadoEn'>;
export type EstadoOrdenCompra='DRAFT'|'SUBMITTED'|'APPROVED'|'PARTIALLY_RECEIVED'|'RECEIVED'|'CANCELLED';
export interface OrdenCompra { id:UUID; numeroOrdenCompra:string; idProveedor:UUID; estado:EstadoOrdenCompra; moneda:string; subtotal:number; montoImpuesto:number; montoDescuento:number; montoTotal:number; fechaEntregaEsperada?:string; notas?:string; solicitadoPor?:string; aprobadoPor?:string; aprobadoEn?:string; creadoEn:string; actualizadoEn:string; version:number }
export type OrdenCompraRequest = Omit<OrdenCompra,'id'|'estado'|'aprobadoPor'|'aprobadoEn'|'creadoEn'|'actualizadoEn'|'version'>;
export interface HistorialOrdenCompra { id:UUID; idOrdenCompra:UUID; estadoAnterior?:EstadoOrdenCompra; nuevoEstado:EstadoOrdenCompra; motivo?:string; cambiadoPor?:string; cambiadoEn:string }
export interface DetalleOrdenCompra { id:UUID; idOrdenCompra:UUID; idProducto:UUID; skuInstantanea:string; nombreProductoInstantanea:string; cantidadPedida:number; cantidadRecibida:number; precioUnitario:number; montoDescuento:number; totalLinea:number; creadoEn:string }
export type DetalleOrdenCompraRequest = Omit<DetalleOrdenCompra,'id'|'cantidadRecibida'|'totalLinea'|'creadoEn'>;
export interface Recepcion { id:UUID; numeroRecepcion:string; idOrdenCompra:UUID; idAlmacen:UUID; estado:'DRAFT'|'POSTED'|'CANCELLED'; recibidoPor?:string; recibidoEn?:string; notas?:string; creadoEn:string; actualizadoEn:string }
export type RecepcionRequest = Pick<Recepcion,'numeroRecepcion'|'idOrdenCompra'|'idAlmacen'> & Partial<Pick<Recepcion,'notas'>>;
export interface DetalleRecepcion { id:UUID; idRecepcionMercaderia:UUID; idDetalleOrdenCompra:UUID; idProducto:UUID; cantidadRecibida:number; creadoEn:string }
export type DetalleRecepcionRequest = Omit<DetalleRecepcion,'id'|'creadoEn'>;

export interface DashboardData { totalProductos:number; productosStockBajo:number; pedidosPendientes:number; proveedoresActivos:number; valorInventario:number; valorPedidos:number; stockBajo:SaldoInventario[]; pedidosPendientesDetalle:Pedido[]; generadoDesde:string[]; generadoEn:string }
export type TipoReporte='DASHBOARD'|'INVENTORY'|'LOW_STOCK'|'ORDERS'|'SUPPLIERS'|'PURCHASE_ORDERS'; export type FormatoReporte='CSV'|'PDF'|'XLSX'|'JSON';
export interface ExportacionReporte { id:UUID; tipoReporte:TipoReporte; formatoSalida:FormatoReporte; estado:string; uriAlmacenamiento?:string; filtros:JsonMap; solicitadoPor?:string; mensajeError?:string; solicitadoEn:string; generadoEn?:string; expiraEn?:string }
export interface ExportacionReporteRequest { tipoReporte:TipoReporte; formatoSalida:FormatoReporte; filtros:JsonMap; solicitadoPor?:string; expiraEn?:string }
export interface Snapshot { id:UUID; inicioPeriodo:string; finPeriodo:string; totalProductos:number; productosStockBajo:number; pedidosPendientes:number; proveedoresActivos:number; valorInventario:number; valorPedidos:number; contenido:JsonMap; versionesOrigen:JsonMap; generadoEn:string }
export type SnapshotRequest = Omit<Snapshot,'id'|'generadoEn'>;

export interface Conversacion { id:UUID; idUsuarioObjeto:string; titulo?:string; estado:string; iniciadaEn:string; ultimaActividadEn:string; cerradaEn?:string }
export interface Mensaje { id:UUID; idConversacion:UUID; rol:'USER'|'ASSISTANT'|'SYSTEM'|'TOOL'; contenido:string; nombreModelo?:string; tokensEntrada?:number; tokensSalida?:number; idCorrelacion:UUID; creadoEn:string }
export interface EjecucionHerramienta { id:UUID; idConversacion:UUID; idMensaje?:UUID; nombreHerramienta:string; solicitud:JsonMap; respuesta:JsonMap; estado:string; duracionMs:number; mensajeError?:string; creadoEn:string }
export interface ChatResponse { idConversacion:UUID; idCorrelacion:UUID; mensajeUsuario:Mensaje; mensajeAsistente:Mensaje; herramientas:EjecucionHerramienta[] }
export interface EventoAuditoria { id:UUID; idConversacion?:UUID; idUsuarioObjeto:string; accion:string; tipoRecurso:string; idRecurso?:UUID; decision:string; motivo?:string; metadatos:JsonMap; creadoEn:string }
