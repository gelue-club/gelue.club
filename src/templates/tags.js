import React from 'react';
import PropTypes from 'prop-types';
import { Link, graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm } from '../utils/typography';

const Tags = ({
  pageContext,
  data: {
    allMarkdownRemark,
    site: { siteMetadata },
  },
  location,
}) => {
  const { tag } = pageContext;
  const { edges, totalCount } = allMarkdownRemark;

  const tagHeader = `"${tag}" 印象下有 ${totalCount} 个动态`;

  return (
    <Layout location={location} title={siteMetadata.title}>
      <SEO title={`印象 \`${siteMetadata.title}\``} />
      <h1>{tagHeader}</h1>

      {edges.map(({ node }) => {
        const { slug } = node.fields;
        const { title, date, description } = node.frontmatter;
        return (
          <article key={slug}>
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={slug}>
                  {title}
                </Link>
              </h3>
              <small>{date}</small>
            </header>

            <section>
              <p
                dangerouslySetInnerHTML={{
                  __html: description || node.excerpt,
                }}
              />
            </section>
          </article>
        );
      })}

      <Link className="checkAllTags" to="/tags">
        ← 所有印象
      </Link>
    </Layout>
  );
};

Tags.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
            }),
            fields: PropTypes.shape({
              slug: PropTypes.string.isRequired,
            }),
          }),
        }).isRequired
      ),
    }),
  }),
};

export default Tags;
export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            description
            date(formatString: "MMMM DD, YYYY", locale: "zh-cn")
          }
        }
      }
    }
  }
`;
