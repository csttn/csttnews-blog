import React, { useState, useEffect } from 'react';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { PrismicFormatDate } from '../../utils/dateFormat';

import { RichText } from 'prismic-dom';

import Header from '../../components/Header';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

  useEffect(() => {}, []);

  console.log(post);

  // pegar dados curs, formatar e exibir conforme teste

  return (
    <>
      <Header />

      <div className={styles.postImage}>
        <img src={post.data.banner.url} alt="img" />
      </div>
      <main className={styles.container}>
        <article className={styles.post}>
          {post.data.content.map(post => (
            <div key={post.heading}>
              <h1>{post.heading}</h1>

              {post.body.map(body => (
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: body.text,
                  }}
                />
              ))}
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  // mandar dados formatos para o front
  const content = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: [{ text: [RichText.asHtml(content.body)] }],
    };
  });

  const post = {
    first_publication_date: PrismicFormatDate(response.first_publication_date),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutis
  };
};
