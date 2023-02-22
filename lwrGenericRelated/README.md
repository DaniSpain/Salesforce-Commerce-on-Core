B2B/D2C Commerce Generic Related - Demo Component

Last Update: Wednesday, February 22
Compatible both with LWR and AURA

This component let you create related list of records with image and title connecting together any kind of Salesforce object.
Examples on how you can use it

* Show manually  related products in the D2C stores
* Show a related object in the PDP (for instance for each product you want to see who is the designer that designed that product, and clicking on the designer you can land onto the designer detail page)
* Show any relationship on other objects (for instance show products within an asset in the asset detail page)

How this component works

This component is intended to work with many-to-many relationship
So make sure to have both the parent and child objects but also a junction object between the two.

One example you can use is the Cross_Sell_Recommendations__c object that comes OOTB with the SDO
That object is a junction object between Product2 and again Product2

Post Install Instruction

Enable Apex class

* Open the profile for your customer user
* go to Apex classes and add the LwrGenericRelatedController apex class
* IMPORTANT: if you want to see that as guest user
    * make sure that the class is enabled also for the store-related guest user profile
    * make sure that the same guest user profile has READ access to all the objects and junction objects  to the same guest user profile (including all the field)
    * make sure you created sharing rules in Setup > Sharing Settings to make all the required custom objects available to the guest user (if one or both of the objects in the relationship are custom objects)
        For instance, in the following image I created a sharing rule to make all the Designer records accessible to the guest user


Create the required objects

The component requires 3 objects to work

* a parent object
* a child object
* a junction object between parent and child

In the examples below you will see 2 use cases

* show related products in the PDP
* show related designers in the PDP

In the RELATED PRODUCTS use case we have

* Parent Object: Product2
* Child Object: Product2
* Junction Object: Cross_Sell_Recommendations__c


In the RELATED DESIGNERS use case we have

* Parent Object: Product2
* Child Object: Designer__c
* Junction Object: Product_Designer__c

NOTE: Those are just examples but you can create any kind of relationship between any kind of object.

The important thing is that, if you create a custom child object they have

* a field with a name or title
* a field with the URL of an image (if you want to show the child image)
    * if the child is a Product2 field you don’t need to specify an image field since we get it from the product media

Add the component to the site

* Open the Experience Builder and go to the parent object detail page (in this example we will use Product2 as the parent object so we will go to the product detail page)
* Drag and drop the component named LWR Generic Related

Once you added the component you will se many fileds you can leverage to configure it.


Field	Required	Description
Record ID	TRUE	The id of the parent record to use, tipically the record gathered from the detail page
Parent Object API Name	TRUE	The API name of the parent object, in our case Product2
Junction Object API Name	TRUE	The API name of the junction object. (*)
Junction Object to Parent Relationship API Name	TRUE	API name of the relationship from the Junction Object to the Parent Object.  (**)
Junction Object to Child Relationship API Name	TRUE	API name of the relationship from the Junction Object to the Child Object. (**)
Child Object API Name	TRUE	API name of the child object
Header Text	FALSE	Text for the header, leve it blank you you don't want to show it
Mapping child field for Title	TRUE	API name of the Child field you want to use as the title
Show the child image	TRUE	Display the images or not
Mapping child field for Image	TRUE	API name of the Child field you want to use as the Image URL
Take Image from Media	TRUE	Use this checkbox if the child object is a Product2 object to taje the image from the default product image
Mapping child field for Subtitle	TRUE	API name of the Child field you want to use as the Subtitle
Number of columns	TRUE	How many columns you want to see the children
Child detail page base URL	TRUE	The base url for the child detail page (***)

(*) In our example the junction object API names are Cross_Sell_Recommendations__c for the related products and Product_Designer::c for the related designer
(**) Tipically is the name of the lookup filed to the parent object but with __r instead of __c (for instance Designer__r or Product__r)
(***) This is the base URL you can set into Experience Cloud inside the page settings, for instace if the child object is a product, the default base URL is “product”
The following is the example with the Cross Sell Recommendation
And the following is by using a custom Product_Designer Relationship

FROM THE PDP
FROM THE DESIGNER DETAIL PAGE
