import { LightningElement, wire, api, track } from 'lwc';
import communityId from '@salesforce/community/Id';
import getAssortmentProducts from '@salesforce/apex/AssortmentBuilderController.getProducts';
import addToCart from '@salesforce/apex/AssortmentBuilderController.addToCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class B2bleAssortmentBuilder extends LightningElement {
    @api recordId;
    @api propShowAtp;
    @api showAtp = false;
    @api firstColumnLabel;
    
    @track sizeColorMap;

    @api inputQty = {};

    disableAddToCart = false;

    connectedCallback() {
        if (this.propShowAtp != null && this.propShowAtp == "yes") {
            this.showAtp = true;
        }
    }

    /**
     * Gets the effective account - if any - of the user viewing the product.
     *
     * @type {string}
     */
    @api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

    /**
     * Gets the normalized effective account of the user.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;

        if (
            effectiveAccountId.length > 0 &&
            effectiveAccountId !== '000000000000000'
        ) {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    @wire(getAssortmentProducts, {
        communityId: communityId,
        productId: '$recordId',
        effectiveAccountId: '$resolvedEffectiveAccountId'
    })
    products;

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

    /**
     * we use this function to aggregate what we got from getAssortmentProducts by size and color
     * Size and color are in the fields Color__c and Size__c
     * We want colors in rows and sizes in cols
     */
    get productAssortment() {
        console.log("Creating Assortment from products");
        console.log(this.products);
        if (this.sizeColorMap == null) { 
            var sizeColorMap = {
                colors: [],
                sizes: [],
                items: []
            };
            if (this.products.data != null) {
                this.products.data.forEach(prod => {
                    var color = prod.fields.Color__c;
                    var size = prod.fields.Size__c;
                    var stock = prod.fields.Stock_Availability__c;
                    var estShipping = prod.fields.Estimated_Shipping_Date__c;
                    var stockQty = prod.fields.Stock_Quantity__c;
                    var colorAlreadyAdded = false;
                    sizeColorMap.colors.forEach(c => {
                        if (c.color == color) colorAlreadyAdded = true;
                    });
                    if (!colorAlreadyAdded) {
                        var imgUrl = (prod.fields.Image_URL__c != null) ? prod.fields.Image_URL__c : prod.defaultImage.url;
                        console.log("adding color: " + color);
                        console.log("custom URL: " + prod.fields.Image_URL__c);
                        console.log("std img URL: " + prod.defaultImage.url);
                        sizeColorMap.colors.push({
                            color: color,
                            img: imgUrl
                        });
                        //sizeColorMap.items[color] = [];
                        sizeColorMap.items.push({
                            color: color,
                            img: imgUrl,
                            sizes: []
                        });
                    }
                    
                    if (sizeColorMap.sizes.indexOf(size) < 0) sizeColorMap.sizes.push(size);
                    
                    /* 
                    * there should be only one size for each color so we don't check 
                    * if sizes are already added
                    */
                    for (var i=0; i<sizeColorMap.items.length; i++) {
                        if (sizeColorMap.items[i].color == color) {
                            var outOfStock = stock == "Out Of Stock" ? true : false;
                            var stockCSSClass = null;
                            switch (stock) {
                                case "Out Of Stock": 
                                    stockCSSClass = "outOfStock";
                                    break;
                                case "In Stock": 
                                    stockCSSClass = "inStock";
                                    break;
                                case "Limited Stock": 
                                    stockCSSClass = "limitedStock";
                                    break;
                                case "Available For Preorder": 
                                    stockCSSClass = "availableForPreorder";
                                    break;
                                default:
                                    break;
                            }
                            var randAtp = this.generateRandomATP();
                            sizeColorMap.items[i].sizes.push({
                                size: size,
                                product: prod.id,
                                stock: stock,
                                stockQty: stockQty,
                                stockCSSClass: stockCSSClass,
                                estShipping: estShipping,
                                outOfStock: outOfStock,
                                atp: randAtp,
                                showAtp: true
                            });
                            //set to zero all the input qty
                            this.inputQty[prod.id] = "0";
                        }
                    }

                   /*
                    sizeColorMap.items[color].push({
                        size: size,
                        product: prod.id,
                    });
                    */
                    
                });
            }

            //we add "not available" items if the size is missing for some products
            for (var i=0; i<sizeColorMap.items.length; i++) {
                var item = sizeColorMap.items[i];
                var itemSizes = [];
                for (var j=0; j<sizeColorMap.sizes.length; j++) {
                    var size = sizeColorMap.sizes[j];
                    var itemSize = this.itemHasSize(item, size);
                    if (itemSize != null) {
                        itemSize.isAvailable = true;
                        itemSizes.push(itemSize);
                    } else {
                        itemSizes.push({
                            size: size,
                            product: item.color + ":" + size,
                            isAvailable: false
                        });
                    }
                }
                console.log("Interpolated item sizes for " + item.color);
                console.log(itemSizes);
                sizeColorMap.items[i].sizes = itemSizes;
            }

            this.sizeColorMap = sizeColorMap;
        }

        console.log("Size Color Map");
        console.log(sizeColorMap);

        return this.sizeColorMap;
    }

    /**
     * Returns the size item if the item has the specified size
     * @param {Object} item 
     * @param {String} size 
     */
    itemHasSize = function(item, size) {
        if (item != null && item.sizes != null) {
            for (var i=0; i<item.sizes.length; i++) {
                if (item.sizes[i].size == size) return item.sizes[i];
            }
        }
        return null;
    }

    /**
     * Returns the sizeItem object given a specific product id
     * @param {*} prodId 
     * @returns {Object}
     *  size: size,
        product: prod.id,
        stock: stock,
        stockQty: stockQty,
        stockCSSClass: stockCSSClass,
        estShipping: estShipping,
        outOfStock: outOfStock
     */
    getItemById = function(prodId) {
        if (prodId != null) {
            for (var i=0; i<this.sizeColorMap.items.length; i++) {
                var sizes = this.sizeColorMap.items[i].sizes;
                for (var j=0; j<sizes.length; j++) {
                    var sizeItem = sizes[j];
                    if (sizeItem.product == prodId) return sizeItem;
                }
            }
        }
        return null;
    }

    /**
     * Random generates ATP for a specific item
     */
    generateRandomATP = function() {
        const MONTHS = ["Feb","Mar","Apr"];
        const MIN_QTY = 0;
        const MAX_QTY = 20;
        var atp = [];

        for (var i=0; i<MONTHS.length; i++) {
            var randQty = Math.floor(Math.random() * (MAX_QTY - MIN_QTY + 1) + MIN_QTY);
            var atpItem = {
                month: MONTHS[i],
                qty: randQty
            };
            atp.push(atpItem);
        }
        return atp;
    }

    /**
     * Sets the quantity matrix when an item quantity changes on the grid
     * 
     * @param {*} event 
     */
    handleItemQtyChange(event) {
        console.log("Quantity Changed");
        var prodId = event.currentTarget.dataset.id;
        this.inputQty[prodId] = event.target.value != "" ? event.target.value : "0";
        //event.target.style.backgroundColor = "#cfffab";
        
        //we get the td element to highlight
        var cellElem = this.template.querySelector("td[data-id='" + prodId + "']");
        cellElem.style.backgroundColor = "#cfffab";

        //if the item has a stock we check that the qty is not exceeding the stock
        var qty = parseInt(event.target.value);
        var item = this.getItemById(prodId);
        if (item!=null) {
            if ((item.stock == "In Stock" || item.stock == "Limited Stock")
                && item.stockQty < qty) {
                    event.target.value = item.stockQty;
                }
            if (this.showAtp) {
                item.showAtp = true;
            }
        }
        console.log(this.inputQty);
    }

    /**
     * Adds all the item from the grid to the cart
     * @param {*} event 
     */
    addAllToCart(event) {
        console.log("Adding to cart");
        console.log(this.inputQty);
        this.disableAddToCart = true;
        
        addToCart({
            communityId: communityId,
            productQtyJSON: JSON.stringify(this.inputQty),
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
        .then(() => {
            this.dispatchEvent(
                new CustomEvent('cartchanged', {
                    bubbles: true,
                    composed: true
                })
            );
            this.showToast(
                "Success",
                "Your cart have been updated",
                "success"
            );
            console.log("Successfully added to cart");
            this.disableAddToCart = false;
        })
        .catch((error) => {
            console.error("error adding items to cart");
            console.error(error);
            this.showToast(
                "Error",
                "There was a problem adding items to the cart.",
                "error"
            );
            this.disableAddToCart = false;
        });

    }

}