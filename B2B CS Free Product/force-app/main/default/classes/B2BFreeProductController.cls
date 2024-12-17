public with sharing class B2BFreeProductController {
    public B2BFreeProductController() {

    }

    @AuraEnabled
    public static List<CartItem> getCartItems(String cartId){
        List<CartItem> cartItems = [
            SELECT Id, Name, Quantity, TotalPrice, TotalAmount, TotalLineAmount, Manual_Adjustment__c
            FROM CartItem
            WHERE CartId = :cartId
            ORDER BY CreatedDate DESC
        ];

        return cartItems;
    }

    @AuraEnabled
    public static void setFree(String cartItemId){
        CartItem ci = [
            SELECT Id, TotalPrice, TotalAmount, TotalLineAmount, Manual_Adjustment__c 
            FROM CartItem
            WHERE Id = :cartItemId
        ];
        ci.TotalPrice = 0.0;
        ci.TotalLineAmount = 0.0;
        ci.SalesPrice = 0.0;
        update ci;
    }

    @AuraEnabled
    public static void applyPercentageDiscount(String cartItemId, String discount){
        CartItem ci = [
            SELECT Id, TotalPrice, TotalAmount, TotalLineAmount, Manual_Adjustment__c
            FROM CartItem
            WHERE Id = :cartItemId
        ];
        Decimal disc = decimal.valueOf(discount);
        ci.TotalPrice = ci.TotalPrice - ci.TotalPrice * disc;
        ci.TotalLineAmount = ci.TotalPrice;
        ci.SalesPrice = ci.TotalPrice;
        ci.Manual_Adjustment__c = (decimal.valueOf(discount)*100) + '%';
        update ci;
    }

    @AuraEnabled
    public static void applyDiscount(String cartItemId, String discount, String discountType, String currencyIsoCode){
        CartItem ci = [
            SELECT Id, TotalPrice, TotalAmount, TotalLineAmount, Manual_Adjustment__c
            FROM CartItem
            WHERE Id = :cartItemId
        ];
        if (discountType == 'percent') {
            Decimal disc = decimal.valueOf(discount)/100;
            ci.TotalPrice = ci.TotalPrice - ci.TotalPrice * disc;
            ci.TotalLineAmount = ci.TotalPrice;
            ci.SalesPrice = ci.TotalPrice;
            ci.Manual_Adjustment__c = decimal.valueOf(discount) + '%';
        } else {
            Decimal disc = decimal.valueOf(discount);
            ci.TotalPrice = ci.TotalPrice - disc;
            ci.TotalLineAmount = ci.TotalPrice;
            ci.SalesPrice = ci.TotalPrice;
            ci.Manual_Adjustment__c = discount + ' ' + currencyIsoCode;
        }
        update ci;
    }
    
    /*
    @AuraEnabled
    public static Map<String, Object> getLoggedAsDetails() {
    
        Map<String, Object> detailsMap = new Map<String, Object>();

        List<SetupAuditTrail> sat = [
            SELECT CreatedById,Display
            FROM SetupAuditTrail
            WHERE Action = 'suNetworkAdminLogin'
            ORDER BY CreatedDate DESC
        ];
        detailsMap.put('SetupAuditTrail', sat);

        User oUser = [select id,Name FROM User Where id =: userInfo.getUserId()];
        
        detailsMap.put('user', oUser);

        return detailsMap;

    }
    */

    @AuraEnabled
    public static Boolean isLoggedOnBehalf() {
        Map<String, String> session = Auth.SessionManagement.getCurrentSession();
        return session.get('UserType') == 'Standard' &&
               session.get('SourceIp') == '::' && 
               session.get('LoginType') == null;
    }
    
    @AuraEnabled
    public static Map<String, String> getCurrentSession(){
        Map<String, String> session = Auth.SessionManagement.getCurrentSession();
        return session;
    }

}
