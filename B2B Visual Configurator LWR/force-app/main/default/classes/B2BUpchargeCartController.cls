public class B2BUpchargeCartController {
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.getCartItems
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
* @param activeCartOrId ID of the cart, active, or current.
* @param pageParam Specifies the page token to be used to view a page of information.
* @param sortParam Sort order for items in a cart.
* @return CartItemCollection A collection of cart items
*/
    @AuraEnabled
    public static ConnectApi.CartItemCollection getCartItems(
        //public static list<CartItemWrapper> getCartItems(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        String sortParam
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        // Get the ConnectApi.CartItemSortOrder enum value from string.
        // For the list of possible values, see:
        // see https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectAPI_enums.htm#cartItemSortOrderEnum
        ConnectApi.CartItemSortOrder resolvedSortParam = resolveSortParam(
            sortParam
        );
        
        String additionalFields = 'Upcharge_Category__c,Upcharge_Subcategory__c';
        Integer pageSize = 100;
        
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.getCartItems(
            //ConnectApi.CartItemCollection cartItemCollection = ConnectApi.CommerceCart.getCartItems(
            webstoreId,
            effectiveAccountId,
            'current',
            additionalFields,
            pageParam,
            pageSize,
            resolvedSortParam
        );
        
        /*
for (integer i=0; i<cartItemCollection.cartItems.size; i++) {
CartItemWrapper ciw = new CartItemWrapper();
ciw.cartItem = cartItemCollection.cartItems[i];
}
*/
    }
    
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.updateCartItem
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
* @param activeCartOrId ID of the cart, active, or current.
* @param cartItemId ID of the cart item to be updated.
* @return CartItem The updated cart item
*/
    @AuraEnabled
    public static ConnectApi.CartItem updateCartItem(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String cartItemId,
        ConnectApi.CartItemInput cartItem
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        //DSPAGNUOLO: if the item is a configuratin update the quantity of all the child items
        CartItem ci = [SELECT Is_Parent__c from CartItem where Id = :cartItemId][0];
        if (ci.Is_Parent__c == true) {
            //find and delete child items
            List<CartItem> childItems = [SELECT Id,Product2Id FROM CartItem WHERE Parent_Item__c = :cartItemId];
            for (integer i=0; i<childItems.size(); i++) {
                ConnectApi.CartItemInput childCartItem = new ConnectApi.CartItemInput();
                childCartItem.productId = childItems.get(i).Product2Id;
                childCartItem.quantity = cartItem.quantity;
                childCartItem.type = ConnectApi.CartItemType.PRODUCT;
                ConnectApi.CommerceCart.updateCartItem(
                    webstoreId,
                    effectiveAccountId,
                    'current',
                    childItems.get(i).Id,
                    childCartItem
                );
            }
        }
        
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.updateCartItem(
            webstoreId,
            effectiveAccountId,
            'current',
            cartItemId,
            cartItem
        );
    }
    
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.deleteCartItem
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
* @param activeCartOrId ID of the cart, active, or current.
* @param cartItemId ID of the cart item to be deleted.
*/
    @AuraEnabled
    public static void deleteCartItem(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String cartItemId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        //DSPAGNUOLO: added logic to recognize if the item is a config parent. If yes delete alla the child items
        CartItem ci = [SELECT Is_Parent__c from CartItem where Id = :cartItemId][0];
        if (ci.Is_Parent__c == true) {
            //find and delete child items
            List<CartItem> childItems = [SELECT Id FROM CartItem WHERE Parent_Item__c = :cartItemId];
            for (integer i=0; i<childItems.size(); i++) {
                ConnectApi.CommerceCart.deleteCartItem(
                    webstoreId,
                    effectiveAccountId,
                    'current',
                    childItems.get(i).Id
                );
            }
        }
        
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        ConnectApi.CommerceCart.deleteCartItem(
            webstoreId,
            effectiveAccountId,
            'current',
            cartItemId
        );
    }
    
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.getCartSummary
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
* @param activeCartOrId ID of the cart, active, or current.
*/
    @AuraEnabled
    public static ConnectApi.CartSummary getCartSummary(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.getCartSummary(
            webstoreId,
            effectiveAccountId,
            'current'
        );
    }
    
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.createCart
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
*/
    @AuraEnabled
    public static ConnectApi.CartSummary createCart(
        String communityId,
        String effectiveAccountId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        ConnectApi.CartInput cartInput = new ConnectApi.CartInput();
        cartInput.effectiveAccountId = effectiveAccountId;
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.createCart(webstoreId, cartInput);
    }
    
    /**
* @description Demonstrates how to call ConnectApi.CommerceCart.deleteCart
* @param  communityId The Id of the community from which the call originated
* @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
* @param activeCartOrId ID of the cart, active, or current.
*/
    @AuraEnabled
    public static void deleteCart(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        ConnectApi.CommerceCart.deleteCart(
            webstoreId,
            effectiveAccountId,
            'current'
        );
    }
    
    @AuraEnabled
    public static List<CartItemWrapper> getUpchargeConfiguration(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId) {
            //get cart items > for each item get bundle configuration > return an object list of configured items
            String webstoreId = resolveCommunityIdToWebstoreId(communityId);
            ConnectApi.CartItemCollection cartItemCollection = ConnectApi.CommerceCart.getCartItems(webstoreId,effectiveAccountId,'current');
            List<CartItemWrapper> ciws = new List<CartItemWrapper>();
            for (integer i=0; i<cartItemCollection.cartItems.size(); i++) {
                ConnectApi.CartItemResult cartItem = cartItemCollection.cartItems.get(i);
                String cartItemId = cartItem.cartItem.cartItemId;
                CartItem ci = [SELECT Id,Is_Parent__c,Parent_Item__c   from CartItem where Id = :cartItemId];
                if (ci.Is_Parent__c == true || ci.Parent_Item__c != null) {
                    //this means that this cart item comes from a configuration
                    CartItemWrapper ciw = new CartItemWrapper();
                    ciw.cartItemId = cartItemId;
                    ciw.isBundleParent = ci.Is_Parent__c;
                    ciw.parentItem = ci.Parent_Item__c ;
                    ciws.add(ciw);
                }
            }
            return ciws;
        }
    
    public class CartItemWrapper {
        @AuraEnabled
        public String cartItemId {get; set;}
        @AuraEnabled
        public Boolean isBundleParent {get;set;}
        @AuraEnabled
        public String parentItem {get;set;}
    }
    
    // A cache which maps community Ids to WebStore Ids
    private static Map<String, String> communityIdToWebStoreIdCache = new Map<String, String>();
    
    // A cache to map a string to ConnectApi.CartItemSortOrder
    private static Map<String, ConnectApi.CartItemSortOrder> sortOrderCache = new Map<String, ConnectApi.CartItemSortOrder>();
    
    /**
* @description Given a community ID, returns the relavent webstore ID for use in B2B Commerce on lightning
* @param  communityId The Id of the community from which the call originated
* @return weStoreId The webStoreId corresponding to the community Id.
* @example
* String webStoreId = B2BUtils.resolveCommunityIdToWebstoreId('0DB2D0000004Xz7');
*/
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
    
    /**
* @description Given a sortParam string, return null or the relavent ConnectApi.CartItemSortOrder enum value
* See https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectAPI_enums.htm#cartItemSortOrderEnum for the enum values
* @param  sortParam A string representing a sort Param.
* @return resolvedSortParam A ConnectApi.CartItemSortOrder enum value or null
* @example
* ConnectApi.CartItemSortOrder sortParam = B2BUtils.resolveSortParam('CreatedDateAsc');
*/
    public static ConnectApi.CartItemSortOrder resolveSortParam(
        String sortParam
    ) {
        if (sortOrderCache.isEmpty()) {
            for (
                ConnectApi.CartItemSortOrder sortOrder : ConnectApi.CartItemSortOrder.values()
            ) {
                sortOrderCache.put(sortOrder.name(), sortOrder);
            }
        }
        return sortOrderCache.get(sortParam);
    }
    
    public static String getUserAccountID() {
        String userId = UserInfo.getUserId();
        String contactId = [SELECT ContactId FROM User WHERE Id = :userId].ContactId;
        return [SELECT AccountId FROM Contact WHERE Id = :contactId].AccountId; 
    }
}