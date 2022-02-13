class ReplyDetails {
    constructor(payload) {
        this._verifyPayload(payload);

        this.id = payload.id;
        this.content = payload.content;
        this.date = payload.date;
        this.username = payload.username;
    }

    _verifyPayload({ id, content, date, username }) {
        if (!id || !content || !date || !username) {
            throw new Error('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (
            typeof id !== 'string' ||
            typeof content !== 'string' ||
            typeof date !== 'string' ||
            typeof username !== 'string'
        ) {
            throw new Error('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = ReplyDetails;