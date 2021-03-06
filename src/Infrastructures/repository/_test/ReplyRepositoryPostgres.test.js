const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ForbiddenError = require('../../../Commons/exceptions/ForbiddenError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/threads/reply/entities/AddedReply');
const AddReply = require('../../../Domains/threads/reply/entities/AddReply');
const DeleteReply = require('../../../Domains/threads/reply/entities/DeleteReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ReplyRepositoryPostgres', () => {
    beforeAll(async () => {
        await UsersTableTestHelper.addUser({});
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await UsersTableTestHelper.cleanTable();
        await pool.end();
    });

    describe('verifyReplyExist function', () => {
        it('should throw NotFoundError when reply is not exist', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action and Assert
            await expect(
                replyRepositoryPostgres.verifyReplyExist('reply-123'),
            ).rejects.toThrow(NotFoundError);
        });

        it('should not throw NotFoundError when reply is exist', async () => {
            // Arrange
            await ThreadsTableTestHelper.addThread({});
            await CommentsTableTestHelper.addComment({});
            await RepliesTableTestHelper.addReply({});
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action and Assert
            await expect(
                replyRepositoryPostgres.verifyReplyExist({
                    commentId: 'comment-123',
                    replyId: 'reply-123',
                }),
            ).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('addReply function', () => {
        beforeEach(async () => {
            await ThreadsTableTestHelper.addThread({});
            await CommentsTableTestHelper.addComment({});
        });

        it('should persist add reply', async () => {
            // Arrange
            const addReply = new AddReply({
                commentId: 'comment-123',
                content: 'Hai, apa kabar',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123'; // stub
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                fakeIdGenerator,
            );

            // Action
            await replyRepositoryPostgres.addReply(addReply);

            // Assert
            const reply = await RepliesTableTestHelper.findReplyById(
                'reply-123',
            );
            expect(reply).toHaveLength(1);
            expect(reply[0]).toHaveProperty('id', 'reply-123');
            expect(reply[0]).toHaveProperty('comment_id', 'comment-123');
            expect(reply[0]).toHaveProperty('content', 'Hai, apa kabar');
            expect(reply[0]).toHaveProperty('owner', 'user-123');
            expect(reply[0]).toHaveProperty('is_deleted', false);
            expect(reply[0]).toHaveProperty('date');
        });

        it('should return added reply correctly', async () => {
            // Arrange
            const addReply = new AddReply({
                commentId: 'comment-123',
                content: 'Hai, apa kabar',
                owner: 'user-123',
            });

            const fageIdGenerator = () => '123'; // stub
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                fageIdGenerator,
            );

            // Action
            const addedReply = await replyRepositoryPostgres.addReply(addReply);

            // Assert
            expect(addedReply).toStrictEqual(
                new AddedReply({
                    id: 'reply-123',
                    content: 'Hai, apa kabar',
                    owner: 'user-123',
                }),
            );
        });
    });

    describe('getRepliesByThreadId', () => {
        beforeEach(async () => {
            await ThreadsTableTestHelper.addThread({});
            await CommentsTableTestHelper.addComment({});
        });

        it('should return empty replies if there is no replies in the thread', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action
            const replies = await replyRepositoryPostgres.getRepliesByThreadId({
                threadId: 'thread-123',
            });

            // Assert
            expect(replies).toHaveLength(0);
        });

        it('should return replies correctly', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({});

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action
            const replies = await replyRepositoryPostgres.getRepliesByThreadId({
                threadId: 'thread-123',
            });

            // Assert
            expect(replies).toHaveLength(1);
            expect(replies[0]).toHaveProperty('id', 'reply-123');
            expect(replies[0]).toHaveProperty('is_deleted', false);
            expect(replies[0]).toHaveProperty('comment_id', 'comment-123');
            expect(replies[0]).toHaveProperty('content', 'Hai, apa kabar');
            expect(replies[0]).toHaveProperty('username', 'dicoding');
            expect(replies[0]).toHaveProperty('date');
        });
    });

    describe('deleteReplyById function', () => {
        beforeEach(async () => {
            await ThreadsTableTestHelper.addThread({});
            await CommentsTableTestHelper.addComment({});
            await RepliesTableTestHelper.addReply({});
        });
        it('should persist delete reply detail', async () => {
            // Arrange
            const deleteReply = new DeleteReply({
                commentId: 'comment-123',
                replyId: 'reply-123',
                owner: 'user-123',
            });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action and Assert
            await expect(
                replyRepositoryPostgres.deleteReplyById(deleteReply),
            ).resolves.not.toThrow(ForbiddenError);
            const reply = await RepliesTableTestHelper.findReplyById(
                'reply-123',
            );
            expect(reply).toHaveLength(1);
            expect(reply[0]).toHaveProperty('is_deleted', true);
        });

        it('should throw ForbiddenError when the access user is not the owner', async () => {
            // Arrange
            const deleteReply = new DeleteReply({
                commentId: 'comment-123',
                replyId: 'reply-123',
                owner: 'user-124',
            });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {},
            );

            // Action and Assert
            await expect(
                replyRepositoryPostgres.deleteReplyById(deleteReply),
            ).rejects.toThrow(ForbiddenError);
            const reply = await RepliesTableTestHelper.findReplyById(
                'reply-123',
            );
            expect(reply).toHaveLength(1);
        });
    });
});
