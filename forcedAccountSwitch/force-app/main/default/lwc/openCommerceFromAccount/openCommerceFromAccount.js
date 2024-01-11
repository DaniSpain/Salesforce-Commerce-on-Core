import { LightningElement, api } from 'lwc';

export default class OpenCommerceFromAccount extends LightningElement {
    @api label;
    @api storefrontURL;
    @api accountId;
    commerceURLwithSwitchAccount;

    connectedCallback() {
        this.commerceURLwithSwitchAccount = 
            this.storefrontURL + "?" + "effectiveAccountId=" + this.accountId; 
    }
}