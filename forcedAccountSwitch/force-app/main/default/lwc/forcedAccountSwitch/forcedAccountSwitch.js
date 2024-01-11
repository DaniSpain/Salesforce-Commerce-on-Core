import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getAppContext, getSessionContext } from "commerce/contextApi";
import { getRecord } from "lightning/uiRecordApi";
import { refreshApex } from '@salesforce/apex';

const FIELDS = ["Account.Name"];

export default class ForcedAccountSwitch extends LightningElement {
    
    @api label;
    @track newEffectiveAccountId;
    oldEffectiveAccountId;
    
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        console.log("ForcedAccountSwitch::getStateParameters::start");
        if (currentPageReference) {
            Promise.all([ getSessionContext()]).then((sessionContext) => {
                console.log("session context");
                console.log(sessionContext);
                console.log("setting effective account from API: " + sessionContext[0].effectiveAccountId);
                this.oldEffectiveAccountId = sessionContext[0].effectiveAccountId;
                this.newEffectiveAccountId = currentPageReference.state?.effectiveAccountId;
                console.log("ForcedAccountSwitch::getStateParameters::normal effective account id = " + this.oldEffectiveAccountId);
                console.log("ForcedAccountSwitch::getStateParameters::forced effective account id = " + this.newEffectiveAccountId);
                if(this.newEffectiveAccountId && this.newEffectiveAccountId != this.oldEffectiveAccountId) {
                    console.log("changing effectiveAccountId");
                    console.log("Session Storage");
                    console.log(sessionStorage);
                    sessionStorage.EFFECTIVE_ACCOUNT_ID = this.newEffectiveAccountId;
                    window.location.reload();
                } else {
                    this.newEffectiveAccountId = this.oldEffectiveAccountId;
                }
                if (this.newEffectiveAccountId) refreshApex(this.account);
            });
        }
    }

    @wire(getRecord, { recordId: "$newEffectiveAccountId", fields: FIELDS })account;

    get name() {
        return this.account.data.fields.Name.value;
    }
}