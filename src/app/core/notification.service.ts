import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal(''); readonly kind = signal<'success'|'error'>('success'); private timer?: ReturnType<typeof setTimeout>;
  success(message:string):void{this.show(message,'success')} error(error:unknown):void{const r=error as {error?:{message?:string};message?:string};this.show(r?.error?.message??r?.message??'No fue posible completar la operación','error')}
  clear():void{this.message.set('');if(this.timer)clearTimeout(this.timer)} private show(message:string,kind:'success'|'error'):void{this.message.set(message);this.kind.set(kind);if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>this.clear(),5000)}
}
