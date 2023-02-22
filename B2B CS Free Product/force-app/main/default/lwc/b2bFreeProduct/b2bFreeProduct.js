import { LightningElement, api, wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';

import COMMERCE_CART_CHANGED from '@salesforce/messageChannel/lightning__commerce_cartChanged';

import UserId from '@salesforce/user/Id';

import getCartItems from '@salesforce/apex/B2BFreeProductController.getCartItems';
import setFree from '@salesforce/apex/B2BFreeProductController.setFree';
import isLoggedOnBehalf from '@salesforce/apex/B2BFreeProductController.isLoggedOnBehalf';
import getCurrentSession from '@salesforce/apex/B2BFreeProductController.getCurrentSession';

//TODO: visualizzare solo se utente sottostante è un CS
//TODO: aggiungere uno spinner

export default class B2bFreeProduct extends LightningElement {
    @api effectiveAccountId;
    @api cartId;
    @api allowedProfileIDs;

    isLoginOnBehalf;
    showSpinner = true;
    cartItems;

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
        this.init();
    }

    disconnectedCallback() {
        releaseMessageContext(this.messageContext);
    }

    init() {
        this.showSpinner = true;
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
        }).catch(error => {
            console.error("B2bFreeProduct::connectedCallback::setFree::ERROR");
            console.error(error);
        });
    }

    getCartItemById(cartItemId) {
        for (var i=0; i<this.cartItems.length; i++) {
            cartItem = this.cartItems[0];
            if (cartItem.Id == cartItemId) return cartItem;
        }
        return null;
    }

}