/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const CommentDetail = require('../../Domains/threads/comment/entities/CommentDetail');
const ReplyDetail = require('../../Domains/threads/reply/entities/ReplyDetail');
const GetThreadDetail = require('../../Domains/threads/thread/entities/GetThreadDetail');
const ThreadDetail = require('../../Domains/threads/thread/entities/ThreadDetail');

class GetThreadDetailUseCase {
    constructor({
        threadRepository,
        commentRepository,
        replyRepository,
        likeRepository,
    }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
        this._likeRepository = likeRepository;
    }

    async execute(useCasePayload) {
        const getThreadDetail = new GetThreadDetail(useCasePayload);

        await this._threadRepository.verifyThreadExist(useCasePayload.threadId);

        const threadDetails = await this._threadRepository.getThreadDetailById(
            getThreadDetail,
        );
        const threadComments =
            await this._commentRepository.getCommentsByThreadId(
                getThreadDetail,
            );
        const threadReplies = await this._replyRepository.getRepliesByThreadId(
            getThreadDetail,
        );
        const likeCounts = await this._likeRepository.getLikeCountsByThreadId(
            getThreadDetail,
        );
        threadDetails.comments = this._getCommentAndReplies(
            threadComments,
            threadReplies,
            likeCounts,
        );

        return new ThreadDetail(threadDetails);
    }

    _getCommentAndReplies(comments, replies, likeCounts) {
        return comments.map((comment) => {
            const like = likeCounts.find(
                (likeCount) => likeCount.comment_id === comment.id,
            );

            comment.likeCount = like !== undefined ? like.like_count : 0;

            comment.replies = replies
                .filter((reply) => reply.comment_id === comment.id)
                .map((reply) => new ReplyDetail(reply));

            return new CommentDetail(comment);
        });
    }
}

module.exports = GetThreadDetailUseCase;
