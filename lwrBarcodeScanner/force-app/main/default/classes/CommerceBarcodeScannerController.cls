public with sharing class CommerceBarcodeScannerController {

    // A cache which maps community Ids to WebStore Ids
    private static Map<String, String> communityIdToWebStoreIdCache = new Map<String, String>();

    @AuraEnabled
    public static void addToCart(String communityId, String productFieldAPIName, BarcodeItemWrapper[] barcodes) {
        String webStoreId = resolveCommunityIdToWebstoreId(communityId);
        List<ConnectApi.BatchInput> cartInputs = new  List<ConnectApi.BatchInput>();

        for (Integer i = 0; i < barcodes.size(); i++) {
            BarcodeItemWrapper biw = barcodes[i];
            String ean = biw.value;
            String query = 'SELECT Id FROM Product2 WHERE ' + productFieldAPIName + '=\'' + ean + '\' LIMIT 1';
            Product2 prod = Database.query(query);
            ConnectApi.CartItemInput cii = new ConnectApi.CartItemInput();
            cii.productId = prod.Id;
            cii.quantity = '1';
            cii.type = ConnectApi.CartItemType.PRODUCT;
            ConnectApi.BatchInput bi = new ConnectApi.BatchInput(cii);
            cartInputs.add(bi);
        }

        ConnectApi.CommerceCart.addItemsToCart(
            webstoreId,
            null,
            'current',
            cartInputs
        );
    }

    public class BarcodeItemWrapper {
        @AuraEnabled
        public String type {get; set;}
        @AuraEnabled
        public String value {get; set;}
    }

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