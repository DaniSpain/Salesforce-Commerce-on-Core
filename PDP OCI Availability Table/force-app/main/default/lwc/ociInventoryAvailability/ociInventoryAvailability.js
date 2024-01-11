import { LightningElement, api, track } from 'lwc';

import communityId from '@salesforce/community/Id';
import getInventoryAvailability from '@salesforce/apex/OciInventoryAvailabilityController.getInventoryAvailability';
import getLocationnames from '@salesforce/apex/OciInventoryAvailabilityController.getLocationNames';

export default class OciInventoryAvailability extends LightningElement {
    @api locationGroupId;
    @api productId;

    @track locations;
    locationNamesMap;

    connectedCallback() {
        console.log("OciInventoryAvailability::connectedCallback");
        console.log("locationGroupId: " + this.locationGroupId);
        console.log("productId: " + this.productId);
        this.getInventory();
    }

    getInventory() {
        getInventoryAvailability({
            locationGroupId: this.locationGroupId,
            productId: this.productId
        }).then(result => {
            console.log("OciInventoryAvailability::getInventoryAvailability::SUCCESS");
            console.log(result);
            if (result) {
                this.locations = result.locations;
                var locReferences = [];
                for (var i=0; i<this.locations.length; i++) {
                    locReferences.push(this.locations[i].locationIdentifier);
                }
                getLocationnames({
                    locReferences: locReferences
                }).then(data => {
                    console.log("OciInventoryAvailability::getLocationnames::SUCCESS");
                    console.log(data);
                    this.locationNamesMap = data;
                    for (var key in data) {
                        var value = data[key];
                        var loc = this.getLocationByReference(key);
                        loc.locationName = value;
                        loc.showFuture = false;
                        loc.toggleFuture = function() {
                            //todo inserire funzione che mostra le date future al click sull'icona
                        }
                    }
                    console.log(this.locations);
                }).catch(error => {
                    console.error("OciInventoryAvailability::getLocationnames::ERROR");
                    console.error(error);
                })
            }
        }).catch(error => {
            console.error("OciInventoryAvailability::getInventoryAvailability::ERROR");
            console.error(error);
        })
    }

    getLocationByReference(refId) {
        for (var i=0; i<this.locations.length; i++) {
            var loc = this.locations[i];
            if (loc.locationIdentifier == refId) {
                return this.locations[i];
            }
        }
    }
   

}