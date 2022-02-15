/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const CommentDetails = require('../../Domains/threads/comment/entities/CommentDetails');
const ReplyDetails = require('../../Domains/threads/reply/entities/ReplyDetails');
const GetThreadDetails = require('../../Domains/threads/thread/entities/GetThreadDetails');
const ThreadDetails = require('../../Domains/threads/thread/entities/ThreadDetails');

class GetThreadDetailsUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload) {
        const getThreadDetails = new GetThreadDetails(useCasePayload);

        await this._threadRepository.verifyThreadExist(useCasePayload.threadId);

        const threadDetails = await this._threadRepository.getThreadDetailsById(getThreadDetails);
        const threadComments = await this._commentRepository.getCommentsByThreadId(getThreadDetails);
        const threadReplies = await this._replyRepository.getRepliesByThreadId(getThreadDetails);

        threadDetails.comments = this._getCommentAndReplies(threadComments, threadReplies);

        return new ThreadDetails(threadDetails);
    }

    _getCommentAndReplies(comments, replies) {
        const commentDetails = [];
        for (let i = 0; i < comments.length; i += 1) {
            const commentId = comments[i].id;

            comments[i].date = `${comments[i].date}`;
            comments[i].replies = replies.reduce((filtered, reply) => {
                if (reply.comment_id === commentId) {
                    reply.date = `${reply.date}`;
                    filtered.push(new ReplyDetails(reply));
                    return filtered;
                } else {
                    return filtered;
                }
            }, []);

            commentDetails.push(new CommentDetails(comments[i]));
        }

        return commentDetails;
    }
}

module.exports = GetThreadDetailsUseCase;
