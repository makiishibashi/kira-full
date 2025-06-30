import { useContext } from 'react';
import { PostsContext } from '../contexts/PostsContext';

export const usePosts = () => {
  return useContext(PostsContext);
};