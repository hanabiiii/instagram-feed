@isTest
public class otInstagramFeedControllerTest {

    @IsTest
    public static void testScrapingInstagramPosts() {
        Test.StartTest();
        Test.setMock(HttpCalloutMock.class, new otInstagramCalloutMock());
        String result = otInstagramFeedController.getInstagramPosts('username');
        System.assertNotEquals(null, result);
        Test.StopTest();
    }
    
    public class otInstagramCalloutMock implements HttpCalloutMock{
        public HttpResponse respond(HTTPRequest req){
            HttpResponse res = new HttpResponse();
            res.setStatus('OK');
            res.setStatusCode(200);
            
            res.setBody('<!DOCTYPE html> <html lang="vi" class="no-js not-logged-in client-root"> <head> <meta charset="utf-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <title> Keekihime (@keekicosplay) • Ảnh và video trên Instagram </title> <script type="application/ld+json"> { "@context": "http:\\\\schema.org", "@type": "Person", "name": "Keekihime", "alternateName": "@keekicosplay", "description": "Cosplay only Account. casual stuff @keekihime\nTOKYO based Cosplayer from Austria\n\u30aa\u30fc\u30b9\u30c8\u30ea\u30a2\u51fa\u8eab\u3001\u6771\u4eac\u5728\u4f4f\u30b1\u30fc\u30ad\u59eb\u306e\u30b3\u30b9\u30d7\u30ec\u57a2\u3067\u3059\u3002 \u30e1\u30a4\u30f3\u306f @keekihime", "url": "https:\\\\twitch.tv\\keekihime_live\\", "mainEntityofPage": { "@type": "ProfilePage", "@id": "https:\\\\www.instagram.com\\keekicosplay\\", "interactionStatistic": { "@type": "InteractionCounter", "interactionType": "http:\\\\schema.org\\FollowAction", "userInteractionCount": "3219" } }, "image": "https:\\\\www.instagram.com\\static\\images\\ico\\favicon-200.png\\ab6eff595bb1.png" } </script> <link rel="alternate" href="https://www.instagram.com/keekicosplay/" hreflang="x-default" /> </head> <body class="" style=" background: white; "> <div id="react-root"> <span></span> </div> <script type="text/javascript"> window._sharedData = { "config": { "csrf_token": "T6txq9I2IpejLMKefKV3tdiPVYcPDDmA", "viewer": null, "viewerId": null }, "country_code": "VN", "language_code": "vi", "locale": "vi_VN", "hostname": "www.instagram.com", "is_whitelisted_crawl_bot": false, "deployment_stage": "c2", "platform": "windows_nt_10", "nonce": "ZJH5KpTnxQNIxN3yT/OpYw==", "mid_pct": 0.90727, "zero_data": {}, "cache_schema_version": 3, "server_checks": {}, "device_id": "8CDB8175-A7C3-4757-BECD-DD299712DA25", "encryption": { "key_id": "155", "public_key": "4fd28ee2f38b02707cf2478111e82ed6c3d9fb4e181768d4bc15b6aae1474a45", "version": "6" }, "rollout_hash": "47d586b301ea", "bundle_variant": "es6", "is_canary": true }; </script> <script type="text/javascript"> window.__initialDataLoaded(window._sharedData); </script> </body> </html>');
            
            return res;
        }
    }
}