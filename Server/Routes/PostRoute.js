import express from 'express';
import multer from 'multer';
import { commentPost, createPost, deletePost, getPost, like_dislike_Post, timeline, updatePost, imagekitAuth } from '../Controllers/PostController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/imagekit/auth', imagekitAuth);
router.post('/', upload.single('image'), createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like_dislike', like_dislike_Post);
router.put('/:id/comment', commentPost);
router.get('/:id/timeline', timeline);

export default router;
