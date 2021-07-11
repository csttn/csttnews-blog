import React, { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import { PrismicFormatDate } from '../../utils/dateFormat';

import { RichText } from 'prismic-dom';

import Header from '../../components/Header';
import styles from './post.module.scss';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  uid?: string;
  first_publication_date: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState([]);

  useEffect(() => {
    formatContent();
  }, []);

  function formatContent() {
    const contentFormated = post.data.content.map(contentItem => {
      if (contentItem.body)
        return {
          heading: contentItem.heading,
          body: [{ text: RichText.asHtml(contentItem.body) }],
        };
    });

    setContent(contentFormated);
    setLoading(false);
  }
  return (
    <>
      <Header />

      <div className={styles.postImage}>
        <img src={post.data.banner.url} alt="img" />
      </div>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.infoGroup}>
            <div className={styles.dataInfo}>
              <FiCalendar className={styles.dataIcon} size="20" />
              <span>{PrismicFormatDate(post.first_publication_date)}</span>
            </div>
            <div className={styles.authorInfo}>
              <FiUser className={styles.userIcon} size="20" />
              <span>{post.data.author}</span>
            </div>
            <div className={styles.timeInfo}>
              <FiClock className={styles.clockIcon} size="20" />
              <time>4 min</time>
            </div>
          </div>

          {content.map(postItem => (
            <main key={postItem.heading}>
              <h2>{postItem.heading}</h2>

              {postItem.body.map(body => {
                return (
                  <div
                    key={body}
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: body.text,
                    }}
                  />
                );
              })}
            </main>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 3,
      orderings: '[post.date desc]',
    }
  );

  const slugs = postsResponse.results.map((post, index) => {
    return { slug: post.uid };
  });

  return {
    paths: [
      {
        params: {
          slug: slugs[0].slug,
        },
      },
      {
        params: {
          slug: slugs[1].slug,
        },
      },
      {
        params: {
          slug: slugs[2].slug,
        },
      },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  // const content = response.data.content.map(content => {
  //   return {
  //     heading: content.heading,
  //     body: [RichText.asHtml(content.body)],
  //   };
  // });

  const post = {
    first_publication_date: PrismicFormatDate(response.first_publication_date),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutis
  };
};
