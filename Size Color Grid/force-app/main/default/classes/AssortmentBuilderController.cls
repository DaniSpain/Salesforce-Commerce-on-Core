public with sharing class AssortmentBuilderController {

    @AuraEnabled(cacheable=true)
    public static List<ConnectApi.ProductDetail> getProducts(String communityId, String productId, String effectiveAccountId) {
        /**
         * first we get all product IDs related to this product
         * for now this works without explicit product correlation but looking at the same base SKU
         * for instance if the currento product SKU is "148kkk-bl-m" the base sku is "148kkk" and all the 
         * other products in the assortment will have the same base sku
         * The base sku value is stored in the Base_SKU__c in the Product2
         */
        String productBaseSku = [Select Base_SKU__c from Product2 where Id = :productId limit 1].Base_SKU__c;
        
        //now we get all the products with the same base SKU
        List<Product2> assortmentProducts = [Select Id, Size__c from Product2 where Base_SKU__c = :productBaseSku ORDER BY Name, Size__c ASC];
        
        //an then we get the product info for each product from the Commerce APIs
        List<ConnectApi.ProductDetail> returnProducts = new List<ConnectApi.ProductDetail>();
        String webstoreId = AssortmentBuilderUtils.resolveCommunityIdToWebstoreId(communityId);
        for (integer i=0; i<assortmentProducts.size(); i++) {
            if (assortmentProducts[i].Size__c != null) {
                ConnectApi.ProductDetail prod = ConnectApi.CommerceCatalog.getProduct(
                  webstoreId,
                  assortmentProducts[i].Id,
                  effectiveAccountID,
                  null,
                  false,
                  null,
                  false,
                  true,
                  false
                );
                returnProducts.add(prod);
                }
        }
        
        return returnProducts;
    }
    
    @AuraEnabled
  	//public static List<ConnectApi.CartItem> addToCart(
  	public static Map<String, Object> addToCart(
        String communityId,
        String productQtyJSON,
        String effectiveAccountId
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = AssortmentBuilderUtils.resolveCommunityIdToWebstoreId(communityId);
        
        Map<String, Object> productQuantities = (Map<String, Object>) JSON.deserializeUntyped(productQtyJSON);
        
        for (String productId : productQuantities.keyset()) {
            String qty = (String) productQuantities.get(productId);
            
            if (qty!='0') {
                ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
                cartInput.productId = productId;
                cartInput.quantity = qty;
                cartInput.type = ConnectApi.CartItemType.PRODUCT;
                
                ConnectApi.CommerceCart.addItemToCart(
                    webstoreId,
                    effectiveAccountId,
                    'active',
                    cartInput
                );
            }
        }
        
        return productQuantities;
    }
    
}