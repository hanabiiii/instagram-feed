import { LightningElement, api, track } from 'lwc';
import { isEmpty, reduceErrors } from 'c/otInstagramFeedUtils';

export default class otInstagramFeedItemModal extends LightningElement {

    @api info = {};

    @track _photo = {};
    @api get photo() {
        return this._photo;
    }
    set photo(value) {
        this._photo = value;
    }
    @track photoInfo = {};

    @track showModal = false;
    @track isLoading = false;
    @track photoInfoLoaded = false;

    @track hasError = false;
    @track errorMsg;


    get modalClass() {
        let c = 'feed-item-modal slds-modal';

        if (this.showModal) {
            c += ' slds-fade-in-open';
        } else {
            c += ' slds-fade-in-close';
        }
        return c;
    }
    get backdropClass() {
        let c = 'slds-backdrop';

        if (this.showModal) {
            c += ' slds-backdrop_open';
        } else {
            c += ' slds-backdrop_close';
        }
        return c;
    }

    get isPhotoEmpty() {
        return isEmpty(this.photo);
    }

    // image properties
    @track placeholderColor;
    @track durationFadeIn = 500;//ms
    @track imageLoaded = false;

    get sourceSets() {
        let srcset = '';

        srcset += this.photo.thumbnail_resource_150 ? `${this.photo.thumbnail_resource_150} 150w,` : '';
        srcset += this.photo.thumbnail_resource_240 ? `${this.photo.thumbnail_resource_240} 240w,` : '';
        srcset += this.photo.thumbnail_resource_320 ? `${this.photo.thumbnail_resource_320} 320w,` : '';
        srcset += this.photo.thumbnail_resource_480 ? `${this.photo.thumbnail_resource_480} 480w,` : '';
        srcset += this.photo.thumbnail_resource_640 ? `${this.photo.thumbnail_resource_640} 640w,` : '';

        return srcset;
    }
    get sourceSizes() {
        let sizes = '';

        sizes +=  `(max-width: 575.98px) 240px, (max-width: 767.98px) 320px, (max-width: 991.98px) 480px, 640px`;

        return sizes;
    }
    get defaultSrc() {
        let src = '';

        if (!isEmpty(this.photo.thumbnail_resource_640)) src = this.photo.thumbnail_resource_640;
        else if (!isEmpty(this.photo.thumbnail_resource_480)) src = this.photo.thumbnail_resource_480;
        else if (!isEmpty(this.photo.thumbnail_resource_320)) src = this.photo.thumbnail_resource_320;
        else if (!isEmpty(this.photo.thumbnail_resource_240)) src = this.photo.thumbnail_resource_240;
        else if (!isEmpty(this.photo.thumbnail_resource_150)) src = this.photo.thumbnail_resource_150;
        else src = this.photo.thumbnail_src

        return src;
    }

    get imageStyle() {
        let style = '';
        style += `opacity: ${(this.imageLoaded ? 1 : 0)};`;
        style += this.transitionDelay;
        return style;
    }
    get imagePlaceholderWrapperStyle() {
        let style = 'position: absolute; top: 0; bottom: 0; right: 0; left: 0;';
        style += `opacity: ${(this.imageLoaded ? 0 : 1)};`;
        style += this.transitionDelay;
        return style;
    }
    get imagePlaceholderBackgroundColorStyle() {
        let style = 'height: 100%; width: 100%;';
        style += `background-color: ${(isEmpty(this.placeholderColor) ? 'lightgray' : this.placeholderColor)};`;
        return style;
    }
    get transitionDelay() {
        let style = '';
        style += `transition: opacity ${(this.durationFadeIn > 0 ? this.durationFadeIn + 'ms' : 'none')};`;
        style += `transition-delay: ${(this.durationFadeIn > 0 ? this.durationFadeIn + 'ms' : 'none')};`;
        return style;
    }

    handleImageLoaded() {
        this.imageLoaded = true;
    }
    handleOnError(error) {
        this.imageLoaded = true;
        console.log('load error', {...error});
    }

    @api
    show(photo) {
        this.showModal = true;
        if (photo) {
            this.photo = photo;
        }
        this.handleGetPhotoInfo();
    }

    /** Hide the modal */
    @api
    hide() {
        this.showModal = false;
        this.resetData();
    }

    async handleGetPhotoInfo() {
        if (this.photo && this.photo.id) {
            // this.isLoading = true;

            /**
             * TODO: get photo info
             */
            this.photoInfoLoaded = true;
        }
    }

    handleErrors(error) {
        const errorMsg = reduceErrors(error).join(', ');
        this.hasError = true;
        this.errorMsg = errorMsg;
        this.isLoading = false;
    }

    resetData() {
        this.isLoading = false;
        this.hasError = false;
        this.errorMsg = '';

        this.photo = {};
        this.photoInfo = {};
        this.photoInfoLoaded = false;

        this.imageLoaded = false;
    }
}