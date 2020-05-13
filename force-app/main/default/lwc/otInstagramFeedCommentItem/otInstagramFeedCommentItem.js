import { LightningElement, api } from 'lwc';
import { isEmpty } from 'c/otInstagramFeedUtils';

export default class otInstagramFeedCommentItem extends LightningElement {
    @api comment = {};
    @api text = '';

    get commentText() {
        if (isEmpty(this.text)) {
            return this.comment.text;
        }
        return this.text;
    }

    get isCommentEmpty() {
        return isEmpty(this.commentText);
    }
}