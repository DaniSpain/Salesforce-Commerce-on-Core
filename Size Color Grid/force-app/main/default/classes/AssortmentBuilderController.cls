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
        String webstoreId = AssortmentBuilderUtils.resolveCommunityIdToWebstoreId(communityId);
        String productBaseSku = null;

        /**
         * let's check if the product is a variation parent
         * If it's a parent, we gather the first child and use that as a reference product
         * We do this because the Base_SKU__c should be set only on the children
         */
        Product2 product = [SELECT ProductClass, Base_SKU__c FROM Product2 WHERE Id = :productId LIMIT 1][0];
        if (product.Base_SKU__c != null) {
            productBaseSku = product.Base_SKU__c;
        } else {
            if (product.ProductClass == 'VariationParent') {
                //let's get the product info from Commerce APIs
                ConnectApi.ProductDetail parentProd = ConnectApi.CommerceCatalog.getProduct(
                    webstoreId, 
                    productId, 
                    effectiveAccountId, 
                    null, 
                    null, 
                    false, 
                    false, 
                    false, 
                    false,
                    false, 
                    true, 
                    true);
                 
                ConnectApi.ProductVariationInfo variationInfo = parentProd.variationInfo;
                List<ConnectApi.ProductAttributesToProductEntry> patpes = variationInfo.attributesToProductMappings;
                String childProductId = patpes[0].productId;
                productBaseSku = [SELECT Base_SKU__c FROM Product2 WHERE Id = :childProductId LIMIT 1][0].Base_SKU__c;
            }
        }
        
        //String productBaseSku = [Select Base_SKU__c from Product2 where Id = :productId limit 1].Base_SKU__c;
        
        //now we get all the products with the same base SKU
        List<Product2> assortmentProducts = [SELECT Id, Size__c FROM Product2 WHERE Base_SKU__c = :productBaseSku ORDER BY Size__c ASC];
        
        //an then we get the product info for each product from the Commerce APIs
        List<ConnectApi.ProductDetail> returnProducts = new List<ConnectApi.ProductDetail>();
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
                    'current',
                    cartInput
                );
            }
        }
        
        return productQuantities;
    }
    
}