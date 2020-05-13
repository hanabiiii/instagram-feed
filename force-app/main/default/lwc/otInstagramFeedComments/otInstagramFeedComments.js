import { LightningElement, api, track } from 'lwc';
import { isEmpty, reduceErrors } from 'c/otInstagramFeedUtils';

export default class otInstagramFeedComments extends LightningElement {

    @api showCaption = false;
    @api caption = '';


    @api info = {};

    connectedCallback() {
        //
    }

}