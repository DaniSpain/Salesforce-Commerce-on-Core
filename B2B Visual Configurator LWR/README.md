B2BLE Visual Configurator - Demo Component

DESCRIPTION

This package will let you show in demo a visual configuration similar to what we had with Dynamic Kits with Cloud Craze, both on the PDP and in the Cart
This component uses the concept of Upcharge products related to a parent product to show them in categories.

RELEASE NOTES

Current Version: 1.2

* Monday, April 4, 2022: First Release
* Monday, April 4, 2022: Some mobile experience fixes
* Wednesday, April 20, 2022 Added control to override same configuration on the cart


WHAT’S INSIDE THE PACKAGE

Custom fields

* Product2
    * Upcharge Category
    * Upcharge Subcategory
    * Upcharge Picker logic (single, multiple) (multiple does not work yet)
    * Upcharge Picker type (color, name, image, range) (range does not work yet)
    * Upcharge Color hex code (used for color picker)
    * Is Upcharge
    * Is Configuration (for experience builder page variation)
* CartItem
    * Is Parent
    * Parent Item

Lightning Web Components

* b2bUpchargePicker
* b2bUpchargeCartContents
* b2bUpchargeCartItems
* b2bUpchargeCartUtils
* b2bUpchargeCmsResourceResolver
* b2bUpchargePubsub

APEX Classes

* B2BUpchargePickerController
* B2BUpchargeCartController

Permission Sets

* B2B Upcharge Picker


INSTALL LINK

https://login.salesforce.com/packaging/installPackage.apexp?p0=04t7Q000000HfaL

POST INSTALL INSTRUCTIONS

* Assign the B2B Upcharge Picker permission set to your customer user and the admin user
* Create the parent product (normal product2 record with the Is_Configuration__c field set to TRUE)
* Create the upcharges products (child products)
    * Create a category that will contain them (like “Upcharges”) and make that category not visible in menu
    * Create the upcharges product2 records under that category, setting the entitlement, name, sku, description, prices, etc as you would do for any commerce products, but on top of that set the following fields
        * Is_Upcharge__c: TRUE
        * Upcharge_Category__c: set the category name you want to display on the tab
        * Upcharge_Subcategory__c: set the subcategory name you want to show to organaize the view in the tab
            * NOTE both Category and Subcategory are Picklist fields so you need to set the values first in the object manager
        * Upcharge_Picker_Type__c: select between 
            * Name → to just show the product name
            * Image → to show the product image together with name and description
            * Color → if you want to show the color picker
                * If you want to shot the color, the color hex code field mus be in a css-ready format, like F32A25
* NOTE: You can also use the standard product import capabilities to mass create products and upcharges
    * Example CSV with name and images
    * Example CSV with color picker
* IMPORTANT: Go back to the parent product and set the Available Upcharge Subcategories (multipicklist) field. This field defines which subcategories to show in the configuration for the product (otherwise you will not see anything on the config :) )
    * NOTE: if you do not see the field remember to add it on the product page layout
    * NOTE: this field is a multi-picklist so make sure all the values are correctly configured under Object Manager for this field
* Go to the experience builder
    * Navigate to the product detail page
        * create a new Page Variation starting from the Product Detail Flex
        * Assign the page variation to an Audience that includes all the products that has Is Configuration = TRUE
        * Switch to the newly created page variation and remove the component with qty and add to cart
        * Add the B2B Upcharge Option Picker component
    * Navigate to the cart page
        * remove the cart items component
        * and add the B2B Cart Items with Upcharge Configuration component (this will show the configuration upcharges grouped on the parent product)
    * Publish


IMPORTANT NOTES

* Currently the PDP component does not show any volume discount, original (strikethrough) price and quantity rules
* Range picker type is still not supported
* Multiple option selection is still not supported
* You can have only one configuration product in the cart, unless the parent SKU and the upcharge SKUs are totally different between 2 different configurations
* Selection is made only between items in Upcharge Categories and not Upcharge Subcategories (only one selection available for each category even ef multiple subcategory are available)
* Line item promotions are applied but not displayed in the cart

