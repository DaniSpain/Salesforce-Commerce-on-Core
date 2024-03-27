This package is a LWC extension for the B2B Commerce PDP that adds a size/color grid capability to the store where the customer can add multiple sizes and colors of the same products in one click.

NOTE: this component doesn’t use the product variants but specific custom fields on the Product2 Object (as explained below)
But you can safely use this component together with variant products, just do not set size and color on the parent and you are done :) 

# Install the package
To install thos package you can deploy it directly from VSCode or you can use this link fro the unmanaged package
[https://login.salesforce.com/packaging/installPackage.apexp?p0=04t7Q000000cMpP](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tWV0000000jgH)

To avoid issues during installation:

* Select “Install for all users”
* If present, under “Advanced” dropdown select “compile only package classes”

# Add the perm set to the Community User

1. Go under Setup > Users and select the user you are logging into the store
2. Scroll down until you find “Permission Set Assignments” and click on Edit Assignments
3. Add the permission set named Assortment Builder Perm Set
4. Click on Save

# Configure your products

As mentioned above, this component doesn’t use the product variations but uses simple products.
In order to work, the package adds 3 additional fields to the Product2 object:
NOTE: if you deploy the package from VSCode this fields are not included so you have to create them manually

* Size (picklist)
* Color (picklist)
* Base SKU (string)

The correlation between the various products in the grid is based on the Base SKU.

So let’s assume that you have a Shirt with 2 colors (Blue and Black) and 3 sizes (S, M, L)

1. Under object manager go to the Product2 object and add to the Color field the “Black” and “Blue” value
2. Then add to the Size field the values “S”,“M” and “L”
3. Create 6 different simple products matching all the combinations
4. For each product set the Color and Size field accordingly 
5. Then fill the “Base SKU” value so that it’s the same value for all the six products

# (Optional) Configure Stock Availability

Other 3 fields are part of the package:
NOTE: if you deploy the package from VSCode this fields are not included so you have to create them manually

* Stock Availability (Stock_Availability__c) (Picklist: In Stock|Limited|Out Of Stock|Available For Preorder)
* Stock Quantity (Stock_Quantity__c) (Number)
* Estimated Shipping Date (Estimated_Shipping_Date__c) (Date - formula field based on the Stock_Availability__c field)

You can use those fields to show the stock on the grid.
Stock Availability can have 4 different values:

* In Stock
* Limited Stock
* Out Of Stock
* Available For Preorder

In both “In Stock” and “Limited Stock” values, the quantity you insert in the grid will be checked to not exceed the value in the “Stock Quantity” field.

If it’s “Out Of Stock” you will not be able to add the product to the cart (note: this is not impacting the normal add to cart components)

If “Available For Preorder” the stock quantity will be ignored.

# Add the component to the PDP

Open the Experience Builder and go to the product detail page.
In the component palette you should find a custom component named B2B Assortment Builder.
Drag&Drop it into the page and publish it.

# Latest releases Notes:
March 27, 2024
* Added toast message for LWR store after add to cart
* Disable add to cart button during add to cart process
* Fix to show the grid also on the variation parent
May 14, 2021: 
* fixed missing sizes with “not available” message
Thursday, December 16, 2021
* Added visual effect when adding products
* added stock quantity and preorder capabilities
* minor fixes
