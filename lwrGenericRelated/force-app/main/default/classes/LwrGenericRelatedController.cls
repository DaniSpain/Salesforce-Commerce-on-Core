public without sharing class LwrGenericRelatedController {
    
    private static Map<String, String> communityIdToWebStoreIdCache = new Map<String, String>();

    @AuraEnabled
    public static SObject getParent(String recordId, String apiName, String fields){
        Type t = Type.forName(apiName);
        SObject sobj = (SObject)t.newInstance();

        String query = 'SELECT ' + fields + ' FROM ' + apiName + ' WHERE Id = \'' + recordId + '\'';

        sobj = Database.query(query);
        return sobj;
    }

    @AuraEnabled(cacheable = true)
    public static List<SObject> getChildren(
        String parentId, 
        String junctionObjectApiName, 
        String junctionToParentRelationshipApiName, 
        String junctionToChildRelationshipApiName,
        String[] fields,
        String[] relationshipFields,
        String whereConditions,
        String takeRelationshipsFromVariationParent){
            Type t = Type.forName(junctionObjectApiName);
            SObject jobj = (SObject)t.newInstance();

            /*
            String query = 
                'SELECT ' + junctionToChildRelationshipApiName + '.Id ' + ' , ' +
                junctionToChildRelationshipApiName + '.Name ' + ' FROM ' + 
                junctionObjectApiName + ' WHERE ' + junctionToParentRelationshipApiName + 
                '.Id = \'' + parentId + '\''; 
            */
            String query = 'SELECT ' + junctionToChildRelationshipApiName + '.Id ';
            for (integer i = 0; i<fields.size(); i++) {
              query += ' , ' + junctionToChildRelationshipApiName + '.' + fields[i];
            }

            if (relationshipFields != null) {
              for (integer i=0; i<relationshipFields.size(); i++) {
                query += ' , ' + junctionObjectApiName + '.' + relationshipFields[i];
              }
            }

            query += ' FROM ' + junctionObjectApiName + 
              ' WHERE ' + junctionToParentRelationshipApiName + '.Id = \'' + parentId + '\'';
              
            if (whereConditions != null && whereConditions != '') {
              query += ' AND ' + whereConditions;
            }

            //String query = 
            //    'select Recommended_Product__r.Id, Recommended_Product__r.Name from Cross_Sell_Recommendations__c Where Recommended_Product_Parent__r.Id = \'' + parentId + '\'';

            List<SObject> cobjs = Database.query(query);
            return cobjs;
    }

    @AuraEnabled(cacheable = false)
    public static List<ConnectApi.ProductOverview> getCommerceProducts(String communityId, String[] productIds, String effectiveAccountId){
        String webstoreId = resolveCommunityIdToWebstoreId(communityId);
        
        //getProducts(webstoreId, effectiveAccountId, ids, skus, fields, excludeMedia, excludePrices)
        ConnectApi.ProductOverviewCollection productCollection = ConnectApi.CommerceCatalog.getProducts(webstoreId,effectiveAccountId,productIds,null,null,false,false);
        List<ConnectApi.ProductOverview> productOverviews = productCollection.products;
        return productOverviews;
    }

    @AuraEnabled(cacheable = false)
    public static ConnectApi.ProductDetail getProduct(String communityId, String productId, String effectiveAccountId){
      String webstoreId = resolveCommunityIdToWebstoreId(communityId);
      
      ConnectApi.ProductDetail productDetail = ConnectApi.CommerceCatalog.getProduct(
        webstoreId,
        productId,
        effectiveAccountId,
        null, false, null, false, false, false);
      
      return productDetail;
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