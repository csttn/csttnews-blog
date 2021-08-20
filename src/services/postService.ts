import { apiLoadPost } from './api';
export const loadPostsService = async (nextPageUrl?: string) => {
  const token =
    'MC5ZT1JucWhFQUFDMEFKQ2xG.DO-_ve-_ve-_ve-_ve-_ve-_ve-_vUFA77-977-9Bj1E77-9Xi4EaAfvv71re--_ve-_vTce77-977-9ee-_vQ';

  const url = `${nextPageUrl}&access_token=${token}`;

  const { data } = await apiLoadPost.get(url);

  const { next_page, results } = data;

  const postsData = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    postsData,
    next_page,
  };
};
