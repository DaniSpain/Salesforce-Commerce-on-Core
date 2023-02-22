public with sharing class B2BFreeProductController {
    public B2BFreeProductController() {

    }

    @AuraEnabled
    public static List<CartItem> getCartItems(String cartId){
        List<CartItem> cartItems = [
            SELECT Id, Name, Quantity, TotalPrice, TotalAmount, TotalLineAmount
            FROM CartItem
            WHERE CartId = :cartId
            ORDER BY CreatedDate DESC
        ];

        return cartItems;
    }

    @AuraEnabled
    public static void setFree(String cartItemId){
        CartItem ci = [
            SELECT Id, TotalPrice, TotalAmount, TotalLineAmount
            FROM CartItem
            WHERE Id = :cartItemId
        ];
        ci.TotalPrice = 0.0;
        ci.TotalLineAmount = 0.0;
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
