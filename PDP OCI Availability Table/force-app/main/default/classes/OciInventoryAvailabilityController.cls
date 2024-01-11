public without sharing class OciInventoryAvailabilityController {
    
    @AuraEnabled
    public static ConnectApi.OCIGetInventoryAvailabilityOutputRepresentation getInventoryAvailability(
        String locationGroupId, String productId
    ) {
        //getting the product SKU used by the OCI
        Product2 prod = [SELECT StockKeepingUnit FROM Product2 WHERE Id = :productId][0];
        String productSKU = prod.StockKeepingUnit;
        
        ConnectApi.OCIGetInventoryAvailabilityInputRepresentation ociInput = new ConnectApi.OCIGetInventoryAvailabilityInputRepresentation();
        ociInput.locationGroupIdentifier = locationGroupId;
        ociInput.stockKeepingUnit = productSKU;
        ConnectApi.OCIGetInventoryAvailabilityOutputRepresentation ociOutput = ConnectApi.OmnichannelInventoryService.getInventoryAvailability(ociInput);
        return ociOutput;
    }
    
    @AuraEnabled
    public static Map<String,String> getLocationNames(String[] locReferences) {
        Map<String,String> retval = new Map<String,String>();
        
        for (integer i=0; i<locReferences.size(); i++) {
            String locRef = locReferences[i];
            String locName = [SELECT Id, Name FROM Location WHERE ExternalReference = :locRef][0].Name;
            retval.put(locRef, locName);
        }
        
        return retval;
    }
}