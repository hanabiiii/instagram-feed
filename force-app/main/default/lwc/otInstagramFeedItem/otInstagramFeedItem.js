import { LightningElement, api, track } from 'lwc';
import { isEmpty } from 'c/otInstagramFeedUtils';

export default class otInstagramFeedItem extends LightningElement {

    @track _photo = {};
    @api get photo() {
        return this._photo;
    }
    set photo(value) {
        this._photo = value;
    }

    get sourceSets() {
        let srcset = '';

        srcset += this.photo.thumbnail_resource_150 ? `${this.photo.thumbnail_resource_150} 150w,` : '';
        srcset += this.photo.thumbnail_resource_240 ? `${this.photo.thumbnail_resource_240} 240w,` : '';
        srcset += this.photo.thumbnail_resource_320 ? `${this.photo.thumbnail_resource_320} 320w,` : '';
        srcset += this.photo.thumbnail_resource_480 ? `${this.photo.thumbnail_resource_480} 480w,` : '';

        return srcset;
    }

    get sourceSizes() {
        let sizes = '';

        sizes +=  `(max-width: 575.98px) 150px, (max-width: 767.98px) 240px, (max-width: 991.98px) 320px, 480px`;

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

    get likeCount() {
        if (this.photo && this.photo.edge_liked_by) {
            return this.photo.edge_liked_by.count;
        }
        return 0;
    }

    get isCommentsDisabled() {
        if (this.photo && this.photo.comments_disabled) {
            return this.photo.comments_disabled;
        }
        return false;
    }
    get commentCount() {
        if (this.photo && this.photo.edge_media_to_comment) {
            return this.photo.edge_media_to_comment.count;
        }
        return 0;
    }

    get isVideo() {
        if (this.photo && this.photo.is_video) {
            return this.photo.is_video;
        }
        return false;
    }

    @api placeholderColor;
    @api durationFadeIn = 500;//ms
    @track imageLoaded = false;

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

    handleItemClick(event) {
        event.preventDefault();
        console.log(JSON.parse(JSON.stringify(this._photo)));
        const detail = {
            id: this._photo.id
        };
        const itemClickEvent = new CustomEvent('click', { detail: detail });
        this.dispatchEvent(itemClickEvent);
    }
}