import { LightningElement, api } from 'lwc';

export default class OpenCommerceFromAccount extends LightningElement {
    @api label;
    @api storefrontURL;
    @api recordId;
    @api internalUser;
    @api networkId;
    commerceURLwithSwitchAccount;

    connectedCallback() {
        if (!this.internalUser) {
            this.commerceURLwithSwitchAccount = 
                this.storefrontURL + "?" + "effectiveAccountId=" + this.recordId; 
        } else {
            //var storePath = this.storefrontURL.split("/")[3];
            //var startURL = encodeURI("?" + "effectiveAccountId=" + this.recordId);
            this.commerceURLwithSwitchAccount = 
                "/servlet/networks/switch?networkId=" + this.networkId + 
                "&startURL=" + "?effectiveAccountId=" + this.recordId;
        }
        
    }
}