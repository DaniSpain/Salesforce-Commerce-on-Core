## Collection of Demo Components for Salesforce B2B/D2C Commerce
This is a collection of components built for Salesforce B2B and D2C Commerce mainly for Demo purposes, but they can be used for free and extended accordngly to your customer needs.
Me or Salesofrce doesn't give any support on this components since they are not ofiicialy distributed through the appexchange.

This collection currently contains
* [B2B Commerce CS (Customer Service) Free Product](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/B2B%20CS%20Free%20Product) A component that can be added to the cart giving specific users the ability to manually set products free or manually add % discounts to the product (mainly for order on behalf use cases)
* [B2B Visual Configurator](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/B2B%20Visual%20Configurator%20LWR) A component that allows to create complex product configurations using upcharge products (NOTE: the component uses added fields to the cart, cartitem, and product2 objects that are not included in the project so you will nedd to add them manually to your org in order to make the components to work)
* [Cart Switcher](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/LWR%20Cart%20Switcher) A component that allows customers to create multicle carts, switch between them and share them with other users
* [PDP OCI Availability Table](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/PDP%20OCI%20Availability%20Table) A component that should be used on orgs with Salesforce Order Management with Omnichannel Inventory enabled. Allows you to show inventory items for a specifiic location group for a given product
* [Size Color Grid](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/Size%20Color%20Grid) A copmponent that extends the fisibility of a product in the PDP to show size/color variants in a grid (NOTE: the component uses added fields to the product2 objects that are not included in the project so you will nedd to add them manually to your org in order to make the components to work)
* [Forced Account Switch](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/forcedAccountSwitch) A mix of components that allows to force an Effective Account Id passing that as an URL param (e.g. from a OOBO scenario from a partner community)
* [Barcode Scanner](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/lwrBarcodeScanner) A component that opens the device camera and scans for multiple barcodes for broducts to be added to the cart. This component require Mobile Publisher licenses to work
* [LWR Generic Related Component](https://github.com/DaniSpain/Salesforce-Commerce-on-Core/tree/main/lwrGenericRelated) A component that can be used in LWR websites to show any kind of related object in a catalog-like format

## Additional Resources
If you are looking for all the base components or official examples and guidelines used in Salesforce B2B/D2C Commerce you can refer to this repositories provided by Salesforce:
* [Commerce Extensibility Framework](https://github.com/forcedotcom/commerce-extensibility) Use this repository to find examples on how to use the Extension framework to extend pricing, taxes, inventory, etc capabilities
* [Commerce on Lightning Components](https://github.com/forcedotcom/commerce-on-lightning-components) A library to the reference implementation for the standard B2B and D2C Commerce on LWR framweork  Lightning Web Components
* [Commerce on Lightning](https://github.com/forcedotcom/commerce-on-lightning/) Another repository with additional examples on components, classes and more for B2B, D2C and SOM (Salesforce Order Manager)
* [B2B Commerce Lightning (Aura) Quick Start](https://github.com/forcedotcom/b2b-commerce-on-lightning-quickstart/) A remopistory containing examples regarding B2b Commerce Lightning Aura implementation (NOTE: for new project is highly recommended to use LWR instead, in taht case you can ignore this repo)

# Additional Documentation
* [Salesforce B2B/D2C Commerce Help](https://help.salesforce.com/s/articleView?id=sf.comm_intro.htm&type=5)
* [Salesforce B2B/D2C Commerce Developer Documentation](https://developer.salesforce.com/docs/atlas.en-us.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_comm_dev_guide.htm)
* [Salesforce B2B/D2C Extension Developer Guide](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/extensions.html)
