import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ClockApp';
  stack = 0;
  baudRate = Uint32Array.from([57600]);
  filters = [];
  connected = false;
  dupa;
  buffer = "RAMKI\n";
  emit = new EventEmitter();
  click() {
    if(this.connected)
      return;
    
    this.emit.subscribe(result=>{
      this.buffer+=result;
    });
    var device;
    var dupa = window.navigator['usb'];
    dupa.requestDevice({ filters: this.filters })
      .then(usbDevice => {
        device = usbDevice;
        console.log("Product name: " + usbDevice.productName);
        this.connected = true;
        return device.open()
      })
      .then(() => device.selectConfiguration(1))
      .then(() => device.claimInterface(0))
      .then(async () => await device.controlTransferOut({
        requestType: 'vendor',
        recipient: 'interface',
        request: 0x1E,
        value: 0,
        index: 0
      }, this.baudRate))
      .then(result =>{
        console.log("Bytes written:" + result.bytesWritten + result.status)
      })
      // .then(async () => await device.controlTransferIn({
      //   requestType: 'vendor',
      //   recipient: 'interface',
      //   request: 0x1E,
      //   value: 0,
      //   index: 0
      // }, dupa))
      // .then(result => {
      //   let decoder = new TextDecoder();
      //   let res = decoder.decode(result.data)
      //   console.log(res)
      // })
      .then(()=>{
        this.claim(device, this.emit);
      })
      .catch(error => { console.log(error); });

  }

  private claim(device, emit) {
    var repeat = function (device, msgBuffer) {
      device.transferIn(1, 50)
        .then(result => {
          let decoder = new TextDecoder();
          let byte = decoder.decode(result.data)
          msgBuffer += byte;
          // if(byte == '\n'){
          //   console.log(msgBuffer);
          //   emit.emit(msgBuffer); 
          //   msgBuffer = "";  
          // }
          emit.emit(byte);
        })
        .then(function () { 
          repeat(device, msgBuffer);
        });
    }

    repeat(device, "")
  };
}
