import postModel from '../Models/postModel.js';
import mongoose from 'mongoose';
import UserModel from "../Models/userModel.js";
import { createNotification } from './NotificationController.js';
import imagekit from '../config/imagekit.js';

// ImageKit auth params for client-side upload
export const imagekitAuth = (req, res) => {
    try {
        const authParams = imagekit.getAuthenticationParameters();
        res.status(200).json({
            ...authParams,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY
        });
    } catch (error) {
        res.status(500).json(error);
    }
}

// Create new post
export const createPost = async (req, res) => {
    try {
        let image = req.body.image;
        let imageFileId = req.body.imageFileId;

        if (req.file) {
            const result = await imagekit.upload({
                file: req.file.buffer,
                fileName: req.file.originalname,
                folder: '/posts'
            });
            image = result.url;
            imageFileId = result.fileId;
        }

        const newPost = new postModel({
            ...req.body,
            ...(image && { image }),
            ...(imageFileId && { imageFileId }),
        });

        await newPost.save();
        res.status(200).json(newPost);
    } catch (error) {
        res.status(500).json(error);
    }
}


// get a post
export const getPost = async (req, res) => {
    const id = req.params.id

    try {
        const post = await postModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}


//Update a Post
export const updatePost = async (req, res) => {
    const postId = req.params.id

    const { userId } = req.body

    try {
        const post = await postModel.findById(postId)
        if (post.userId === userId) {
            if (req.body.imageFileId && post.imageFileId && req.body.imageFileId !== post.imageFileId) {
                try {
                    await imagekit.deleteFile(post.imageFileId);
                } catch (err) {
                    console.error('ImageKit delete failed on update:', err.message);
                }
            }
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}



// delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;

    const { userId, _id } = req.body;
    const requestUserId = userId || _id;

    try {
        const post = await postModel.findById(id);
        if (post.userId === requestUserId) {
            if (post.imageFileId) {
                try {
                    await imagekit.deleteFile(post.imageFileId);
                } catch (err) {
                    console.error('ImageKit delete failed:', err.message);
                }
            }
            await post.deleteOne();
            res.status(200).json("Post deleted Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Like/Dislike a Post

export const like_dislike_Post = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            await createNotification({
                recipientId: post.userId,
                senderId: userId,
                type: 'like',
                postId: post._id.toString(),
                text: 'liked your post'
            });
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Comment on a post
export const commentPost = async (req, res) => {
    const id = req.params.id;
    const { userId, name, text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json("Comment cannot be empty.");
    }

    try {
        const post = await postModel.findById(id);
        const comment = {
            userId,
            name,
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(200).json(post.comments[post.comments.length - 1]);
    } catch (error) {
        res.status(500).json(error);
    }
}


// Get timeline a Posts
export const timeline = async (req, res) => {
    const userId = req.params.id;

    try {
        const currenUserPosts = await postModel.find({ userId: userId });
        const followingUserPosts = await UserModel.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "following",
                        foreignField: "userId",
                        as: "followingUserPosts"
                    }
                },
                {
                    $project: {
                        followingUserPosts: 1,
                        _id: 0
                    }
                }
            ]
        )

        res.status(200).json(currenUserPosts.concat(...(followingUserPosts[0]?.followingUserPosts || [])).sort((a, b) => {
            return b.createdAt - a.createdAt;
        })
        );


    } catch (error) {
        res.status(500).json(error)
    }
}
