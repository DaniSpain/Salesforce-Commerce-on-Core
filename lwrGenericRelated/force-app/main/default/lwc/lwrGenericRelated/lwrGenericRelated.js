import { LightningElement, api, wire, track } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import communityId from '@salesforce/community/Id';
import { getAppContext, getSessionContext } from "commerce/contextApi";

import getParentRecord from '@salesforce/apex/LwrGenericRelatedController.getParent';
import getChildrenRecord from '@salesforce/apex/LwrGenericRelatedController.getChildren';
import getCommerceProducts from '@salesforce/apex/LwrGenericRelatedController.getCommerceProducts';
import { addItemToCart } from 'commerce/cartApi';
import getCommerceProduct from '@salesforce/apex/LwrGenericRelatedController.getProduct';

const ADD_PRODUCT_TO_CART_EVT = 'addproducttocart';
const CART_CHANGED_EVT = 'cartchanged';

export default class LwrGenericRelated extends NavigationMixin(LightningElement) {
    @api recordId;
    @api parentObjectAPIName;
    @api junctionObjectAPIName;
    @api junctionObjectToParentRelationship;
    @api junctionObjectToChildRelationship;
    @api childObjectAPIName;
    @api headerText;
    @api tileMappingTitle;
    @api showImage;
    @api tileMappingImage;
    @api takeImageFromMedia;
    @api tileMappingSubtitle;
    @api displayAs;
    @api columns;
    @api childDetailPageBaseURL;
    @api whereConditions;
    @api additionalChildObjectFields
    @api additionalRelationshipObjectFields;
    @api additionalChildObjectFieldsLabels;
    @api additionalRelationshipObjectFieldsLabels;
    @api showAddToCart;

    //NOT USED ANYMORE
    @api additionalFields;

    @track childMappedData = [];
    //@track columnClass = "child-tile col-3";
    @track columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12";

    childFields = [];
    additionalChildFields = [];
    relationshipFields = [];

    additionalChildFieldLabels = [];
    relationshipFieldLabels = [];

    displayAsGrid = true;

    prodQtys = {};
    effectiveAccountId;

    //toast variables
    displayToast = false;
    toastClass;
    toastIconName;
    toastTitle;
    toastMessage;

    closeToast() {
        this.displayToast = false;
    }

    showToast(title, message, variant) {
        this.toastTitle = title;
        this.toastMessage = message;
        this.toastClass = "toast toast-" + variant;
        this.toastIconName = variant == "success" ? "utility:success" : "utility:error";
        this.displayToast = true;
    }

    connectedCallback() {
        console.log("LwrGenericRelated::connected callback");

        if (this.displayAs == "List") this.displayAsGrid = false;

        this.childFields.push(this.tileMappingTitle);
        if (!this.takeImageFromMedia) {
            this.childFields.push(this.tileMappingImage);
        }
        if (this.tileMappingSubtitle) {
            this.childFields.push(this.tileMappingSubtitle);
        }
        if (this.additionalChildObjectFields) {
            this.additionalChildFields = this.additionalChildObjectFields.split(",");
            for (var i=0; i<this.additionalChildFields.length; i++) {
                this.childFields.push(this.additionalChildFields[i]);
            }
        }
        console.log("LwrGenericRelated::connectedCallback::childFields");
        console.log(this.childFields);

        if (this.additionalRelationshipObjectFields) {
            this.relationshipFields = this.additionalRelationshipObjectFields.split(",");
        }
        console.log("LwrGenericRelated::connectedCallback::relationshipFields");
        console.log(this.relationshipFields);

        if (this.additionalChildObjectFieldsLabels) {
            this.additionalChildFieldLabels = this.additionalChildObjectFieldsLabels.split(",");
        }
        console.log("LwrGenericRelated::connectedCallback::additionalChildFieldLabels");
        console.log(this.additionalChildFieldLabels);

        if (this.additionalRelationshipObjectFieldsLabels) {
            this.relationshipFieldLabels = this.additionalRelationshipObjectFieldsLabels.split(",");
        }
        console.log("LwrGenericRelated::connectedCallback::relationshipFieldLabels");
        console.log(this.relationshipFieldLabels);

        //we check that the add to cart is set to true only for Product2 object
        if (this.showAddToCart && this.childObjectAPIName == 'Product2') {
            this.showAddToCart = true;
        } else {
            this.showAddToCart = false;
        }
        
        this.initColumns();
    }

    @wire(getChildrenRecord, {
        parentId: '$recordId',
        junctionObjectApiName: '$junctionObjectAPIName',
        junctionToParentRelationshipApiName: '$junctionObjectToParentRelationship',
        junctionToChildRelationshipApiName: '$junctionObjectToChildRelationship',
        fields: '$childFields',
        relationshipFields: '$relationshipFields',
        whereConditions: '$whereConditions',
    })wiredData({error, data}) {
        console.log("wired children records");
        console.log(data);
        this.childMappedData = [];

        Promise.all([ getSessionContext()]).then((sessionContext) => {
            console.log("session context");
            console.log(sessionContext);
            console.log("setting effective account from API: " + sessionContext[0].effectiveAccountId);
            this.effectiveAccountId = sessionContext[0].effectiveAccountId ? sessionContext[0].effectiveAccountId : null;
            
            if (data && data.length > 0 && this.childMappedData.length == 0) {
                console.log("LwrGenericRelated::getChildrenRecord::got data");
                console.log(data);
                this.mapFieldData(data);
            } else if (data && data.length == 0) {
                //checks if the current item is a product
                if (this.parentObjectAPIName == "Product2") {
                    //checks if the product is a variation
                    getCommerceProduct({
                        communityId: communityId,
                        productId: this.recordId,
                        effectiveAccountId: this.effectiveAccountId
                    }).then(data => {
                        console.log("LwrGenericRelated::getCommerceProduct::Got Commerce Parent Product");
                        console.log(data);
                        if (data.variationParentId && data.variationParentId != null) {
                            //override the parent record id
                            this.recordId = data.variationParentId;
                            getChildrenRecord({
                                parentId: this.recordId,
                                junctionObjectApiName: this.junctionObjectAPIName,
                                junctionToParentRelationshipApiName: this.junctionObjectToParentRelationship,
                                junctionToChildRelationshipApiName: this.junctionObjectToChildRelationship,
                                fields: this.childFields,
                                relationshipFields: this.relationshipFields,
                                whereConditions: this.whereConditions
                            }).then(data => {
                                console.log("LwrGenericRelated::VARIANT::getChildrenRecord");
                                console.log(data);
                                if (data && data.length > 0) {
                                    this.mapFieldData(data);
                                }
                            });
                        }
                    })
                    .catch(error => {
                        console.error("LwrGenericRelated::getCommerceProduct::error");
                        console.error(error);
                    })
                }
            }
        });

        if (error) {
            console.error("LwrGenericRelated::getChildrenRecord::error");
            console.error(error);
        }
    }
    
    initColumns() {
        switch (this.columns) {
            case 1:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_12-of-12";
                break;
            case 2:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_6-of-12";
                break;
            case 3:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12";
                break;
            case 4:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12";
                break;
            case 5:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_2-of-12";
                break;
            case 6:
                this.columnClass = "slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_2-of-12";
                break;
        }
    }

    /**
     * Data example
     * [
        {
            "Recommended_Product__r": {
                "Id": "01t6800000106L9AAI",
                "Name": "Flow Glass | Terra"
            },
            "Id": "aB368000000bnFNCAY",
            "Recommended_Product_Parent__c": "01t6800000106L6AAI",
            "Recommended_Product__c": "01t6800000106L9AAI"
        },
        {
            "Recommended_Product__r": {
                "Id": "01t6800000106LAAAY",
                "Name": "Flow Glass | Soffitto"
            },
            "Id": "aB368000000bnFSCAY",
            "Recommended_Product_Parent__c": "01t6800000106L6AAI",
            "Recommended_Product__c": "01t6800000106LAAAY"
        }
        ]
     * @param {List} data 
     */
    mapFieldData(data) {
        var childIds = [];
        for (var i=0; i<data.length; i++) {
            var dataItem = data[i];
            var mappedDataItem = {
                Id: null,
                Title: null,
                Image: null,
                Subtitle: null,
                Url: null,
                AddChildFields: [],
                AddRelFields: []
            };
            mappedDataItem.Id = dataItem[this.junctionObjectToChildRelationship].Id;
            console.log("LwrGenericRelated::mapFieldData::Mapping title => " + this.junctionObjectToChildRelationship + "." + this.tileMappingTitle);
            mappedDataItem.Title = dataItem[this.junctionObjectToChildRelationship][this.tileMappingTitle];
            mappedDataItem.Url = basePath + "/" + this.childDetailPageBaseURL + "/" + mappedDataItem.Id;
            mappedDataItem.Image = dataItem[this.junctionObjectToChildRelationship][this.tileMappingImage];
            mappedDataItem.Subtitle = dataItem[this.junctionObjectToChildRelationship][this.tileMappingSubtitle];
            
            if (this.additionalChildFields && this.additionalChildFields.length > 0) {
                for (var j=0; j<this.additionalChildFields.length; j++) {
                    var item = {
                        Label: this.additionalChildFieldLabels[j],
                        Value: dataItem[this.junctionObjectToChildRelationship][this.additionalChildFields[j]]
                    }
                    mappedDataItem.AddChildFields.push(item);
                }
            }

            if (this.relationshipFields && this.relationshipFields.length > 0) {
                for (var j=0; j<this.relationshipFields.length; j++) {
                    var item = {
                        Label: this.relationshipFieldLabels[j],
                        Value: dataItem[this.relationshipFields[j]]
                    }
                    mappedDataItem.AddRelFields.push(item);
                }
            }

            console.log("LwrGenericRelated::mapFieldData::Mapped Data Item");
            console.log(mappedDataItem);
            childIds.push(mappedDataItem.Id);
            this.childMappedData.push(mappedDataItem);
        }

        console.log("LwrGenericRelated::mapFieldData::Mapped Data");
        console.log(this.childMappedData);

        //we control if the child object is a Product2 and, if yes, we get the info from Commerce APIs
        if (this.takeImageFromMedia) {
            getCommerceProducts({
                communityId: communityId,
                productIds: childIds,
                effectiveAccountId: this.effectiveAccountId
            }).then(data => {
                console.log("LwrGenericRelated::mapFieldData::getCommerceProducts::Got Commerce Products");
                console.log(data);

                //now we decorate the mapped fields with the image
                for (var i=0; i<data.length; i++) {
                    this.childMappedData[i].Image = data[i].defaultImage.url;
                }

                console.log("LwrGenericRelated::mapFieldData::Mapped Data with product image");
                console.log(this.childMappedData);
            })
            .catch(error => {
                console.error("LwrGenericRelated::mapFieldData::getCommerceProducts::error");
                console.error(error);
            })
        }
    }

    handleItemQtyChange(event) {
        console.log("Quantity Changed");
        var prodId = event.currentTarget.dataset.id;
        console.log("Product ID: " + prodId);
        var qty = event.target.value != "" ? event.target.value : "0";
        console.log("Qty: " + qty);

        this.prodQtys[prodId] = qty;
    }

    addToCart(event) {
        console.log("Add to cart");
        var prodId = event.currentTarget.dataset.id;
        console.log("Product ID: " + prodId);
        var qty = this.prodQtys[prodId];
        
        addItemToCart(prodId, qty)
            .then(() => {
                console.log("Successfully added to the cart");
                this.showToast(
                    "Success",
                    "Your cart have been updated",
                    "success"
                )
            })
            .catch(error => {
                console.error("error adding to the cart");
                console.error(error);
            });
    }

    /*
    navigateToChild(evt) {
        //TODO: parte del base path deve cambiare in base al tipo di oggetto correlato
        var childId = evt.currentTarget.dataset.id;
        console.log("Navigate to product " + childId);
        evt.preventDefault();

        var childUrl = basePath + "/product/" + childId;
        this.pageReference = {
            type: STANDARD_WEBPAGE,
            attributes: {
                url: childUrl
            },
        };
    }
    */
}