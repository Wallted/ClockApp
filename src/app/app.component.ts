import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ClockApp';

  baudRate = Uint32Array.from([56700]);
  filters = [];
  connected = false;

  click() {
    if(this.connected)
      return;
    
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
      .then(()=>{
        this.claim(device);
      })
      .catch(error => { console.log(error); });

  }

  private claim(device) {
    var repeat = function (device, msgBuffer) {
      device.transferIn(1, 1)
        .then(result => {
          let decoder = new TextDecoder();
          let byte = decoder.decode(result.data)
          msgBuffer += byte;
          if(byte == '\n'){
            console.log(msgBuffer);
            msgBuffer = "";  
          }
        })
        .then(function () {
          repeat(device, msgBuffer);
        });
    }

    repeat(device, "")
  };
}
