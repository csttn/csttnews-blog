import { Spinner } from '@chakra-ui/react';
import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { loadPostsService } from '../services/postService';
import { getPrismicClient } from '../services/prismic';
import { PrismicFormatDate } from '../utils/dateFormat';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { next_page, results },
}: HomeProps) {
  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    const { postsData, next_page } = await loadPostsService(nextPage);

    const newPosts = posts.concat(postsData);
    setPosts(newPosts);
    setNextPage(next_page);
    setLoading(false);
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className={styles.container}>
        <div className={styles.postsContainer}>
          {posts.map(post => (
            <div key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <div className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infoGroup}>
                    <div className={styles.dateGroup}>
                      <FiCalendar className={styles.IconCalendar} />
                      <time>
                        {PrismicFormatDate(post.first_publication_date)}
                      </time>
                    </div>
                    <div className={styles.authorGroup}>
                      <FiUser className={styles.IconUser} />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {nextPage && (
          <button className={styles.buttonPosts} onClick={loadPosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    );
  };

  return (
    <>
      <Head>
        <title>Posts | Csttnew</title>
      </Head>

      <Header />

      {loading ? <Spinner size="xl" color="red.500" /> : renderContent()}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 3,
      orderings: '[post.date desc]',
    }
  );
  const next_page = postsResponse.next_page;

  const results = postsResponse.results.map(post => {
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
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
