public with sharing class otInstagramFeedController {
    private static String instagramUrl = 'https://www.instagram.com/';
    private static String instagramTagUrl = 'https://www.instagram.com/explore/tags/';
    
	@AuraEnabled(cacheable=true)
    public static String getInstagramPosts(String username) {
        String accessToken;
        try {
            if (String.isNotBlank(accessToken)) {
                // TODO: implement API
            }
            String results = scrapingInstagramPosts(username);
            return results;
        } catch (Exception e) {
            throw e;
        }
    }
    
	@AuraEnabled(cacheable=true)
    public static String getInstagramHashTags(String hashtag) {
        String accessToken;
        try {
            if (String.isNotBlank(accessToken)) {
                // TODO: implement API
            }
            String results = scrapingInstagramHashTags(hashtag);
            return results;
        } catch (Exception e) {
            throw e;
        }
    }
    
    private static String scrapingInstagramPosts(String username) {
        String requestUrl = instagramUrl + username + '/';
        
        HttpRequest req = new HttpRequest();
		req.setEndpoint(requestUrl);
        req.setMethod('GET');
        
        String acceptLanguage = UserInfo.getLanguage().replace('_', '-');
        req.setHeader('Accept-Language', acceptLanguage);
        req.setHeader('Cache-Control', 'max-age=7200'); // cache 2-hours
        req.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36');
        req.setTimeout(120000);//ms
        
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            try {
                
                String response = res.getBody();
                otInstagramFeedHelper parser = new otInstagramFeedHelper();
                String scriptTag = '<script type="text/javascript">';
                List<String> dataElement = new List<String>{scriptTag};
                List<Map<String,List<String>>> scripts = parser.parse(response, 'body', dataElement, null, null);
                System.debug('@@@ Object: ' + scripts);
                if (scripts.size() == 1) {
                    List<String> dataValues = scripts[0].get(scriptTag);
                    if (dataValues.size() == 1) {
                        String data = dataValues[0];
                        data = data.replace('window._sharedData = ', '').replace(';', '');
                        System.debug(data);
                        System.debug(JSON.deserializeUntyped(data));
                        return data;
                    }
                }
                throw new AuraHandledException('Could not fetch instagram posts.');
            } catch (Exception e) {
                System.debug('Error when parsing HTML');
                System.debug(e.getMessage());
                throw new AuraHandledException('Could not fetch instagram posts.');
            }
        } else {
            String errorMsg = 'Could not fetch instagram posts. Error status ' + res.getStatus();
            throw new AuraHandledException(errorMsg);
        }
    }

    private static String scrapingInstagramHashTags(String hashtag) {
        String requestUrl = instagramTagUrl + hashtag + '/';
        
        HttpRequest req = new HttpRequest();
		req.setEndpoint(requestUrl);
        req.setMethod('GET');
        
        String acceptLanguage = UserInfo.getLanguage().replace('_', '-');
        req.setHeader('Accept-Language', acceptLanguage);
        req.setHeader('Cache-Control', 'max-age=7200'); // cache 2-hours
        req.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36');
        req.setTimeout(120000);//ms
        
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            try {
                
                String response = res.getBody();
                otInstagramFeedHelper parser = new otInstagramFeedHelper();
                String scriptTag = '<script type="text/javascript">';
                List<String> dataElement = new List<String>{scriptTag};
                List<Map<String,List<String>>> scripts = parser.parse(response, 'body', dataElement, null, null);
                System.debug('@@@ Object: ' + scripts);
                if (scripts.size() == 1) {
                    List<String> dataValues = scripts[0].get(scriptTag);
                    if (dataValues.size() == 1) {
                        String data = dataValues[0];
                        data = data.replace('window._sharedData = ', '').replace(';', '');
                        System.debug(data);
                        System.debug(JSON.deserializeUntyped(data));
                        return data;
                    }
                }
                throw new AuraHandledException('Could not fetch instagram posts.');
            } catch (Exception e) {
                System.debug('Error when parsing HTML');
                System.debug(e.getMessage());
                throw new AuraHandledException('Could not fetch instagram posts.');
            }
        } else {
            String errorMsg = 'Could not fetch instagram posts. Error status ' + res.getStatus();
            throw new AuraHandledException(errorMsg);
        }
    }
    
}