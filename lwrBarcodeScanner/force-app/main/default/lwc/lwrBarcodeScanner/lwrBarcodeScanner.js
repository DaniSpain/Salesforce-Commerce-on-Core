import { LightningElement, track, api } from "lwc";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import { NavigationMixin } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import addToCart from '@salesforce/apex/CommerceBarcodeScannerController.addToCart';

export default class LwrBarcodeScanner extends NavigationMixin(LightningElement) {
  barcodeScanner;
  @track scannedBarcodes;
  @api productField;
  @api objectAPIName;

  @track showAddToCart = false;
  @track showOpenAsset = false;

  connectedCallback() {
    this.barcodeScanner = getBarcodeScanner();
    if (this.objectAPIName == "Product2") this.showAddToCart = true;
    if (this.objectAPIName == "Asset") this.showOpenAsset = true;
  }

  beginScanning() {
    // Set your configuration options, including bulk and multi-scanning if desired, in this scanningOptions object
    const scanningOptions = {
      barcodeTypes: [this.barcodeScanner.barcodeTypes.QR,this.barcodeScanner.barcodeTypes.EAN_13],
      scannerSize: "FULLSCREEN",
      cameraFacing: "BACK",
      showSuccessCheckMark: true,
      enableBulkScan: true,
      enableMultiScan: true,
    };

    // Make sure BarcodeScanner is available before trying to use it
    if (this.barcodeScanner != null && this.barcodeScanner.isAvailable()) {
      // Reset scannedBarcodes before starting new scanning session
      this.scannedBarcodes = [];

      // Start scanning barcodes
      this.barcodeScanner
        .scan(scanningOptions)
        .then((results) => {
          this.processScannedBarcodes(results);
        })
        .catch((error) => {
          this.processError(error);
        })
        .finally(() => {
          this.barcodeScanner.dismiss();
        });
    } else {
      console.log("BarcodeScanner unavailable. Non-mobile device?");
    }
  }

  processScannedBarcodes(barcodes) {
    // Do something with the barcode scan value:
    // - look up a record
    // - create or update a record
    // - parse data and put values into a form
    // - and so on; this is YOUR code
    console.log(JSON.stringify(barcodes));
    this.scannedBarcodes = this.scannedBarcodes.concat(barcodes);
  }

  processError(error) {
    // Check to see if user ended scanning
    if (error.code == "USER_DISMISSED") {
      console.log("User terminated scanning session.");
    } else {
      console.error(error);
    }
  }

  get scannedBarcodesAsString() {
    return this.scannedBarcodes.map((barcode) => barcode.value).join("\n");
  }

  addToCart() {
    addToCart({
      communityId: communityId,
      productFieldAPIName: this.productField,
      barcodes: this.scannedBarcodes
    }).then(result => {
      alert("Successfully added to cart");
    }).catch(error => {
      alert("error adding to cart: " + JSON.stringify(error));
    })
  }

  goToRecord(evt) {
    alert("Navingating to record");
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          objectApiName: "Asset",
          recordId: '02i07000000s2JHAAY',
          actionName: 'view',
      },
    });
  }
    
}