import React from 'react';
import Layout from '../components/Layout';

const CirclePage: React.FC = () => {
  return (
    <Layout>
      <section className="community-coming-soon">
        <div className="community-coming-soon-inner">
          <div className="community-coming-soon-icon">
            <i className="fas fa-users" />
          </div>
          <h1>Community</h1>
          <p className="community-coming-soon-date">Coming June 24th</p>
          <p className="community-coming-soon-text">
            We're switching to a new platform to better serve our community.
            Stay tuned — something wonderful is on the way.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default CirclePage;
