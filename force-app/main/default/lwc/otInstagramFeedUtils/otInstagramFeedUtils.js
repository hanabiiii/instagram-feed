/**
 * Checks if the object is empty.
 * An empty object's value is undefined, null, an empty array, or empty string. An object with no native
 * properties is not considered empty.
 *
 * @param {Object} obj The object to check for.
 * @returns {Boolean} True if the object is empty, or false otherwise.
 */
export function isEmpty(obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    }
    if (Array.isArray(obj)) {
        return obj.length === 0;
    } else if (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
        return Object.keys(obj).length === 0;
    }
    return false;
};

/**
 * Reduce errors from Apex callback.
 *
 * @param {Object} obj The object to check for.
 * @returns {Array} String array of the error messages.
 */
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
        .filter(error => !!error)
        .map(error => {
            if (Array.isArray(error.body)) {
                return error.body.map(e => e.message);
            }
            else if (error.body && typeof error.body.message === 'string') {
                return error.body.message;
            }
            else if (typeof error.message === 'string') {
                return error.message;
            }
            return error.statusText;
        })
        .reduce((prev, curr) => prev.concat(curr), [])
        .filter(message => !!message)
    );
}

export function parseData(data) {
    let info = {};
    let photos = [];

    let parsed = {};
    try {
        parsed = JSON.parse(data);
    } catch (err) {
        console.log('err parse data', err);
    }
    if (parsed && parsed.entry_data) {
        // page
        if (parsed.entry_data.ProfilePage && parsed.entry_data.ProfilePage[0]) {
            const { user } = parsed.entry_data.ProfilePage[0].graphql;

            info = {
                id: user.id,
                full_name: user.full_name,
                biography: user.biography,
                count: user.edge_owner_to_timeline_media.count,
                edge_followed_by: user.edge_followed_by.count,
                edge_follow: user.edge_follow.count,
                profile_pic_url: user.profile_pic_url,
                profile_pic_url_hd: user.profile_pic_url_hd,
                username: user.username,
            }

            const timelineMedia = user.edge_owner_to_timeline_media.edges || [];
            for (let index = 0; index < timelineMedia.length; index++) {
                let node = createPostNode(timelineMedia[index].node);

                photos.push(node);
            }
        }
        // hashtag
        else if (parsed.entry_data.TagPage && parsed.entry_data.TagPage[0]) {
            const { hashtag } = parsed.entry_data.TagPage[0].graphql;

            info = {
                id: hashtag.id,
                full_name: hashtag.name,
                biography: hashtag.biography,
                profile_pic_url: hashtag.profile_pic_url,
                count: hashtag.edge_hashtag_to_media.count || 0
            }

            let relatedTags = [];
            let related_tag_edges = hashtag.edge_hashtag_to_related_tags.edges ? hashtag.edge_hashtag_to_related_tags.edges : [];
            for (let index = 0; index < related_tag_edges.length; index++) {
                const edge = hashtag.edge_hashtag_to_related_tags.edges[index];
                relatedTags.push({ id: index, label: edge.node.name});
            }
            info.related_tags = relatedTags;

            const hashtagMedia = hashtag.edge_hashtag_to_media.edges || [];
            for (let index = 0; index < hashtagMedia.length; index++) {
                
                let node = createPostNode(hashtagMedia[index].node);

                photos.push(node);
            }
        }
    }

    return { info, photos };
}

function createPostNode(nodeData) {
    let node = nodeData || {}

    node.media_type = node.__typename || node.media_type;

    node.caption = (node.edge_media_to_caption.edges || []).map(edge => edge.node.text).join('\n');

    const thumbnail_resource_150 = node.thumbnail_resources.filter(res => res.config_width === 150)[0];
    node.thumbnail_resource_150 = thumbnail_resource_150 ? thumbnail_resource_150.src : '';

    const thumbnail_resource_240 = node.thumbnail_resources.filter(res => res.config_width === 240)[0];
    node.thumbnail_resource_240 = thumbnail_resource_240 ? thumbnail_resource_240.src : '';

    const thumbnail_resource_320 = node.thumbnail_resources.filter(res => res.config_width === 320)[0];
    node.thumbnail_resource_320 = thumbnail_resource_320 ? thumbnail_resource_320.src : '';

    const thumbnail_resource_480 = node.thumbnail_resources.filter(res => res.config_width === 480)[0];
    node.thumbnail_resource_480 = thumbnail_resource_480 ? thumbnail_resource_480.src : '';

    const thumbnail_resource_640 = node.thumbnail_resources.filter(res => res.config_width === 640)[0];
    node.thumbnail_resource_640 = thumbnail_resource_640 ? thumbnail_resource_640.src : '';
    

    return node;
}

export function isExpires() {
    const EXPIRES_KEY = 'ot_ins_feed_expires';

    const expires = localStorage.getItem(EXPIRES_KEY);
    const d = new Date();
    if (!isEmpty(expires)) {
        const isExpires = d.getTime() > parseInt(expires, 0);
        if (isExpires) {
            d.setUTCHours(d.getUTCHours() + 2);
            localStorage.setItem(EXPIRES_KEY, d.getTime());
        }
        return isExpires;
    } else {
        d.setUTCHours(d.getUTCHours() + 2);
        localStorage.setItem(EXPIRES_KEY, d.getTime());
    }
    return false;
}