import React, { useState } from 'react';

import Head from 'next/head';
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { PrismicFormatDate } from '../utils/dateFormat';

import Header from '../components/Header';
import styles from './home.module.scss';

import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

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
  async function loadPosts() {
    setLoading(true);
    const token =
      'MC5ZT1JucWhFQUFDMEFKQ2xG.DO-_ve-_ve-_ve-_ve-_ve-_ve-_vUFA77-977-9Bj1E77-9Xi4EaAfvv71re--_ve-_vTce77-977-9ee-_vQ';
    const url = `${nextPage}&access_token=${token}`;

    await fetch(url)
      .then(response => {
        response.json().then(data => {
          const { next_page, results } = data;

          const postsPagination = results.map(post => {
            return {
              slug: post.uid,
              first_publication_date: PrismicFormatDate(
                post.first_publication_date
              ),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });

          const newPosts = posts.concat(postsPagination);
          setPosts(newPosts);
          setNextPage(next_page);
        });
      })
      .catch(error => {
        return console.log(error);
      });
  }

  return (
    <>
      <Head>
        <title>Posts | Csttnew</title>
      </Head>

      <Header />

      <main className={styles.container}>
        <div className={styles.postsContainer}>
          {posts.map(post => (
            <a key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <div className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infoGroup}>
                    <div className={styles.dateGroup}>
                      <FiCalendar />
                      <time>{post.first_publication_date}</time>
                    </div>
                    <div className={styles.authorGroup}>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </a>
          ))}
        </div>
        {nextPage && (
          <button className={styles.buttonPosts} onClick={loadPosts}>
            Carregar mais posts
          </button>
        )}
      </main>
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
      first_publication_date: PrismicFormatDate(post.first_publication_date),
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
