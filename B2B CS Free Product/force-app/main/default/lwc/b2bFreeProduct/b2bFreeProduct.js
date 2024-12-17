import { LightningElement, api, wire, track } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';

import COMMERCE_CART_CHANGED from '@salesforce/messageChannel/lightning__commerce_cartChanged';

import UserId from '@salesforce/user/Id';
import communityId from '@salesforce/community/Id';

import { CartSummaryAdapter, refreshCartSummary } from 'commerce/cartApi';

import getCartItems from '@salesforce/apex/B2BFreeProductController.getCartItems';
import setFree from '@salesforce/apex/B2BFreeProductController.setFree';
import applyPercentageDiscount from '@salesforce/apex/B2BFreeProductController.applyPercentageDiscount';
import applyDiscount from '@salesforce/apex/B2BFreeProductController.applyDiscount';
import isLoggedOnBehalf from '@salesforce/apex/B2BFreeProductController.isLoggedOnBehalf';
import getCurrentSession from '@salesforce/apex/B2BFreeProductController.getCurrentSession';

//TODO: aggiungere uno spinner

export default class B2bFreeProduct extends LightningElement {
    @api effectiveAccountId;
    @api cartId;
    @api allowedProfileIDs;

    isLoginOnBehalf;
    showSpinner = true;
    cartItems;
    @track currencyIsoCode = "EUR";
    @track cartSummary;
    
    showModal = false;
    showModalSpinner = false;
    curCartItemId;
    @track discountAmount;
    discountTypes = [
        { label: 'Percent', value: 'percent' },
        { label: 'Amount', value: 'amount' }
    ];
    @track discountType = 'percent';

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        console.log("B2bFreeProduct::connectedCallback");
        console.log("Current User Id: " + UserId);
        this.subscription = subscribe(
            this.messageContext,
            COMMERCE_CART_CHANGED,
            (message) => this.getItems()
        );
        //this.init();
    }

    @wire(CartSummaryAdapter)
    cartSummaryHandler(response) {
        if (response.data) {
            console.log("B2bFreeProduct::Got data from cart adapter");
            console.log(response.data);
            this.cartSummary = response.data;
            this.cartId = response.data.cartId;
            this.effectiveAccountId = response.data.accountId;
            this.currencyIsoCode = response.data.currencyIsoCode;
            this.init();
        } else if (response.error) {
            console.error("B2bFreeProduct::Error getting data from cart adapter");
            console.error(response.error);
        }
    }

    disconnectedCallback() {
        releaseMessageContext(this.messageContext);
    }

    init() {
        this.showSpinner = true;
        /*
        * Commentato per ora per test fatto con utenza partner community
        *
        getCurrentSession({})
        .then(sessionInfo => {
            console.log("B2bFreeProduct::init::getLoggedAsDetails::SUCCESS");
            console.log(sessionInfo);
            if (sessionInfo.LoginType == "Chatter Communities External User") this.isLoginOnBehalf = false;
            else this.isLoginOnBehalf = true;
            this.getItems();
        }).catch(error => {
            console.error("B2bFreeProduct::init::getLoggedAsDetails::ERROR");
            console.error(error);
        })
        */
        this.isLoginOnBehalf = true;
        this.getItems();
    }

    getItems() {
        this.showSpinner = true;
        getCartItems({
            cartId: this.cartId
        }).then(result => {
            console.log("B2bFreeProduct::connectedCallback::getCartItems::SUCCESS");
            console.log(result);
            this.cartItems = result;
            this.showSpinner = false;
        }).catch(error => {
            console.error("B2bFreeProduct::connectedCallback::getCartItems::ERROR");
            console.error(error);
        })
    }

    setFreeItem(event) {
        this.showSpinner = true;
        console.log("Cart Item ID: " + event.currentTarget.dataset.id);
        var curCartItemId = event.currentTarget.dataset.id;
        //var ci = this.cartItems[0];
        setFree({
            cartItemId: curCartItemId
        }).then(result => {
            console.log("B2bFreeProduct::connectedCallback::setFree::SUCCESS");
            publish(this.messageContext, COMMERCE_CART_CHANGED);
            this.showSpinner = false;
            refreshCartSummary();
        }).catch(error => {
            console.error("B2bFreeProduct::connectedCallback::setFree::ERROR");
            console.error(error);
        });
    }

    openApplyDiscountModal(event) {
        console.log("Cart Item ID: " + event.currentTarget.dataset.id);
        this.curCartItemId = event.currentTarget.dataset.id;
        this.showModal = true;
    }

    //TODO: provare a gestire il caso di sconto su totale carrello
    invokeApplyDiscount() {
        console.log("B2bFreeProduct::applyDiscount::appying discount = " + this.discountAmount + " to cartItemId = " + this.curCartItemId);
        applyDiscount({
            cartItemId: this.curCartItemId,
            discount: this.discountAmount,
            discountType: this.discountType,
            currencyIsoCode: this.currencyIsoCode
        }).then(result => {
            console.log("B2bFreeProduct::applyDiscount::SUCCESS");
            publish(this.messageContext, COMMERCE_CART_CHANGED);
            refreshCartSummary();
            this.showModalSpinner = false;
            this.showModal = false;
        }).catch(error => {
            console.error("B2bFreeProduct::applyDiscount::ERROR");
            console.error(error);
            this.showModalSpinner = false;
            this.showModal = false;
        });
    }

    closeModal() {
        this.showModal = false;
    }

    handleInputChange(event) {
        this.discountAmount = event.detail.value;
    }

    handleDiscountTypeChange(event) {
        console.log("Discount Type Changed");
        console.log(event.detail.value);
        this.discountType = event.detail.value;
    }

    getCartItemById(cartItemId) {
        for (var i=0; i<this.cartItems.length; i++) {
            cartItem = this.cartItems[0];
            if (cartItem.Id == cartItemId) return cartItem;
        }
        return null;
    }

}