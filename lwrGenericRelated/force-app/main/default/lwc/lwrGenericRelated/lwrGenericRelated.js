import { LightningElement, api, wire, track } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import communityId from '@salesforce/community/Id';

import getParentRecord from '@salesforce/apex/LwrGenericRelatedController.getParent';
import getChildrenRecord from '@salesforce/apex/LwrGenericRelatedController.getChildren';
import getCommerceProducts from '@salesforce/apex/LwrGenericRelatedController.getCommerceProducts';

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
    @api columns;
    @api childDetailPageBaseURL;

    @track childMappedData = [];
    @track columnClass = "child-tile col-3";

    childFields = [];

    connectedCallback() {
        console.log("LwrGenericRelated::connected callback");
        this.childFields.push(this.tileMappingTitle);
        if (!this.takeImageFromMedia) {
            this.childFields.push(this.tileMappingImage);
        }
        if (this.tileMappingSubtitle) {
            this.childFields.push(this.tileMappingSubtitle);
        }
        this.initColumns();
    }

    @wire(getChildrenRecord, {
        parentId: '$recordId',
        junctionObjectApiName: '$junctionObjectAPIName',
        junctionToParentRelationshipApiName: '$junctionObjectToParentRelationship',
        junctionToChildRelationshipApiName: '$junctionObjectToChildRelationship',
        fields: '$childFields'
    })wiredData({error, data}) {
        console.log("wired children records");
        console.log(data);
        this.childMappedData = [];
        if (data && data.length > 0) {
            console.log("LwrGenericRelated::getChildrenRecord::got data");
            console.log(data);
            this.mapFieldData(data);
        } 
        if (error) {
            console.error("LwrGenericRelated::getChildrenRecord::error");
            console.error(error);
        }
    }
    
    initColumns() {
        switch (this.columns) {
            case 1:
                this.columnClass = "child-tile col-1";
                break;
            case 2:
                this.columnClass = "child-tile col-2";
                break;
            case 3:
                this.columnClass = "child-tile col-3";
                break;
            case 4:
                this.columnClass = "child-tile col-4";
                break;
            case 5:
                this.columnClass = "child-tile col-5";
                break;
            case 6:
                this.columnClass = "child-tile col-6";
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
                Title: null,
                Image: null,
                Subtitle: null,
                Url: null
            };
            mappedDataItem.Id = dataItem[this.junctionObjectToChildRelationship].Id;
            console.log("LwrGenericRelated::mapFieldData::Mapping title => " + this.junctionObjectToChildRelationship + "." + this.tileMappingTitle);
            mappedDataItem.Title = dataItem[this.junctionObjectToChildRelationship][this.tileMappingTitle];
            mappedDataItem.Url = basePath + "/" + this.childDetailPageBaseURL + "/" + mappedDataItem.Id;
            mappedDataItem.Image = dataItem[this.junctionObjectToChildRelationship][this.tileMappingImage];
            mappedDataItem.Subtitle = dataItem[this.junctionObjectToChildRelationship][this.tileMappingSubtitle];
            childIds.push(mappedDataItem.Id);
            this.childMappedData.push(mappedDataItem);
        }

        console.log("LwrGenericRelated::mapFieldData::Mapped Data");
        console.log(this.childMappedData);

        //we control if the child object is a Product2 and, if yes, we get the info from Commerce APIs
        if (this.takeImageFromMedia) {
            getCommerceProducts({
                communityId: communityId,
                productIds: childIds
            }).then(data => {
                console.log("LwrGenericRelated::mapFieldData::getCommerceProducts::Got Commerce Products");
                console.log(data);

                //now we decorate the mapped fields with the image
                for (var i=0; i<data.length; i++) {
                    this.childMappedData[i].Image = data[i].defaultImage.url;
                }
            })
            .catch(error => {
                console.error("LwrGenericRelated::mapFieldData::getCommerceProducts::error");
                console.error(error);
            })
        }
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