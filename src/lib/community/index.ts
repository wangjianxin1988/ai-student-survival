// 社区模块导出
export * from './types';
export * from './service';
// 仅导出storage中需要的函数，避免updatePost冲突
export { getPosts, getPostById, createPost, deletePost, toggleLike, toggleFavorite, incrementViews } from './storage';
