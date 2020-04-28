import { LightningElement, api, track, wire } from 'lwc';
import getInstagramPosts from '@salesforce/apex/otInstagramFeedController.getInstagramPosts';
import getInstagramHashTags from '@salesforce/apex/otInstagramFeedController.getInstagramHashTags';
import { refreshApex } from '@salesforce/apex';
import { isEmpty, reduceErrors, parseData, isExpires } from 'c/otInstagramFeedUtils';

export default class otInstagramFeed extends LightningElement {

    @api title;
    @api username;
    @api hashtag;

    @track _username;
    @track _hashtag;

    @track hasConfig = false;
    @track info = {};
    @track photos = [];
    
    @track isLoading = false;
    @track hasError = false;
    @track errorMsg = '';

    _wiredInstagramPosts;
    @wire(getInstagramPosts, { username: '$_username' })
    wiredInstagramPosts({ error, data }) {
        if (error) {
            const errorMsg = reduceErrors(error).join(', ');
            this.hasError = true;
            this.errorMsg = errorMsg;
        } else if (data) {
            this._wiredInstagramPosts = data;
            const { info, photos } = parseData(data);
            this.info = info;
            this.photos = photos;
            if (isExpires()) {
                refreshApex(this._wiredInstagramPosts);
            }
        }
        this.isLoading = false;
    }

    _wiredInstagramHashTags;
    @wire(getInstagramHashTags, { hashtag: '$_hashtag' })
    wiredInstagramHashTags({ error, data }) {
        if (error) {
            const errorMsg = reduceErrors(error).join(', ');
            this.hasError = true;
            this.errorMsg = errorMsg;
        } else if (data) {
            this._wiredInstagramHashTags = data;
            const { info, photos } = parseData(data);
            this.info = info;
            this.photos = photos;
            if (isExpires()) {
                refreshApex(this._wiredInstagramHashTags);
            }
        }
        this.isLoading = false;
    }

    /* Class/Styles props */
    get wrapperClass() {
        let c = 'ot-instagram-feed slds-card';

        c += this.isNarrowCol ? ' narrow' : '';

        return c;
    }

    get isNarrowCol() {
        const wrapper = this.template.firstChild;
        if (wrapper && wrapper.clientWidth < 576) {
            return true;
        }
        return false;
    }

    /* other props */
    get componentTitle() {
        if (!isEmpty(this.title)) {
            return this.title;
        }
        return (this.info && this.info.full_name) ? this.info.full_name : '';
    }

    get isHashtagType() {
        return isEmpty(this.username) && !isEmpty(this.hashtag);
    }

    connectedCallback() {
        this.hasConfig = false;

        if (!isEmpty(this.username)) {
            this._username = this.username;
            this.isLoading = true;
            this.hasConfig = true;
        }
        else if (!isEmpty(this.hashtag)) {
            this._hashtag = this.hashtag;
            this.isLoading = true;
            this.hasConfig = true;
        }
    }

}