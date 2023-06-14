public class B2BUpchargePickerController {
    
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductDetail getProduct(
        String communityId,
        String productId,
        String effectiveAccountId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return ConnectApi.CommerceCatalog.getProduct(
            webstoreId,
            productId,
            effectiveAccountId,
            null,
            false,
            null,
            false,
            true,
            false,
            false,
            false
        );
    }
    
    @AuraEnabled
    public static List<ConnectApi.ProductDetail> getUpchargeOptions(
    	String communityId,
        String productId,
        String effectiveAccountId
    ){
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        //get the available upcharges subcategories from the parent product
        Product2 parentProduct = [SELECT Available_Upcharge_Subcategories__c FROM Product2 WHERE ID = :productId][0];
        List<String> availableSubCategories = parentProduct.Available_Upcharge_Subcategories__c.split(';');
        
        List<Product2> upcharges = [
            SELECT Id, Name, Is_Upcharge__c, Upcharge_Category__c, 
            Upcharge_Subcategory__c, Upcharge_Picker_Logic__c, Upcharge_Picker_Type__c, 
            Upcharge_Color_Hex_Code__c FROM Product2 WHERE IsActive = TRUE AND Is_Upcharge__c = TRUE 
            AND Upcharge_Subcategory__c IN :availableSubCategories];
        
        List<ConnectApi.ProductDetail> productDetails = new List<ConnectApi.ProductDetail>();
        for (integer i=0; i<upcharges.size(); i++) {
            //we get the product detail from commerce api
            ConnectApi.ProductDetail prodDetail = getProduct(communityId, upcharges.get(i).Id, effectiveAccountId);
            
            productDetails.add(prodDetail);
        }
        return productDetails;
    }
    
    @AuraEnabled
    public static ConnectApi.PricingResult getProductPrices(
    	String communityId,
        List<String> productIds,
        String effectiveAccountId
    ){
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        ConnectApi.PricingInput pi = new ConnectApi.PricingInput();
        List<ConnectApi.PricingLineItemInput> pliis = new List<ConnectApi.PricingLineItemInput>();
        for (integer i=0; i<productIds.size(); i++) {
            ConnectApi.PricingLineItemInput plii = new ConnectApi.PricingLineItemInput();
            plii.productId = productIds.get(i);
            pliis.add(plii);
        }
        
        pi.pricingLineItems = pliis;
        
        //ConnectApi.CommerceStorePricing.getProductPrices(webstoreId, effectiveAccountId, ConnectApi.pricingInput)
        return ConnectApi.CommerceStorePricing.getProductPrices(
            webstoreId,
            effectiveAccountId,
            pi
        );
    }
    
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductPrice getProductPrice(
        String communityId,
        String productId,
        String effectiveAccountId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceStorePricing_static_methods.htm#apex_ConnectAPI_CommerceStorePricing_static_methods
        return ConnectApi.CommerceStorePricing.getProductPrice(
            webstoreId,
            productId,
            effectiveAccountId
        );
    }
    
    @AuraEnabled
    public static void addConfigToCart(
    	String communityId,
        String effectiveAccountId,
        String parentProductId,
        List<String> productOptions,
        String quantity
    ){        
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        ConnectApi.CartItemInput parentItem = new ConnectApi.CartItemInput();
        parentItem.productId = parentProductId;
        parentItem.quantity = quantity;
        parentItem.type = ConnectApi.CartItemType.PRODUCT;
        //first add the bundle parent
        ConnectApi.CartItem parentInput = ConnectApi.CommerceCart.addItemToCart(webstoreId, effectiveAccountId, 'current', parentItem);
        
        //set additional fields on the parent cart item
        CartItem ci = [SELECT Id,Is_Parent__c from CartItem where Id = :parentInput.cartItemId];
        ci.Is_Parent__c = true;
        update ci;
        
        //add the options
        for (integer i=0; i<productOptions.size(); i++) {
            String optionId = productOptions[i];
            ConnectApi.CartItemInput item = new ConnectApi.CartItemInput();
            item.productId = optionId;
            item.quantity = quantity;
            item.type = ConnectApi.CartItemType.PRODUCT;
            ConnectApi.CartItem itemInput = ConnectApi.CommerceCart.addItemToCart(webstoreId, effectiveAccountId, 'active', item);
            
            //extend the cart item
            CartItem optionCi = [SELECT Id,Parent_Item__c from CartItem where Id = :itemInput.cartItemId];
            optionCi.Parent_Item__c = parentInput.cartItemId;
            update optionCi;
        }
    }
    
    //returns TRUE if the product is already added to the cart
    @AuraEnabled
    public static Boolean checkExistingConfiguration(
    	String communityId,
    	String effectiveAccountId,
    	String productId
    ){
        Boolean found = false;
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        //get the active cart
        ConnectApi.CartItemCollection cartItemColl = ConnectApi.CommerceCart.getCartItems(webstoreId,effectiveAccountId,'current');
        List<ConnectApi.CartItemResult> cartItems = cartItemColl.cartItems;
        
        //check which items are in the cart
        for (integer i=0; i<cartItems.size(); i++) {
            ConnectApi.CartItem ci = (ConnectApi.CartItem) cartItems.get(i).cartItem;
            if (ci.productId == productId) {
                found = true;
                break;
            }
        }
        return found;
    }
    
    @AuraEnabled
    public static void removeConfigurationFromCart(
    	String communityId,
        String effectiveAccountId,
        String productId
    ){
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        //first we find the cartitem related to this product
        //get the active cart
        ConnectApi.CartItemCollection cartItemColl = ConnectApi.CommerceCart.getCartItems(webstoreId,effectiveAccountId,'current');
        List<ConnectApi.CartItemResult> cartItems = cartItemColl.cartItems;
        
        //check which items are in the cart
        for (integer i=0; i<cartItems.size(); i++) {
            ConnectApi.CartItem ci = (ConnectApi.CartItem) cartItems.get(i).cartItem;
            if (ci.productId == productId) {
                String cartItemId = ci.cartItemId;
                B2BUpchargeCartController.deleteCartItem(communityId,effectiveAccountId,'current',cartItemId);
                break;
            }
        }
    }
    
    /* @description Given a community ID, returns the relavent webstore ID for use in B2B Commerce on lightning
* @param  communityId The Id of the community from which the call originated
* @return weStoreId The webStoreId corresponding to the community Id.
* @example
* String webStoreId = B2BUtils.resolveCommunityIdToWebstoreId('0DB2D0000004Xz7');
*/
    // A cache which maps community Ids to WebStore Ids
    private static Map<String, String> communityIdToWebStoreIdCache = new Map<String, String>();
    
    public static String resolveCommunityIdToWebstoreId(String communityId) {
        if (communityIdToWebStoreIdCache.containsKey(communityId)) {
            return communityIdToWebStoreIdCache.get(communityId);
        } else {
            String webStoreId = [
                SELECT WebStoreId
                FROM WebStoreNetwork
                WHERE NetworkId = :communityId
                WITH SECURITY_ENFORCED
                LIMIT 1
            ]
                .WebStoreId;
            communityIdToWebStoreIdCache.put(communityId, webStoreId);
            return webStoreId;
        }
    }
}