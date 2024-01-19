This package is a set of 2 lightning web components that allows you to start an order from the Account Detail page inside a partner community, opening the B2B Commerce storefront forcing the effective account id.

## Package Content and Configuration
**Component "B2B Commerce Start Order"**
This is the component that should be added into the Partner Community into the Account Detail Page. It has 3 parameters
* Button Label: the text you want to show on the button
* Storefront URL: the full url to the storefront that should be opened (e.g. https://magris231211demo.my.site.com/b2benh/)
* Account ID: the account id that should be forced once the storefront is opened. By default it takes the id from the record you are seeing so {!recordId}

**Component "B2B Force Account Switch"**
This is the component that should be added in the B2B Storefront home page and here is where the magic happens. It takes the URL param that is passed by the previous component and forces the Effective Account ID in the session.
This component has only one param:
* Label: the label you want to show before the name of the account.
NOTE: you can also put this component in other pages, it only forces a different Effective Account ID if it is passed on the URL and if it is different by the one that is already selected.

## Additional Notes
* The partner user must be configured as a valid user both for the partner community and the b2b commerce store
* Behind the scenes it uses the standard "Account Switch" methodology so make sure that you configure properly the External Managed Accounts on the partner account (the account related to the partner user e.g. the account related to Paul Partner in the SDO) configuring all the sub accounts you want to show the OOBO scenarios
