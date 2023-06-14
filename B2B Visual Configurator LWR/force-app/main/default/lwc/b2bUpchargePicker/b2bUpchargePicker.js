import { LightningElement,api,track } from 'lwc';
import communityId from '@salesforce/community/Id';
import getProduct from '@salesforce/apex/B2BUpchargePickerController.getProduct';
import getProductPrice from '@salesforce/apex/B2BUpchargePickerController.getProductPrice';
import getProductPrices from '@salesforce/apex/B2BUpchargePickerController.getProductPrices';
import getUpchargeOptions from '@salesforce/apex/B2BUpchargePickerController.getUpchargeOptions';
import addConfigToCart from '@salesforce/apex/B2BUpchargePickerController.addConfigToCart';
import checkExistingConfiguration from '@salesforce/apex/B2BUpchargePickerController.checkExistingConfiguration';
import removeConfigurationFromCart from '@salesforce/apex/B2BUpchargePickerController.removeConfigurationFromCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//TODO: logic to manage single selection and multiple selection
//TODO: component parameter to define if the upcharges should be saved at category or subcategory level
//TODO: diplay selection differently depending the picker type
//TODO: take into account QTY rules
//TODO: component params to show/hide fields
//TODO: Add request custom quotation button
//TODO: component config to show/hide add to cart
//TODO: component config to show/hide rfq
//TODO: check if you have already a configuration on cart and ask to remove that one or create a new cart
//TODO: Refactor upcharge list logic to use just the productDetail structure
//TODO: range picker type

export default class B2bUpchargePicker extends LightningElement {
    @api effectiveAccountId;
    @api recordId;
    @track showModal = false;
    @track showModalSpinner= false;

    product;
    _upcharges;
    _isAddToCartDisabled = false;
    _invalidQuantity = false;

    @track upcharges = [];
    originalPrice;
    @track finalPrice = {
        unitPrice: 0.0,
        currencyIsoCode: 'EUR'
    };
    @track selectedOptions = [];
    @track quantity = 1;
    @track configurationLoading = true;

    connectedCallback() {
        console.log("B2bUpchargePicker::connectedCallback()");
        this.configurationLoading = true;
        this.loadProductDetails();
    }

    loadProductDetails() {
        getProduct({
            communityId: communityId,
            productId: this.recordId,
            effectiveAccountId: this.effectiveAccountId
        }).then(result => {
            console.log("B2bUpchargePicker::getProduct::success");
            console.log(result);
            this.product = result;
            
            getProductPrice({
                communityId: communityId,
                productId: this.recordId,
                effectiveAccountId: this.effectiveAccountId
            }).then(pricedata => {
                console.log("B2bUpchargePicker::getProductPrice::success");
                console.log(pricedata);
                this.originalPrice = pricedata;
                this.finalPrice.unitPrice = parseFloat(pricedata.unitPrice);
                this.finalPrice.currencyIsoCode = pricedata.currencyIsoCode;

                getUpchargeOptions({
                    communityId: communityId,
                    productId: this.recordId,
                    effectiveAccountId: this.effectiveAccountId
                }).then(result => {
                    console.log("B2bUpchargePicker::getUpchargeOptions::success");
                    console.log(result);
                    this._upcharges = result;

                    var upchargeIds = [];
                    for (var i=0; i<this._upcharges.length; i++) {
                        upchargeIds.push(this._upcharges[i].id);
                    }

                    //getting the upcharge pricing
                    getProductPrices({
                        communityId: communityId,
                        productIds: upchargeIds,
                        effectiveAccountId: this.effectiveAccountId
                    }).then(prices => {
                        console.log("B2bUpchargePicker::getUpchargePrices::success");
                        console.log(prices);

                        for (var i=0; i<this._upcharges.length; i++) {
                            var upcharge = { ...this._upcharges[i].fields };
                            upcharge.Id = this._upcharges[i].id;
    
                            if (upcharge.Upcharge_Picker_Type__c == "Color") {
                                upcharge.isColor = true;
                                var style = "background-color: " + upcharge.Upcharge_Color_Hex_Code__c;
                                upcharge.style = style;
                            } else if (upcharge.Upcharge_Picker_Type__c == "Image") {
                                //in this case we need to render the image so we need to get that from the option product info
                                upcharge.isImage = true;
                                upcharge.productImage = this._upcharges[i].defaultImage.url;
                            } else if (upcharge.Upcharge_Picker_Type__c == "Name") {
                                //in this case we need to render the image so we need to get that from the option product info
                                upcharge.isName = true;
                            }

                            //setting the upcharge price
                            for (var j=0; j<prices.pricingLineItemResults.length; j++) {
                                var upchrargePrice = prices.pricingLineItemResults[j];
                                //the API returns a 15 char ID
                                if (upcharge.Id.substring(0,15) == upchrargePrice.productId) {
                                    upcharge.upchargeUnitPrice = upchrargePrice.unitPrice;
                                }
                            }
    
                            this.createUpchargesStructure(upcharge);
                        }
                        console.log("B2bUpchargePicker::getUpchargeOptions::Enriched Upcharges");
                        console.log(this.upcharges);
                        this.configurationLoading = false;
                    })
                    .catch(error => {
                        console.error("B2bUpchargePicker::getUpchargePrices::error");
                        console.error(error);
                    });
                }).catch(error => {
                    console.error("B2bUpchargePicker::getUpchargeOptions::error");
                    console.error(error);
                })
            }).catch(error => {
                console.error("B2bUpchargePicker::getProductPrice::error");
                console.error(error);
            })
        })
        .catch(error => {
            console.error("B2bUpchargePicker::getProduct::error");
            console.error(error);
        }) 
    }
    
    createUpchargesStructure(upcharge) {
        //first check category
        var upchargeCategoryItem = this.getCategory(upcharge);
        if (upchargeCategoryItem == null) {
            //we should create the category item
            upchargeCategoryItem = {
                category: upcharge.Upcharge_Category__c,
                subcategories: []
            };

            this.upcharges.push(upchargeCategoryItem);
            //once added we return the category getting it from the array
            upchargeCategoryItem = this.getCategory(upcharge);
        }

        //then check subcategory
        var upchargeSubCategoryItem = this.getSubcategory(upchargeCategoryItem,upcharge);
        if (upchargeSubCategoryItem == null) {
            //we should create the subcategory item
            upchargeSubCategoryItem = {
                subcategory: upcharge.Upcharge_Subcategory__c,
                upcharges: []
            };

            upchargeCategoryItem.subcategories.push(upchargeSubCategoryItem);

            //finally we add the upcharge
            upchargeSubCategoryItem = this.getSubcategory(upchargeCategoryItem, upcharge)
        }

        upchargeSubCategoryItem.upcharges.push(upcharge);

        console.log("Final Upcharges");
        console.log(this.upcharges);
    }

    getCategory(upcharge) {
        var curCategory = upcharge.Upcharge_Category__c;
        for (var i=0; i<this.upcharges.length; i++) {
            if (curCategory == this.upcharges[i].category) {
                return this.upcharges[i];
            }
        }
        return null;
    }

    getSubcategory(upchargeCategoryItem, upcharge) {
        var curSubCategory = upcharge.Upcharge_Subcategory__c;
        for (var i=0; i<upchargeCategoryItem.subcategories.length; i++) {
            if (upchargeCategoryItem.subcategories[i].subcategory == curSubCategory) {
                return upchargeCategoryItem.subcategories[i];
            }
        }
        return null;
    }

    getUpchargeOptionById(id) {
        for (var i=0; i<this.upcharges.length; i++) {
            var cat = this.upcharges[i];
            for (var j=0; j<cat.subcategories.length; j++) {
                var subcat = cat.subcategories[j];
                for (var k=0; k<subcat.upcharges.length; k++) {
                    var upcharge = subcat.upcharges[k];
                    if (upcharge.Id == id) {
                        return upcharge;
                    }
                }
            }
        }
    }

    setUpchargeOption(upcharge) {
        //firse see if we already have an option set
        for (var i=0; i<this.selectedOptions.length; i++) {
            var option = this.selectedOptions[i];
            if (option.category == upcharge.Upcharge_Category__c) {
                //update the option
                option.upcharge = upcharge;
                this.recalculateFinalPrice();
                return;
            }
        }
        //if we reach here this means we need to create the option for the category
        var option = {
            category: upcharge.Upcharge_Category__c,
            upcharge: upcharge
        }
        this.selectedOptions.push(option);
        this.recalculateFinalPrice();
    }

    removeUpchargeOption(upcharge) {
        for (var i=0; i<this.selectedOptions.length; i++) {
            if (upcharge.Id == this.selectedOptions[i].upcharge.Id) {
                this.selectedOptions.splice(i,1);
            }
        }
        this.recalculateFinalPrice();
    }

    recalculateFinalPrice() {
        var finalPrice = parseFloat(this.originalPrice.unitPrice);
        console.log("Initial Price: " + finalPrice);
        for (var i=0; i<this.selectedOptions.length; i++) {
            finalPrice += parseFloat(this.selectedOptions[i].upcharge.upchargeUnitPrice);
        }
        console.log("Final Price: " + finalPrice);
        this.finalPrice.unitPrice = finalPrice;
    }

    handleOptionSelected(event) {
        console.log("selected option");
        console.log(event.currentTarget.dataset.id);
        var upcharge = this.getUpchargeOptionById(event.currentTarget.dataset.id);
        console.log(upcharge);

        //refresh the UI
        var parentCategoryElem = this.template.querySelectorAll("[data-id='" + upcharge.Upcharge_Category__c + "']")[0];
        //var parentCategoryElem = event.currentTarget.parentElement.parentElement.parentElement.parentElement;
        var optionElems = parentCategoryElem.querySelectorAll("div.item-container");
        for (var i=0; i<optionElems.length; i++) {
            optionElems[i].style["background-color"] = "#FFFFFF";
        }

        if (this.optionIsSelected(upcharge) == null) {
            //we add the upcharge
            event.currentTarget.style["background-color"] = "lightgreen";
            this.setUpchargeOption(upcharge);
        } else {
            //we remove the upcharge
            this.removeUpchargeOption(upcharge)
        }

    }

    /**
     * Check if an upcharge is already selected
     * If true it returns the upcharge, otherwise null
     * @param {*} upcharge 
     * @returns 
     */
    optionIsSelected(upcharge) {
        for (var i=0; i<this.selectedOptions.length; i++) {
            if (upcharge.Id == this.selectedOptions[i].upcharge.Id) {
                return upcharge;
            }
        }
        return null;
    }

    handleQuantityChange(event) {
        if (event.target.validity.valid && event.target.value) {
            this._invalidQuantity = false;
            this.quantity = event.target.value;
        } else {
            this._invalidQuantity = true;
        }
    }

    notifyAddToCart() {
        console.log("Add to cart");
        console.log(this.selectedOptions);

        //preparing the options to be sent to the server
        var options = [];
        for (var i=0; i<this.selectedOptions.length; i++) {
            options.push(this.selectedOptions[i].upcharge.Id);
        }

        //first we need to check if the same configuration is already added to the cart
        checkExistingConfiguration({
            communityId: communityId,
            effectiveAccountId: this.effectiveAccountId,
            productId: this.recordId
        }).then(checkResult => {
            if (checkResult) {
                //we should ask to override
                this.showModal = true;
            } else {
                //we can add the product to the cart
                addConfigToCart({
                    communityId: communityId,
                    effectiveAccountId: this.effectiveAccountId,
                    parentProductId: this.recordId,
                    productOptions: options,
                    quantity: this.quantity
                }).then(result => {
                    console.log("Add to cart: success");
                    this.dispatchEvent(
                        new CustomEvent('cartchanged', {
                            bubbles: true,
                            composed: true
                        })
                    );
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Your cart has been updated.',
                            variant: 'success',
                            mode: 'dismissable'
                        })
                    );
                })
                .catch(error => {
                    console.error("Error in Add Config to the cart");
                    console.error(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message:
                                '{0} could not be added to your cart at this time. Please try again later.',
                            messageData: [this.displayableProduct.name],
                            variant: 'error',
                            mode: 'dismissable'
                        })
                    );
                })
            }
        }).catch(error => {
            console.error("ERROR::checkExistingConfiguration");
            console.error(error);
        });

    }

    closeModal() {
        this.showModal = false;
        this.showModalSpinner = false;
    }

    overrideCartConfiguration() {
        this.showModalSpinner = true;
        //first remove the configuration from the cart
        removeConfigurationFromCart({
            communityId: communityId,
            effectiveAccountId: this.effectiveAccountId,
            productId: this.recordId
        }).then(result => {
            var options = [];
            for (var i=0; i<this.selectedOptions.length; i++) {
                options.push(this.selectedOptions[i].upcharge.Id);
            }

            //we can add the product to the cart
            addConfigToCart({
                communityId: communityId,
                effectiveAccountId: this.effectiveAccountId,
                parentProductId: this.recordId,
                productOptions: options,
                quantity: this.quantity
            }).then(result => {
                console.log("Add to cart: success");
                this.dispatchEvent(
                    new CustomEvent('cartchanged', {
                        bubbles: true,
                        composed: true
                    })
                );
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Your cart has been updated.',
                        variant: 'success',
                        mode: 'dismissable'
                    })
                );
                this.closeModal();

            })
            .catch(error => {
                console.error("Error in Add Config to the cart");
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message:
                            '{0} could not be added to your cart at this time. Please try again later.',
                        messageData: [this.displayableProduct.name],
                        variant: 'error',
                        mode: 'dismissable'
                    })
                );
            })
        }).catch(error => {
            console.error("ERROR:removeConfigurationFromCart");
            console.error(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        '{0} could not be added to your cart at this time. Please try again later.',
                    messageData: [this.displayableProduct.name],
                    variant: 'error',
                    mode: 'dismissable'
                })
            );
        });
    }

    notifyCreateAndAddToList() {}

}