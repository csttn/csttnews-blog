import Link from 'next/link';
import React from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { PrismicFormatDate } from '../../utils/dateFormat';
import styles from './postCard.module.scss';

interface PostProps {
  post: {
    uid?: string;
    first_publication_date: string | null;
    data: {
      title: string;
      subtitle: string;
      author: string;
    };
  };
}
const PostCard: React.FC<PostProps> = ({
  post: { uid, data, first_publication_date },
}) => {
  return (
    <Link href={`/post/${uid}`}>
      <div className={styles.post}>
        <h1>{data.title}</h1>
        <p>{data.subtitle}</p>
        <div className={styles.infoGroup}>
          <div className={styles.dateGroup}>
            <FiCalendar className={styles.IconCalendar} />
            <time>{PrismicFormatDate(first_publication_date)}</time>
          </div>
          <div className={styles.authorGroup}>
            <FiUser className={styles.IconUser} />
            <span>{data.author}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { PostCard };
