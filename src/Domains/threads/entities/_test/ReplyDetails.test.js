const ReplyDetails = require('../ReplyDetails');

describe('a ReplyDetails entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
        };

        // Action and Assert
        expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            content: 'Hai, apa kabar',
            date: '2021-08-08T07:19:09.775Z',
            username: [],
        };

        // Action and Assert
        expect(() => new ReplyDetails(payload)).toThrowError(
            'REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should create ReplyDetails object correctly', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'Hai, apa kabar',
            date: '2021-08-08T07:19:09.775Z',
            username: 'dicoding',
        };

        // Action
        const { id, content, date, username } = new ReplyDetails(payload);

        // Assert
        expect(id).toEqual(payload.id);
        expect(content).toEqual(payload.content);
        expect(date).toEqual(payload.date);
        expect(username).toEqual(payload.username);
    });
});